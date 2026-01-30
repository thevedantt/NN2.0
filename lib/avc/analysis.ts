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
}

// Enhanced Speech Analysis Hook with Audio Analysis
export function useSpeechAnalysis(isRecording: boolean) {
    const [transcript, setTranscript] = React.useState("")
    const [interimTranscript, setInterimTranscript] = React.useState("")
    const [metrics, setMetrics] = React.useState<AnalysisMetrics>({
        wordCount: 0,
        wpm: 0,
        fillersCount: 0,
        pauseCount: 0,
        duration: 0,
        faceDetectedPct: 0,
        smilePct: 0
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
                            analyzeText(cleanChunk)
                        }
                    } else if (interimChunk) {
                        setInterimTranscript(interimChunk)
                    }
                }

                reco.onerror = (event: any) => {
                    // Handle network errors or no-speech gracefully
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
                smilePct: 0
            })
            startTimeRef.current = Date.now()

            // Start Speech Reco
            if (recognitionRef.current) {
                try { recognitionRef.current.start() } catch (e) { }
            }

            // Start Audio Analysis
            setupAudioAnalysis();

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

    const analyzeText = (text: string) => {
        const words = text.trim().split(/\s+/).filter(w => w.length > 0)

        let localFillers = 0
        const currentLang = 'en'; // Hardcoded for MVP, should come from context
        const fillerList = FILLERS[currentLang] || FILLERS['en'];

        words.forEach(w => {
            const cleanWord = w.toLowerCase().replace(/[^a-z]/g, "")
            if (fillerList.includes(cleanWord)) localFillers++
        })

        // Check for multi-word fillers
        const phraseFillers = (text.toLowerCase().match(/you know|i mean/g) || []).length

        setMetrics(prev => ({
            ...prev,
            wordCount: prev.wordCount + words.length,
            fillersCount: prev.fillersCount + localFillers + phraseFillers
        }))
    }

    return { transcript, interimTranscript, metrics }
}

// MediaPipe Face Detection Hook
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision"

export function useFaceAnalysis(isRecording: boolean, videoRef: React.RefObject<any>) {
    const [faceStatus, setFaceStatus] = React.useState("Initializing Camera...")
    const [faceMetrics, setFaceMetrics] = React.useState({
        faceVisibleTime: 0,
        faceAbsentTime: 0,
        percentage: 0
    })

    const faceDetectorRef = React.useRef<FaceDetector | null>(null)
    const loopRef = React.useRef<number | null>(null)
    const lastTimeRef = React.useRef<number>(0)

    // 1. Initialize FaceDetector
    React.useEffect(() => {
        const init = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
                );

                faceDetectorRef.current = await FaceDetector.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO"
                });

                setFaceStatus("Camera Ready")
            } catch (error) {
                console.error("Failed to load FaceDetector", error)
                setFaceStatus("Detection Error (Using Fallback)")
            }
        };

        init();

        return () => {
            // cleanup if needed
        }
    }, []);

    // 2. Detection Loop
    React.useEffect(() => {
        if (!isRecording || !faceDetectorRef.current || !videoRef.current?.video) {
            if (loopRef.current) {
                cancelAnimationFrame(loopRef.current)
                loopRef.current = null
            }
            return
        }

        const videoElement = videoRef.current.video // Access internal video element from react-webcam
        lastTimeRef.current = performance.now()

        const detect = () => {
            if (videoElement.currentTime > 0 && !videoElement.paused && !videoElement.ended) {
                const startTimeMs = performance.now();

                try {
                    const detections = faceDetectorRef.current!.detectForVideo(videoElement, startTimeMs);

                    // Simple logic: If we have > 0 detections, face is present
                    const isFacePresent = detections.detections.length > 0;

                    // Update Status UI
                    setFaceStatus(isFacePresent ? "Face Detected" : "Face Not Visible - Center Yourself")

                    // Update Metrics (Accumulate Time)
                    const now = performance.now()
                    const delta = (now - lastTimeRef.current) / 1000 // seconds
                    lastTimeRef.current = now

                    setFaceMetrics(prev => {
                        const newVisible = isFacePresent ? prev.faceVisibleTime + delta : prev.faceVisibleTime
                        const newAbsent = !isFacePresent ? prev.faceAbsentTime + delta : prev.faceAbsentTime
                        const total = newVisible + newAbsent
                        return {
                            faceVisibleTime: newVisible,
                            faceAbsentTime: newAbsent,
                            percentage: total > 0 ? Math.round((newVisible / total) * 100) : 0
                        }
                    })

                } catch (e) {
                    console.error("Detection error", e)
                }
            }

            loopRef.current = requestAnimationFrame(detect);
        };

        detect();

        return () => {
            if (loopRef.current) cancelAnimationFrame(loopRef.current)
        }

    }, [isRecording, faceDetectorRef.current])

    return { faceStatus, faceMetrics }
}
