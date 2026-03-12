"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Webcam from "react-webcam"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Video, StopCircle, Play, CheckCircle2, AlertCircle, Timer, MoveLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { SCENARIOS } from "@/lib/avc/scenarios"
import { useSpeechAnalysis, useFaceAnalysis, calculateConfidenceScore } from "@/lib/avc/analysis"
import { toast } from "sonner"
import Link from "next/link"
import { analyzeFluencyWithAI } from "@/lib/avc/ai-service"

export default function AVCPracticePage() {
    const params = useParams()
    const router = useRouter()
    const scenarioId = params.id as string
    const scenario = SCENARIOS.find(s => s.id === scenarioId)

    const [isRecording, setIsRecording] = React.useState(false)
    const [elapsed, setElapsed] = React.useState(0)
    const webcamRef = React.useRef<Webcam>(null)
    const [isAnalyzing, setIsAnalyzing] = React.useState(false)

    // Hooks
    const { transcript, interimTranscript, metrics: speechMetrics } = useSpeechAnalysis(isRecording)
    const { faceStatus, faceMetrics } = useFaceAnalysis(isRecording, webcamRef)

    // Timer
    React.useEffect(() => {
        let interval: NodeJS.Timeout
        if (isRecording) {
            interval = setInterval(() => {
                setElapsed(prev => prev + 1)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [isRecording])

    const handleStart = () => {
        setIsRecording(true)
        setElapsed(0)
    }

    const handleStop = async () => {
        setIsRecording(false)
        setIsAnalyzing(true)

        toast("Session Ended", { description: "Consulting AI Coach..." })

        try {
            // Format Emotion Timeline
            let emotionTimelineString = "Not recorded"
            if (faceMetrics.emotionTimeline && faceMetrics.emotionTimeline.length > 0) {
                // Group emotions roughly for brevity
                const reduced = faceMetrics.emotionTimeline.reduce((acc: any[], curr: any) => {
                    const last = acc[acc.length - 1]
                    if (!last || last.emotion !== curr.emotion) {
                        acc.push({ start: curr.time, end: curr.time, emotion: curr.emotion })
                    } else {
                        last.end = curr.time
                    }
                    return acc
                }, [])

                emotionTimelineString = reduced.map((r: any) => `${r.start}-${r.end}s: ${r.emotion}`).join(' -> ')
            }

            // Get AI Insights
            const aiResult = await analyzeFluencyWithAI(transcript, speechMetrics, scenario?.title || "Speech Practice", emotionTimelineString)

            const confScore = calculateConfidenceScore(speechMetrics, faceMetrics.eyeContactScore)

            // Save Session Data
            const sessionData = {
                scenarioId,
                words: speechMetrics.wordCount,
                wpm: speechMetrics.wpm,
                fillerWords: speechMetrics.fillersCount,
                pauses: speechMetrics.pauseCount,
                eyeContact: faceMetrics.eyeContactScore,
                confidenceScore: confScore,
                transcript: transcript,
                aiFeedback: aiResult
            }

            // Save to Database
            const res = await fetch('/api/avc/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sessionData)
            })

            if (res.ok) {
                // Keep minimal data in localStorage for immediate report view MVP transfer
                localStorage.setItem(`avc_session_${scenarioId}`, JSON.stringify({
                    date: new Date().toISOString(),
                    metrics: speechMetrics,
                    faceMetrics: faceMetrics,
                    confidenceScore: confScore,
                    transcript: transcript,
                    aiAnalysis: aiResult
                }))
                router.push(`/avc/report/${scenarioId}`)
            } else {
                throw new Error("Failed to save session");
            }

        } catch (error) {
            console.error(error)
            toast.error("Analysis Failed", { description: "Could not reach AI service." })
            setIsAnalyzing(false)
        }
    }

    if (!scenario) return <div className="p-10">Scenario not found</div>

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="h-16 border-b flex items-center px-6 justify-between bg-card/50 backdrop-blur sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/avc">
                        <Button variant="ghost" size="icon"><MoveLeft className="w-5 h-5" /></Button>
                    </Link>
                    <div>
                        <h1 className="font-bold text-lg">{scenario.title}</h1>
                        <p className="text-xs text-muted-foreground">{scenario.category} • {scenario.difficulty}</p>
                    </div>
                </div>

                {isRecording && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-500 rounded-full animate-pulse">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-sm font-mono font-medium">LIVE {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, '0')}</span>
                    </div>
                )}
            </header>

            <div className="flex-1 container mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left: Webcam & Live Feedback */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-border/20">
                        <Webcam
                            ref={webcamRef}
                            audio={false} // Audio handled by Speech Hook
                            className="w-full h-full object-cover transform scale-x-[-1]" // Mirror
                        />

                        {/* Overlay Controls */}
                        {!isRecording && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
                                <Button
                                    className="rounded-full w-20 h-20 bg-primary hover:bg-primary/90 shadow-xl transition-transform hover:scale-105"
                                    onClick={handleStart}
                                >
                                    <Play className="w-8 h-8 fill-current ml-1" />
                                </Button>
                            </div>
                        )}

                        {/* Live Signals (MVP) */}
                        {isRecording && (
                            <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2">
                                <div className="flex justify-between items-end w-full">
                                    <div className="flex gap-2">
                                        <div className={`bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg text-white text-xs flex items-center gap-2 ${faceStatus === "Face Detected" ? "border border-green-500/50" : "border border-red-500/50"}`}>
                                            <Video className={`w-4 h-4 ${faceStatus === "Face Detected" ? "text-green-400" : "text-red-400"}`} />
                                            {faceStatus === "Face Detected" ? "Eye Contact: Good" : "Face Not Visible"}
                                        </div>
                                        <div className={`bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg text-white text-xs flex items-center gap-2 ${speechMetrics.wpm >= 110 && speechMetrics.wpm <= 160 ? "border border-green-500/50" : "border border-orange-500/50"}`}>
                                            <Mic className={`w-4 h-4 ${speechMetrics.wpm >= 110 && speechMetrics.wpm <= 160 ? "text-green-400" : "text-orange-400"}`} />
                                            {speechMetrics.wpm} WPM 
                                            <span className="opacity-70">
                                                ({speechMetrics.wpm === 0 ? "Speaking..." : speechMetrics.wpm < 110 ? "Too Slow" : speechMetrics.wpm > 160 ? "Too Fast" : "Good Pace"})
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Transcript Preview */}
                    <Card className="h-40 overflow-hidden flex flex-col">
                        <CardHeader className="py-3 px-4 bg-muted/30 border-b">
                            <CardTitle className="text-xs font-medium uppercase text-muted-foreground flex items-center gap-2">
                                Live Transcript <span className="bg-green-500/20 text-green-600 text-[10px] px-1.5 rounded">BETA</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-4 overflow-y-auto font-mono text-sm leading-relaxed opacity-80">
                            {transcript}
                            <span className="text-muted-foreground opacity-50">{interimTranscript}</span>
                            {!transcript && !interimTranscript && <span className="text-muted-foreground italic">Start talking to see live captions...</span>}
                        </CardContent>
                    </Card>

                    {/* Action Bar */}
                    {(isRecording || isAnalyzing) && (
                        <div className="flex justify-center py-4">
                            <Button
                                variant="destructive"
                                size="lg"
                                className="w-full max-w-sm gap-2"
                                onClick={handleStop}
                                disabled={isAnalyzing}
                            >
                                {isAnalyzing ? (
                                    <>Analyzing <CheckCircle2 className="w-4 h-4 animate-spin" /></>
                                ) : (
                                    <><StopCircle className="w-5 h-5" /> End & Analyze Session</>
                                )}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Right: Instructions & Hints */}
                <div className="space-y-6">
                    <Card className="border-l-4 border-l-primary h-fit">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-primary" />
                                Instructions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">{scenario.description}</p>
                            <div className="space-y-3">
                                {scenario.instructions.map((inst, i) => (
                                    <div key={i} className="flex gap-3 text-sm">
                                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">
                                            {i + 1}
                                        </div>
                                        <span>{inst}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Metrics to Watch</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-muted rounded-lg text-center flex flex-col h-full justify-center">
                                <div className="text-2xl font-bold">{speechMetrics.wordCount}</div>
                                <div className="text-xs text-muted-foreground">Words Spoken</div>
                            </div>
                            <div className="p-3 bg-muted rounded-lg text-center flex flex-col h-full justify-center">
                                <div className={`text-2xl font-bold ${speechMetrics.fillersCount > 3 ? 'text-red-500' : 'text-orange-500'}`}>
                                    {speechMetrics.fillersCount}
                                </div>
                                <div className="text-xs text-muted-foreground">Fillers (um/uh)</div>
                            </div>
                            <div className="p-3 bg-muted rounded-lg text-center col-span-2">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-muted-foreground">Eye Contact</span>
                                    <span className="font-medium">{faceMetrics.eyeContactScore}%</span>
                                </div>
                                <Progress value={faceMetrics.eyeContactScore} className="h-1.5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
