"use client"

import * as React from "react"
import { ReactNode } from "react"

// Types
export interface AnalysisMetrics {
    wordCount: number
    wpm: number
    fillersCount: number
    pauseCount: number
    duration: number // seconds
    faceDetectedPct: number // 0-100
    smilePct: number // 0-100 placeholder
    eyeContactScore?: number // 0-100
    confidenceScore?: number // 0-100
    emotionTimeline?: { time: number, emotion: string }[] 
}

// Helper function to calculate a composite confidence score
export function calculateConfidenceScore(
    speechMetrics: { wpm: number; fillersCount: number; pauseCount: number },
    eyeContactPct: number
): number {
    const wpmScore = speechMetrics.wpm >= 110 && speechMetrics.wpm <= 160 ? 100 : Math.max(0, 100 - Math.abs(speechMetrics.wpm - 135));
    const normalizedFillers = Math.max(0, 100 - (speechMetrics.fillersCount * 5));
    const normalizedPauses = Math.max(0, 100 - (speechMetrics.pauseCount * 5));
    
    // 0.3 * wpm + 0.25 * eye_contact + 0.25 * filler + 0.2 * pause
    const score = (0.3 * wpmScore) + (0.25 * eyeContactPct) + (0.25 * normalizedFillers) + (0.2 * normalizedPauses);
    return Math.round(score);
}

