import { SpeechEngine, SpeechEngineConfig, SpeechState } from "./speechEngine";

/**
 * Browser-native Web Speech API implementation.
 * Prioritizes low latency and Hindi support.
 */
export class BrowserSpeechEngine implements SpeechEngine {
    private recognition: SpeechRecognition | null = null;
    private config: SpeechEngineConfig;
    private isListening = false;
    private processingTimer: NodeJS.Timeout | null = null;

    constructor(config: SpeechEngineConfig) {
        this.config = config;

        if (this.isSupported()) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.configureRecognition();
        } else {
            this.config.onStateChange('not-supported');
        }
    }

    private configureRecognition() {
        if (!this.recognition) return;

        this.recognition.continuous = false; // Stop after one utterance for speed
        this.recognition.interimResults = true; // Instant feedback
        this.recognition.lang = this.config.language;
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
            this.isListening = true;
            this.config.onStateChange('listening');
        };

        this.recognition.onend = () => {
            this.isListening = false;
            // Short delay to allow 'processing' state to be visible if needed, 
            // but generally we go back to idle quickly.
            if (this.processingTimer) clearTimeout(this.processingTimer);
            this.config.onStateChange('idle');
        };

        this.recognition.onresult = (event: SpeechRecognitionEvent) => {
            // Cancel any "no speech" timers if we get results
            if (this.processingTimer) clearTimeout(this.processingTimer);
            this.processingTimer = setTimeout(() => {
                // If we stop getting results for a bit, consider processing done
            }, 500); // 500ms silence buffer if needed

            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            // Immediately send whatever we have
            const textToShow = finalTranscript || interimTranscript;
            if (textToShow) {
                this.config.onTranscript(textToShow, !!finalTranscript);
            }
        };

        this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            this.isListening = false;
            if (event.error === 'no-speech') {
                this.config.onStateChange('idle'); // Just silent timeout, no scary error
            } else if (event.error === 'not-allowed') {
                this.config.onError('Microphone access denied');
                this.config.onStateChange('error');
            } else {
                console.warn("Speech recognition error", event.error);
                this.config.onStateChange('error');
            }
        };
    }

    start(): void {
        if (!this.recognition) return;
        if (this.isListening) {
            this.stop();
            return;
        }

        try {
            this.recognition.start();
        } catch (e) {
            console.error("Failed to start recognition", e);
            this.config.onStateChange('error');
        }
    }

    stop(): void {
        if (!this.recognition) return;
        this.recognition.stop();
    }

    abort(): void {
        if (!this.recognition) return;
        this.recognition.abort();
    }

    isSupported(): boolean {
        return typeof window !== 'undefined' &&
            (!!window.SpeechRecognition || !!window.webkitSpeechRecognition);
    }
}
