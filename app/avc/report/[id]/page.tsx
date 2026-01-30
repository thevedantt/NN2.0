"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle2, ChevronRight, BarChart3, Mic, Video, Award, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { SCENARIOS } from "@/lib/avc/scenarios"
import { AnalysisMetrics } from "@/lib/avc/analysis"

export default function AVCReportPage() {
    const params = useParams()
    const router = useRouter()
    const scenarioId = params.id as string
    const scenario = SCENARIOS.find(s => s.id === scenarioId)

    // In MVP, we load from local storage
    const [sessionData, setSessionData] = React.useState<{ transcript: string, metrics: AnalysisMetrics } | null>(null)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        const data = localStorage.getItem(`avc_session_${scenarioId}`)
        if (data) {
            // Fake analyzing delay for effect
            setTimeout(() => {
                setSessionData(JSON.parse(data))
                setLoading(false)
            }, 1000)
        } else {
            router.push('/avc')
        }
    }, [scenarioId, router])

    if (loading || !sessionData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <h2 className="text-xl font-bold">Generating Behavioral Report...</h2>
                <p className="text-muted-foreground">Analyzing speech patterns and facial signals</p>
            </div>
        )
    }

    const { metrics } = sessionData as any

    // Heuristic Scoring for MVP
    const fillerRatio = metrics.wordCount > 0 ? (metrics.fillersCount / metrics.wordCount) : 0
    const wpmScore = metrics.wpm >= 110 && metrics.wpm <= 160 ? 100 : Math.max(0, 100 - Math.abs(metrics.wpm - 135))
    const fluencyScore = Math.max(0, 100 - (fillerRatio * 500)) // Heavy penalty for fillers
    const confidenceScore = Math.round((wpmScore * 0.4) + (fluencyScore * 0.6))

    return (
        <div className="min-h-screen bg-muted/20 py-10 px-4">
            <div className="container mx-auto max-w-4xl space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Link href="/avc" className="hover:underline">AVC</Link>
                            <ChevronRight className="w-4 h-4" />
                            <span>Report</span>
                        </div>
                        <h1 className="text-3xl font-bold">{scenario?.title} Result</h1>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/avc/practice/${scenarioId}`}>
                            <Button variant="outline" className="gap-2">
                                <RefreshCw className="w-4 h-4" /> Try Again
                            </Button>
                        </Link>
                        <Link href="/avc">
                            <Button className="gap-2">
                                <Home className="w-4 h-4" /> All Scenarios
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Top Level Score */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    <Card className="md:col-span-1 bg-primary text-primary-foreground border-none shadow-lg">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-medium opacity-90">Overall Confidence</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-6xl font-bold mb-2">{confidenceScore}%</div>
                            <Progress value={confidenceScore} className="h-2 bg-primary-foreground/20 [&>[data-slot=progress-indicator]]:bg-white" />
                            <p className="mt-4 text-sm opacity-80 font-medium">
                                {confidenceScore > 80 ? "Excellent Performance! 🌟" : confidenceScore > 60 ? "Good Job! Keep Practicing. 👍" : "Great start! Room to grow. 🌱"}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Session Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <div className="text-sm text-muted-foreground">Duration</div>
                                <div className="text-2xl font-semibold flex items-baseline gap-1">
                                    {Math.round(metrics.duration)} <span className="text-sm font-normal text-muted-foreground">sec</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-sm text-muted-foreground">Words Spoken</div>
                                <div className="text-2xl font-semibold">{metrics.wordCount}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-sm text-muted-foreground">Pacing</div>
                                <div className={`text-2xl font-semibold ${wpmScore < 70 ? 'text-orange-500' : 'text-green-600'}`}>
                                    {metrics.wpm} <span className="text-sm font-normal text-muted-foreground">WPM</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-sm text-muted-foreground">Fillers Used</div>
                                <div className={`text-2xl font-semibold ${metrics.fillersCount > 2 ? 'text-red-500' : 'text-green-600'}`}>
                                    {metrics.fillersCount}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Detailed Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                        <Card className="h-full">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Mic className="w-5 h-5 text-blue-500" /> Speech Analysis
                                    </CardTitle>
                                    <div className="text-2xl font-bold text-blue-600">{Math.round(fluencyScore)}/100</div>
                                </div>
                                <CardDescription>Fluency, clarity, and pacing metrics.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Flow & Continuity</span>
                                        <span className="font-medium">{Math.min(100, Math.max(0, 100 - (metrics.pauseCount * 5)))}%</span>
                                    </div>
                                    <Progress value={Math.min(100, Math.max(0, 100 - (metrics.pauseCount * 5)))} />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Filler Word Usage</span>
                                        <span className="font-medium text-muted-foreground">{metrics.fillersCount} detected</span>
                                    </div>
                                    <Progress
                                        value={Math.max(0, 100 - (metrics.fillersCount * 10))}
                                        className={metrics.fillersCount > 5 ? "bg-red-100 [&>[data-slot=progress-indicator]]:bg-red-500" : "[&>[data-slot=progress-indicator]]:bg-blue-500"}
                                    />
                                    {metrics.fillersCount > 3 && (
                                        <p className="text-xs text-red-500 font-medium">Try to pause instead of saying "um" or "like".</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                        <Card className="h-full">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Video className="w-5 h-5 text-green-500" /> Visual Engagement
                                    </CardTitle>
                                    <div className="text-2xl font-bold text-green-600">Active</div>
                                </div>
                                <CardDescription>Eye contact and facial stability.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold text-green-700">Good Camera Presence</h4>
                                            <p className="text-sm text-green-600/80 mt-1">
                                                You maintained active engagement with the camera. This builds trust and authority.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Video Stability</span>
                                        <span className="font-medium">High</span>
                                    </div>
                                    <Progress value={90} className="bg-green-100 [&>[data-slot=progress-indicator]]:bg-green-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Coaching Tips */}
                <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-indigo-600" />
                            Coach's Feedback
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold mb-2">Strengths</h4>
                                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                                    {wpmScore > 80 && <li>Great pacing! You spoke at a comfortable speed.</li>}
                                    {metrics.wordCount > 50 && <li>Good volume of content provided.</li>}
                                    <li>Maintained consistent video presence.</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Quick Wins</h4>
                                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                                    {metrics.fillersCount > 1 ?
                                        <li>Try replacing filter words with a silent breath.</li> :
                                        <li>Add more variation to your tone for emphasis.</li>
                                    }
                                    {metrics.wpm > 160 && <li>Slow down slightly to let your key points land.</li>}
                                    {metrics.wpm < 110 && <li>Try to keep the energy up to maintain engagement.</li>}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