// Enhanced Speech Analysis Hook with Audio Analysis
export function useSpeechAnalysis(isRecording: boolean) {
    const isRecordingRef = React.useRef(isRecording)
    React.useEffect(() => {
        isRecordingRef.current = isRecording
    }, [isRecording])

    const [transcript, setTranscript] = React.useState("")
    const [interimTranscript, setInterimTranscript] = React.useState("")
    const [metrics, setMetrics] = React.useState<AnalysisMetrics>({
        wordCount: 0,
        wpm: 0,
        fillersCount: 0,
        pauseCount: 0,
        duration: 0,
        faceDetectedPct: 0,
        smilePct: 0,
        emotionTimeline: []
    })

    const recognitionRef = React.useRef<any>(null)
    const startTimeRef = React.useRef<number>(0)

    // Audio Context Refs
    const audioContextRef = React.useRef<AudioContext | null>(null)
    const analyserRef = React.useRef<AnalyserNode | null>(null)
    const streamRef = React.useRef<MediaStream | null>(null)
    const silenceStartRef = React.useRef<number | null>(null)
    const audioLoopRef = React.useRef<number | null>(null)

    const FILLERS: Record<string, string[]> = {
        en: ["um", "uh", "like", "you know", "ah", "hmm", "actually", "basically", "literally", "i mean"],
        hi: ["अं", "मतलब", "वो", "जैसे", "ना", "ठीक है"],
        mr: ["अं", "म्हणजे", "तसं", "काय", "बरं"]
    }

    // 1. Web Audio API for Silence Detection
    const setupAudioAnalysis = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);

            analyser.fftSize = 256;
            analyser.minDecibels = -85;
            analyser.smoothingTimeConstant = 0.8;

            source.connect(analyser);

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;

            detectSilence();
        } catch (e) {
            console.error("Audio Analysis Setup Failed", e);
        }
    }

    const detectSilence = () => {
        if (!analyserRef.current || !isRecording) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const SILENCE_THRESHOLD = 10; // Low heuristic threshold

        if (average < SILENCE_THRESHOLD) {
            if (!silenceStartRef.current) {
                silenceStartRef.current = Date.now();
            } else {
                const duration = Date.now() - silenceStartRef.current;
                // If silence > 1.5s and not already counted (logic requires state toggle for counting once per pause)
                // For MVP simpler logic: we check pauses based on discrete events or just continuous checks? 
                // Let's rely on checking if we JUST crossed the threshold.
            }
        } else {
            // Processing sound
            if (silenceStartRef.current) {
                const silenceDuration = Date.now() - silenceStartRef.current;
                if (silenceDuration > 1500) {
                    setMetrics(prev => ({ ...prev, pauseCount: prev.pauseCount + 1 }));
                }
                silenceStartRef.current = null;
            }
        }

        audioLoopRef.current = requestAnimationFrame(detectSilence);
    }

    // 2. Speech Recognition Logic
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
            if (SpeechRecognition) {
                const reco = new SpeechRecognition()
                reco.continuous = true
                reco.interimResults = true
                reco.lang = 'en-US' // Future: make dynamic

                reco.onresult = (event: any) => {
                    let finalChunk = ""
                    let interimChunk = ""

                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalChunk += event.results[i][0].transcript
                        } else {
                            interimChunk += event.results[i][0].transcript
                        }
                    }

                    if (finalChunk) {
                        const cleanChunk = finalChunk.trim()
                        if (cleanChunk.length > 0) {
                            setTranscript(prev => prev ? `${prev} ${cleanChunk}` : cleanChunk)
                            setInterimTranscript("")
                            analyzeText(cleanChunk, false) // false = final
                        }
                    } else if (interimChunk) {
                        setInterimTranscript(interimChunk)
                        analyzeText(interimChunk, true) // true = interim
                    }
                }

                reco.onerror = (event: any) => {
                    if (event.error !== 'no-speech') {
                        console.error("Speech Recognition Error:", event.error, event.message)
                    }
                    if (event.error === 'not-allowed' || event.error === 'audio-capture') {
                         console.error("Microphone access denied or taken by another process.")
                    }
                }

                reco.onend = () => {
                    if (isRecordingRef.current) {
                        try { reco.start() } catch (e) {}
                    }
                }

                recognitionRef.current = reco
            }
        }
    }, [])

    React.useEffect(() => {
        if (isRecording) {
            setTranscript("")
            setInterimTranscript("")
            setMetrics({
                wordCount: 0,
                wpm: 0,
                fillersCount: 0,
                pauseCount: 0,
                duration: 0,
                faceDetectedPct: 0,
                smilePct: 0,
                emotionTimeline: []
            })
            startTimeRef.current = Date.now()
            currentInterimMaxFillersRef.current = 0

            // Start Speech Reco
            if (recognitionRef.current) {
                try { 
                    recognitionRef.current.start() 
                    console.log("Speech recognition started")
                } catch (e) {
                    console.error("Failed to start speech recognition:", e)
                }
            }

            // Start Audio Analysis (delayed slightly so SpeechReco can capture mic first)
            setTimeout(() => {
                if (isRecording) {
                    setupAudioAnalysis();
                }
            }, 500);

        } else {
            // Stop Speech Reco
            if (recognitionRef.current) {
                try { recognitionRef.current.stop() } catch (e) { }
            }

            // Stop Audio Analysis Loop
            if (audioLoopRef.current) {
                cancelAnimationFrame(audioLoopRef.current);
            }

            // Cleanup Audio Context / Stream
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }

            // Final WPM Calc
            const durationMin = (Date.now() - startTimeRef.current) / 60000
            if (durationMin > 0) {
                setMetrics(prev => ({
                    ...prev,
                    duration: durationMin * 60,
                    wpm: Math.round(prev.wordCount / durationMin)
                }))
            }
        }
    }, [isRecording])

    const currentInterimMaxFillersRef = React.useRef<number>(0)

    const analyzeText = (text: string, isInterim: boolean) => {
        const words = text.trim().split(/\s+/).filter(w => w.length > 0)

        let chunkFillers = 0
        const currentLang = 'en'; // Hardcoded for MVP
        // Added "so" and "well" which are very common hesitations
        const extendedFillers = [...(FILLERS[currentLang] || FILLERS['en']), "so", "well"]

        words.forEach(w => {
            const cleanWord = w.toLowerCase().replace(/[^a-z]/g, "")
            if (extendedFillers.includes(cleanWord)) {
                chunkFillers++
            }
        })

        // Check for multi-word fillers
        const phraseFillers = (text.toLowerCase().match(/you know|i mean/g) || []).length
        chunkFillers += phraseFillers;

        let newlyDetected = 0;

        if (isInterim) {
            if (chunkFillers > currentInterimMaxFillersRef.current) {
                newlyDetected = chunkFillers - currentInterimMaxFillersRef.current;
                currentInterimMaxFillersRef.current = chunkFillers;
            }
        } else {
            // Final chunk
            newlyDetected = Math.max(0, chunkFillers - currentInterimMaxFillersRef.current);
            currentInterimMaxFillersRef.current = 0; // Reset for next phrase
        }

        setMetrics(prev => {
            const newWords = isInterim ? prev.wordCount : prev.wordCount + words.length;
            const newFillers = prev.fillersCount + newlyDetected;
            
            // Calculate real-time WPM
            const durationMin = Math.max(0.1, (Date.now() - startTimeRef.current) / 60000);
            const liveWpm = Math.round((prev.wordCount + (isInterim ? words.length : 0)) / durationMin);

            return {
                ...prev,
                wordCount: newWords, // Don't permanently add words until final
                fillersCount: newFillers, // Do persistently add fillers caught in interim!
                wpm: liveWpm,
                duration: durationMin * 60
            };
        })
    }

    return { transcript, interimTranscript, metrics }
}

