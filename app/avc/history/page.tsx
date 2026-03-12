"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { MoveLeft, Video, Mic, Calendar, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SCENARIOS } from "@/lib/avc/scenarios"

export default function AVCHistoryPage() {
    const [sessions, setSessions] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch('/api/avc/history')
                const data = await res.json()
                if (data.success) {
                    setSessions(data.sessions)
                }
            } catch (error) {
                console.error("Failed to load history", error)
            } finally {
                setLoading(false)
            }
        }
        fetchHistory()
    }, [])

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <header className="mb-8 flex items-center gap-4">
                <Link href="/avc">
                    <Button variant="ghost" size="icon"><MoveLeft className="w-5 h-5" /></Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Your Practice History
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Track your progress over time and review past AI coaching feedback.
                    </p>
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : sessions.length === 0 ? (
                <Card className="p-12 text-center bg-muted/30 border-dashed">
                    <CardHeader>
                        <CardTitle>No Sessions Yet</CardTitle>
                        <CardDescription>
                            You haven't completed any practice sessions yet. Ready to start?
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/avc">
                            <Button>Explore Scenarios</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {sessions.map((session, i) => {
                        const scenario = SCENARIOS.find(s => s.id === session.scenario)
                        const date = new Date(session.createdAt).toLocaleDateString(undefined, {
                            month: 'short', day: 'numeric', year: 'numeric'
                        })

                        return (
                            <motion.div
                                key={session.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className="hover:shadow-md transition-shadow">
                                    <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">{scenario?.category || 'Practice'}</Badge>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> {date}
                                                </span>
                                            </div>
                                            <h3 className="font-semibold text-lg">{scenario?.title || 'Unknown Scenario'}</h3>
                                            
                                            <div className="flex gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1"><Mic className="w-4 h-4" /> {session.wpm} WPM</span>
                                                <span className="flex items-center gap-1"><Video className="w-4 h-4" /> {session.eyeContact}% Eye Contact</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 self-stretch sm:self-auto border-t sm:border-t-0 sm:border-l pt-4 sm:pt-0 sm:pl-6 w-full sm:w-auto">
                                            <div className="text-center flex-1 sm:flex-none">
                                                <div className="text-2xl font-bold text-primary">{session.confidenceScore}%</div>
                                                <div className="text-[10px] uppercase font-semibold text-muted-foreground">Confidence</div>
                                            </div>
                                            <Link href={`/avc/report/${session.scenario}?sessionId=${session.id}`}>
                                                <Button variant="secondary" size="sm" className="w-full sm:w-auto mt-2 sm:mt-0">
                                                    Review <ChevronRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
