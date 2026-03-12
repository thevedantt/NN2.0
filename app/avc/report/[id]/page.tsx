"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle2, ChevronRight, BarChart3, Mic, Video, Award, RefreshCw, Home, Shield, ShieldCheck, Loader2, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SCENARIOS } from "@/lib/avc/scenarios"
import { AnalysisMetrics } from "@/lib/avc/analysis"
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from "recharts"
import { useWeb3 } from "@/context/Web3Context"

export default function AVCReportPage() {
    const params = useParams()
    const router = useRouter()
    const scenarioId = params.id as string
    const scenario = SCENARIOS.find(s => s.id === scenarioId)

    // In MVP, we load from local storage
    const [sessionData, setSessionData] = React.useState<any>(null)
    const [loading, setLoading] = React.useState(true)

    // Sharing State
    const { walletAddress } = useWeb3()
    const [therapists, setTherapists] = React.useState<any[]>([])
    const [selectedTherapist, setSelectedTherapist] = React.useState<string>("")
    const [sharing, setSharing] = React.useState(false)
    const [shared, setShared] = React.useState(false)
    const [shareError, setShareError] = React.useState<string | null>(null)
    const [dbWallet, setDbWallet] = React.useState<string | null>(null)

    const effectiveWallet = walletAddress || dbWallet

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

        // Fetch wallet
        if (!walletAddress) {
            fetch("/api/web3/wallet").then(r => r.json()).then(d => {
                if (d.walletAddress) setDbWallet(d.walletAddress)
            }).catch(() => { })
        }

        // Fetch therapists
        fetch("/api/therapist/list").then(r => r.json()).then(d => {
            setTherapists(d.therapists || [])
        }).catch(() => { })
    }, [scenarioId, router, walletAddress])

    // Handle Share
    const handleShareAssessment = async () => {
        if (!sessionData || !selectedTherapist || !effectiveWallet) return

        const therapist = therapists.find(t => t.userId === selectedTherapist)
        if (!therapist?.walletAddress) return

        setSharing(true)
        setShareError(null)
        try {
            const res = await fetch("/api/web3/assessment-share", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    therapistUserId: therapist.userId,
                    patientWallet: effectiveWallet,
                    therapistWallet: therapist.walletAddress,
                    assessmentType: `avc_${scenarioId}`,
                    score: sessionData.confidenceScore || 0,
                    level: "AVC Session",
                    answers: [], // Not applicable for AVC
                    questions: [],
                }),
            })

            if (res.ok) {
                setShared(true)
            } else {
                const data = await res.json()
                setShareError(data.error || "Share failed")
            }
        } catch (err: any) {
            setShareError(err.message)
        } finally {
            setSharing(false)
        }
    }

    if (loading || !sessionData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <h2 className="text-xl font-bold">Generating Behavioral Report...</h2>
                <p className="text-muted-foreground">Analyzing speech patterns and facial signals</p>
            </div>
        )
    }

    const { metrics, faceMetrics, aiAnalysis, confidenceScore: rawConfidence } = sessionData as any
    const confidenceScore = rawConfidence !== undefined ? rawConfidence : 72 // Fallback
    const fillerRatio = metrics.wordCount > 0 ? (metrics.fillersCount / metrics.wordCount) : 0
    const wpmScore = metrics.wpm >= 110 && metrics.wpm <= 160 ? 100 : Math.max(0, 100 - Math.abs(metrics.wpm - 135))
    const fluencyScore = Math.max(0, 100 - (fillerRatio * 500)) // Heavy penalty for fillers

    // Calculate actual Emotion Stability
    let emotionStability = 70;
    let dominantEmotion = "Neutral";
    
    // Process timeline for 5-second intervals chart
    let timelineChartData: any[] = [];
    
    if (faceMetrics?.emotionTimeline && faceMetrics.emotionTimeline.length > 0) {
        // Calculate stability and dominant
        const counts = faceMetrics.emotionTimeline.reduce((acc: any, curr: any) => {
            acc[curr.emotion] = (acc[curr.emotion] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        let maxCount = 0;
        for (const [emotion, count] of Object.entries(counts)) {
            if ((count as number) > maxCount) {
                maxCount = count as number;
                dominantEmotion = emotion;
            }
        }

        const positiveEmotions = (counts['Neutral'] || 0) + (counts['Happy'] || 0);
        emotionStability = Math.round((positiveEmotions / faceMetrics.emotionTimeline.length) * 100);
        emotionStability = Math.max(40, emotionStability); // Minimum floor
        
        // Group into 5-second intervals for the chart
        const durationSec = Math.ceil(metrics.duration);
        const intervals = Math.ceil(durationSec / 5);
        
        for (let i = 0; i < intervals; i++) {
            const startStr = i * 5;
            const endStr = Math.min((i + 1) * 5, durationSec);
            
            // Find most common emotion in this 5s window
            const emotionsInWindow = faceMetrics.emotionTimeline.filter((e: any) => e.time >= startStr && e.time < endStr);
            
            let windowDominant = "Neutral";
            if (emotionsInWindow.length > 0) {
                 const windowCounts = emotionsInWindow.reduce((acc: any, curr: any) => {
                    acc[curr.emotion] = (acc[curr.emotion] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);
                
                let wMax = 0;
                for (const [e, c] of Object.entries(windowCounts)) {
                    if ((c as number) > wMax) {
                        wMax = c as number;
                        windowDominant = e;
                    }
                }
            }
            
            // Assign a numeric value just to give the bar a height. We will color it by emotion.
            const valueMap: Record<string, number> = {
                "Happy": 5,
                "Neutral": 4,
                "Nervous": 2, // Highlight lower to show confidence drop
                "Sad": 1,
                "Fear": 1
            }
            
            timelineChartData.push({
                timeLabel: `${startStr}-${endStr}s`,
                emotion: windowDominant,
                value: valueMap[windowDominant] || 3
            })
        }
    }
    
    const getEmotionColor = (emotion: string) => {
        switch(emotion) {
            case 'Happy': return 'hsl(var(--chart-2, 142.1 76.2% 36.3%))'; // Greenish
            case 'Neutral': return 'hsl(var(--primary))'; // Blueish
            case 'Nervous': return 'hsl(var(--chart-4, 43 74.4% 49%))'; // Orange
            case 'Sad': return 'hsl(var(--muted-foreground))'; // Gray
            case 'Fear': return 'hsl(var(--destructive))'; // Red
            default: return 'hsl(var(--primary))';
        }
    }

    const radarData = [
        { subject: "Eye Contact", A: faceMetrics?.eyeContactScore || 0, fullMark: 100 },
        { subject: "Speech Clarity", A: fluencyScore, fullMark: 100 },
        { subject: "Emotion Stability", A: emotionStability, fullMark: 100 },
        { subject: "Filler Words", A: Math.max(0, 100 - (metrics.fillersCount * 10)), fullMark: 100 },
        { subject: "Pause Control", A: Math.max(0, 100 - (metrics.pauseCount * 5)), fullMark: 100 },
    ]

    const selectedTherapistData = therapists.find(t => t.userId === selectedTherapist)

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
                            <div className="space-y-1">
                                <div className="text-sm text-muted-foreground">Visual Engagement</div>
                                <div className={`text-2xl font-semibold ${faceMetrics?.eyeContactScore > 80 ? 'text-green-600' : 'text-orange-500'}`}>
                                    {faceMetrics?.eyeContactScore || 0}%
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-sm text-muted-foreground">Dominant State</div>
                                <div className="text-2xl font-semibold" style={{color: getEmotionColor(dominantEmotion)}}>
                                    {dominantEmotion}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                
                {/* Clinical Emotion Timeline */}
                <Card className="border-border">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                             <Video className="w-5 h-5 text-purple-500" /> Behavioral & Emotion Timeline
                        </CardTitle>
                        <CardDescription>Visual state analysis tracked in 5-second intervals.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-48 mt-2">
                        {timelineChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={timelineChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                    <XAxis dataKey="timeLabel" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis hide domain={[0, 6]} />
                                    <Tooltip 
                                        cursor={{fill: 'transparent'}}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-white p-3 border rounded shadow-md text-sm">
                                                        <p className="font-semibold text-zinc-800">{data.timeLabel}</p>
                                                        <p className="mt-1 flex items-center gap-2">
                                                            State: <span style={{color: getEmotionColor(data.emotion)}} className="font-bold">{data.emotion}</span>
                                                        </p>
                                                    </div>
                                                )
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                        { timelineChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={getEmotionColor(entry.emotion)} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                             <div className="h-full flex items-center justify-center text-muted-foreground italic text-sm border border-dashed rounded-lg">
                                No timeline data recorded for this session.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* AI Improved Answer & Tips */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="h-full border-indigo-100">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lightbulb className="w-5 h-5 text-indigo-500" /> Actionable Tip
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{aiAnalysis?.actionableTip || "Keep practicing consistently to see improvement."}</p>
                            <div className="mt-4 p-4 bg-indigo-50 rounded-lg text-sm text-indigo-900 border border-indigo-100">
                                <span className="font-semibold block mb-1">Feedback Summary:</span>
                                {aiAnalysis?.feedback || "Great attempt. Focus on clarity and breathing."}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="h-full border-green-100 bg-green-50/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="w-5 h-5 text-green-600" /> Improved Answer
                            </CardTitle>
                            <CardDescription>How the AI Coach would have said it</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 bg-white rounded-lg shadow-sm border border-green-100 text-sm leading-relaxed relative italic text-zinc-700">
                                "{aiAnalysis?.improvedAnswer || "Your answer was great! Focus on confidence and reducing filler words next time."}"
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Radar Chart & Detailed Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="h-full">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-blue-500" /> Confidence Profile
                                </CardTitle>
                            </div>
                            <CardDescription>Your behavioral breakdown across dimensions.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64 mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid opacity={0.5} />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 12 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="Confidence" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Share Assessment with Therapist */}
                    <Card className="border-primary/20 shadow-sm flex flex-col justify-center">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Shield className="h-6 w-6 text-primary" />
                                Share Report securely
                            </CardTitle>
                            <CardDescription>
                                Securely share this AVC session report with your therapist via encrypted IPFS on the blockchain.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {shared ? (
                                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                                    <ShieldCheck className="h-6 w-6 text-green-600" />
                                    <div>
                                        <p className="font-semibold text-green-700">Report Shared Successfully!</p>
                                        <p className="text-xs text-green-600/80 mt-1">
                                            Your therapist can now review it from their dashboard.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {!effectiveWallet && (
                                        <p className="text-sm text-orange-500 bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
                                            ⚠️ Connect your wallet first from the Chat AI page to enable sharing.
                                        </p>
                                    )}
                                    <div className="space-y-2">
                                        <Select value={selectedTherapist} onValueChange={setSelectedTherapist}>
                                            <SelectTrigger className="w-full h-12">
                                                <SelectValue placeholder="Select a therapist..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {therapists.map(t => (
                                                    <SelectItem
                                                        key={t.userId}
                                                        value={t.userId}
                                                        disabled={!t.walletAddress}
                                                    >
                                                        {t.fullName} {t.walletAddress ? "✓" : "(No Wallet)"}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {shareError && (
                                            <p className="text-xs text-destructive">{shareError}</p>
                                        )}
                                    </div>
                                    <Button
                                        onClick={handleShareAssessment}
                                        disabled={!selectedTherapist || !selectedTherapistData?.walletAddress || !effectiveWallet || sharing}
                                        className="w-full gap-2 h-12"
                                        size="lg"
                                    >
                                        {sharing ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <Shield className="h-5 w-5" />
                                        )}
                                        {sharing ? "Encrypting & Sharing..." : "Encrypt & Share Report"}
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