// Face and Emotion Detection Hook using face-api.js
import * as faceapi from 'face-api.js';

export function useFaceAnalysis(isRecording: boolean, videoRef: React.RefObject<any>) {
    const [faceStatus, setFaceStatus] = React.useState("Initializing Camera...")
    const [faceMetrics, setFaceMetrics] = React.useState({
        faceVisibleTime: 0,
        faceAbsentTime: 0,
        percentage: 0,
        eyeContactScore: 0, // Alias for percentage in MVP
        emotionTimeline: [] as { time: number, emotion: string }[]
    })

    const loopRef = React.useRef<any>(null)
    const lastTimeRef = React.useRef<number>(0)
    const recordingStartTimeRef = React.useRef<number>(0)

    // 1. Initialize face-api.js models
    React.useEffect(() => {
        const init = async () => {
            try {
                // Load from public/models dir we downloaded
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                    faceapi.nets.faceExpressionNet.loadFromUri('/models')
                ])
                setFaceStatus("Camera Ready")
            } catch (error) {
                console.error("Failed to load Face Models", error)
                setFaceStatus("Detection Error (Using Fallback)")
            }
        };

        init();

        return () => {}
    }, []);

    // 2. Detection Loop
    React.useEffect(() => {
        if (!isRecording || !videoRef.current?.video) {
            if (loopRef.current) {
                clearInterval(loopRef.current)
                loopRef.current = null
            }
            return
        }

        const videoElement = videoRef.current.video
        lastTimeRef.current = performance.now()
        recordingStartTimeRef.current = performance.now()

        const detect = async () => {
            if (videoElement.readyState === 4 && videoElement.currentTime > 0 && !videoElement.paused && !videoElement.ended) {
                try {
                    // Use TinyFaceDetector for performance
                    const detection = await faceapi.detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions()

                    const isFacePresent = !!detection;

                    // Determine max emotion
                    let dominantEmotion = "neutral"
                    if (isFacePresent && detection.expressions) {
                        const sorted = Object.entries(detection.expressions).sort((a, b) => b[1] - a[1]);
                        if (sorted.length > 0) dominantEmotion = sorted[0][0];
                    }

                    // Map face-api emotions to our tracking
                    const emotionMap: Record<string, string> = {
                        happy: "Happy",
                        neutral: "Neutral",
                        sad: "Sad",
                        fearful: "Fear",
                        angry: "Nervous", // Approximation for hackathon
                        disgusted: "Nervous",
                        surprised: "Neutral"
                    }
                    const mappedEmotion = emotionMap[dominantEmotion] || "Neutral"

                    // Update Status UI
                    setFaceStatus(isFacePresent ? `Face Detected (${mappedEmotion})` : "Face Not Visible - Center Yourself")

                    // Update Metrics (Accumulate Time)
                    const now = performance.now()
                    const delta = (now - lastTimeRef.current) / 1000 // seconds
                    lastTimeRef.current = now
                    
                    const timeSec = Math.round((now - recordingStartTimeRef.current) / 1000)

                    setFaceMetrics(prev => {
                        const newVisible = isFacePresent ? prev.faceVisibleTime + delta : prev.faceVisibleTime
                        const newAbsent = !isFacePresent ? prev.faceAbsentTime + delta : prev.faceAbsentTime
                        const total = newVisible + newAbsent
                        const pct = total > 0 ? Math.round((newVisible / total) * 100) : 0
                        
                        // Add emotion to timeline if face is present and it hasn't been added this second
                        const timeline = [...prev.emotionTimeline]
                        if (isFacePresent && (timeline.length === 0 || timeline[timeline.length - 1].time !== timeSec)) {
                             timeline.push({ time: timeSec, emotion: mappedEmotion })
                        }

                        return {
                            ...prev,
                            faceVisibleTime: newVisible,
                            faceAbsentTime: newAbsent,
                            percentage: pct,
                            eyeContactScore: pct,
                            emotionTimeline: timeline
                        }
                    })

                } catch (e) {
                    console.error("Detection error", e)
                }
            }
        };

        // Run detection every 500ms instead of requestAnimationFrame so it's not too heavy on CPU
        loopRef.current = setInterval(detect, 500);

        return () => {
            if (loopRef.current) clearInterval(loopRef.current)
        }

    }, [isRecording])

    return { faceStatus, faceMetrics }
}
