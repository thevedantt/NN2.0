"use client"

import * as React from "react"
import { CheckCircle2, ChevronRight, ClipboardList, Info, AlertCircle, ArrowRight, Shield, Loader2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Disclaimer } from "@/components/assessment/Disclaimer"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useWeb3 } from "@/context/Web3Context"

// Data Mock
const ASSESSMENTS = [
    {
        id: "phq-9",
        title: "PHQ-9 (Depression)",
        description: "A 9-question instrument to screen for the presence and severity of depression.",
        time: "3-5 mins",
        questions: [
            "Little interest or pleasure in doing things?",
            "Feeling down, depressed, or hopeless?",
            "Trouble falling or staying asleep, or sleeping too much?",
            "Feeling tired or having little energy?",
            "Poor appetite or overeating?",
            "Feeling bad about yourself - or that you are a failure or have let yourself or your family down?",
            "Trouble concentrating on things, such as reading the newspaper or watching television?",
            "Moving or speaking so slowly that other people could have noticed? Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual?",
            "Thoughts that you would be better off dead, or of hurting yourself in some way?"
        ]
    },
    {
        id: "gad-7",
        title: "GAD-7 (Anxiety)",
        description: "A 7-item scale that measures severity of generalized anxiety disorders.",
        time: "2-4 mins",
        questions: [
            "Feeling nervous, anxious, or on edge",
            "Not being able to stop or control worrying",
            "Worrying too much about different things",
            "Trouble relaxing",
            "Being so restless that it is hard to sit still",
            "Becoming easily annoyed or irritable",
            "Feeling afraid, as if something awful might happen"
        ]
    }
]

const OPTIONS = [
    { value: 0, label: "Not at all" },
    { value: 1, label: "Several days" },
    { value: 2, label: "More than half the days" },
    { value: 3, label: "Nearly every day" }
]

type TherapistOption = {
    userId: string
    fullName: string
    walletAddress: string | null
}

export default function AssessmentPage() {
    const { walletAddress } = useWeb3()
    const [view, setView] = React.useState<"selection" | "taking" | "results">("selection")
    const [selectedAssessment, setSelectedAssessment] = React.useState<typeof ASSESSMENTS[0] | null>(null)
    const [currentStep, setCurrentStep] = React.useState(0)
    const [answers, setAnswers] = React.useState<number[]>([])

    // Share state
    const [therapists, setTherapists] = React.useState<TherapistOption[]>([])
    const [selectedTherapist, setSelectedTherapist] = React.useState<string>("")
    const [sharing, setSharing] = React.useState(false)
    const [shared, setShared] = React.useState(false)
    const [shareError, setShareError] = React.useState<string | null>(null)
    const [dbWallet, setDbWallet] = React.useState<string | null>(null)

    const effectiveWallet = walletAddress || dbWallet

    // Fetch wallet from DB on mount
    React.useEffect(() => {
        if (!walletAddress) {
            fetch("/api/web3/wallet").then(r => r.json()).then(d => {
                if (d.walletAddress) setDbWallet(d.walletAddress)
            }).catch(() => { })
        }
    }, [walletAddress])

    const startAssessment = (id: string) => {
        const assessment = ASSESSMENTS.find(a => a.id === id)
        if (assessment) {
            setSelectedAssessment(assessment)
            setView("taking")
            setCurrentStep(0)
            setAnswers(new Array(assessment.questions.length).fill(-1))
            setShared(false)
            setShareError(null)
            setSelectedTherapist("")
        }
    }

    const handleAnswer = (value: number) => {
        const newAnswers = [...answers]
        newAnswers[currentStep] = value
        setAnswers(newAnswers)
    }

    const nextStep = () => {
        if (!selectedAssessment) return
        if (currentStep < selectedAssessment.questions.length - 1) {
            setCurrentStep(prev => prev + 1)
        } else {
            setView("results")
            // Fetch therapists for sharing
            fetch("/api/therapist/list").then(r => r.json()).then(d => {
                setTherapists(d.therapists || [])
            }).catch(() => { })
        }
    }

    const calculateScore = () => answers.reduce((a, b) => a + (b === -1 ? 0 : b), 0)

    const getResultAnalysis = (score: number, type: string) => {
        if (type === 'phq-9') {
            if (score <= 4) return { level: "Minimal", color: "text-green-600", bg: "bg-green-100", advice: "Scores suggest minimal symptoms. Keep monitoring yourself." }
            if (score <= 9) return { level: "Mild", color: "text-yellow-600", bg: "bg-yellow-100", advice: "Mild symptoms present. Consider self-care strategies or talking to a friend." }
            if (score <= 14) return { level: "Moderate", color: "text-orange-600", bg: "bg-orange-100", advice: "Moderate symptoms. A consultation with a mental health professional is recommended." }
            if (score <= 19) return { level: "Moderately Severe", color: "text-red-500", bg: "bg-red-100", advice: "Significant symptoms. Please seek professional support." }
            return { level: "Severe", color: "text-red-700", bg: "bg-red-200", advice: "Severe symptoms. Immediate professional help is strongly advised." }
        }
        if (score <= 4) return { level: "Minimal Anxiety", color: "text-green-600", bg: "bg-green-100", advice: "Minimal anxiety." }
        if (score <= 9) return { level: "Mild Anxiety", color: "text-yellow-600", bg: "bg-yellow-100", advice: "Mild anxiety." }
        if (score <= 14) return { level: "Moderate Anxiety", color: "text-orange-600", bg: "bg-orange-100", advice: "Moderate anxiety." }
        return { level: "Severe Anxiety", color: "text-red-700", bg: "bg-red-200", advice: "Severe anxiety levels." }
    }

    const handleShareAssessment = async () => {
        if (!selectedAssessment || !selectedTherapist || !effectiveWallet) return

        const therapist = therapists.find(t => t.userId === selectedTherapist)
        if (!therapist?.walletAddress) return

        setSharing(true)
        setShareError(null)
        try {
            const score = calculateScore()
            const result = getResultAnalysis(score, selectedAssessment.id)

            const res = await fetch("/api/web3/assessment-share", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    therapistUserId: therapist.userId,
                    patientWallet: effectiveWallet,
                    therapistWallet: therapist.walletAddress,
                    assessmentType: selectedAssessment.id,
                    score,
                    level: result.level,
                    answers,
                    questions: selectedAssessment.questions,
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

    const selectedTherapistData = therapists.find(t => t.userId === selectedTherapist)

    return (
        <div className="flex-1 h-full overflow-y-auto w-full p-6 md:p-8 bg-background">
            <div className="max-w-4xl mx-auto w-full">
                <header className="mb-8 w-full">
                    <h1 className="text-3xl font-bold text-foreground">Self Assessments</h1>
                    <p className="text-muted-foreground mt-2">Check in with yourself using clinically-backed screeners.</p>
                </header>

                {view === "selection" && (
                    <div className="grid md:grid-cols-2 gap-6 w-full">
                        {ASSESSMENTS.map((assessment) => (
                            <Card key={assessment.id} className="hover:shadow-md transition-shadow cursor-pointer border-border/60" onClick={() => startAssessment(assessment.id)}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-xl text-primary">{assessment.title}</CardTitle>
                                        <Badge variant="secondary">{assessment.time}</Badge>
                                    </div>
                                    <CardDescription className="mt-2">{assessment.description}</CardDescription>
                                </CardHeader>
                                <CardFooter>
                                    <Button variant="outline" className="w-full group">
                                        Start Assessment
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}

                {view === "taking" && selectedAssessment && (
                    <div className="max-w-2xl mx-auto w-full">
                        <div className="mb-6">
                            <div className="flex justify-between text-sm mb-2 text-muted-foreground">
                                <span>Question {currentStep + 1} of {selectedAssessment.questions.length}</span>
                                <span>{Math.round(((currentStep) / selectedAssessment.questions.length) * 100)}% Complete</span>
                            </div>
                            <Progress value={((currentStep) / selectedAssessment.questions.length) * 100} className="h-2" />
                        </div>

                        <Card className="min-h-[300px] flex flex-col justify-center p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-xl md:text-2xl font-medium text-center mb-8 leading-relaxed">
                                {selectedAssessment.questions[currentStep]}
                            </h2>

                            <div className="grid gap-3">
                                {OPTIONS.map((option) => (
                                    <div
                                        key={option.value}
                                        onClick={() => handleAnswer(option.value)}
                                        className={cn(
                                            "p-4 rounded-xl border cursor-pointer transition-all hover:bg-secondary/30 flex items-center gap-3",
                                            answers[currentStep] === option.value
                                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                : "border-border bg-card"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                                            answers[currentStep] === option.value ? "border-primary" : "border-muted-foreground"
                                        )}>
                                            {answers[currentStep] === option.value && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                                        </div>
                                        <span className={cn(
                                            "font-medium",
                                            answers[currentStep] === option.value ? "text-primary" : "text-foreground"
                                        )}>{option.label}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 flex justify-end">
                                <Button
                                    onClick={nextStep}
                                    disabled={answers[currentStep] === -1}
                                    className="px-8"
                                >
                                    {currentStep === selectedAssessment.questions.length - 1 ? "Finish" : "Next"}
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}

                {view === "results" && selectedAssessment && (
                    <div className="max-w-2xl mx-auto w-full animate-in zoom-in-95 duration-500 space-y-4">
                        {(() => {
                            const score = calculateScore()
                            const result = getResultAnalysis(score, selectedAssessment.id)

                            return (
                                <>
                                    <Card className="p-8 text-center border-t-4 border-t-primary">
                                        <div className="mk-6 flex justify-center mb-6">
                                            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                                                <ClipboardList className="h-10 w-10 text-primary" />
                                            </div>
                                        </div>

                                        <h2 className="text-2xl font-bold mb-2">{selectedAssessment.title} Results</h2>
                                        <p className="text-muted-foreground mb-6">Based on your responses</p>

                                        <div className="grid grid-cols-2 gap-4 mb-8">
                                            <div className="p-4 bg-secondary/30 rounded-lg">
                                                <div className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Total Score</div>
                                                <div className="text-3xl font-bold text-primary">{score}</div>
                                            </div>
                                            <div className={cn("p-4 rounded-lg", result.bg)}>
                                                <div className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Risk Level</div>
                                                <div className={cn("text-xl font-bold", result.color)}>{result.level}</div>
                                            </div>
                                        </div>

                                        <Alert className="mb-8 text-left bg-muted/30 border-primary/20">
                                            <Info className="h-4 w-4 text-primary" />
                                            <AlertTitle className="text-primary font-medium">Interpretation</AlertTitle>
                                            <AlertDescription className="text-muted-foreground mt-1">
                                                {result.advice}
                                            </AlertDescription>
                                        </Alert>

                                        <div className="flex gap-4 justify-center">
                                            <Button variant="outline" onClick={() => setView("selection")}>Take Another</Button>
                                            <Button onClick={() => window.location.href = '/doctors'}>Book Consultation</Button>
                                        </div>
                                    </Card>

                                    {/* Share Assessment with Therapist */}
                                    <Card className="border-primary/20 shadow-sm">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Shield className="h-5 w-5 text-primary" />
                                                Share with Your Therapist
                                            </CardTitle>
                                            <CardDescription>
                                                Securely share this assessment result via encrypted IPFS. Your therapist can view it from their dashboard.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {shared ? (
                                                <div className="flex items-center gap-2 p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                                                    <ShieldCheck className="h-5 w-5 text-green-500" />
                                                    <div>
                                                        <p className="text-sm font-medium text-green-600">Assessment Shared Successfully!</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            You can manage or revoke access from the Sharing History page.
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    {!effectiveWallet && (
                                                        <p className="text-xs text-orange-500">
                                                            ⚠️ Connect your wallet first from the Chat AI page to enable sharing.
                                                        </p>
                                                    )}
                                                    <Select value={selectedTherapist} onValueChange={setSelectedTherapist}>
                                                        <SelectTrigger className="w-full">
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
                                                    <Button
                                                        onClick={handleShareAssessment}
                                                        disabled={!selectedTherapist || !selectedTherapistData?.walletAddress || !effectiveWallet || sharing}
                                                        className="w-full gap-2"
                                                    >
                                                        {sharing ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Shield className="h-4 w-4" />
                                                        )}
                                                        {sharing ? "Encrypting & Sharing..." : "Encrypt & Share Assessment"}
                                                    </Button>
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>
                                </>
                            )
                        })()}
                    </div>
                )}

                <Disclaimer />
            </div>
        </div>
    )
}
