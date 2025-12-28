"use client"

import * as React from "react"
import { Calendar as CalendarIcon, Clock, Video, CheckCircle2, XCircle, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

const SESSIONS = [
    { id: "1", buddy: "Aarav Rao", date: "Today", time: "2:00 PM", duration: "30 min", status: "scheduled", type: "Video Chat" },
    { id: "2", buddy: "Jay Chopra", date: "Dec 20", time: "10:00 AM", duration: "45 min", status: "completed", type: "Voice Call" },
    { id: "3", buddy: "Sameer S.", date: "Dec 18", time: "4:00 PM", duration: "30 min", status: "cancelled", type: "Video Chat" },
]

export default function SessionsPage() {
    return (
        <div className="flex-1 h-full overflow-y-auto p-6 md:p-8 bg-background max-w-5xl mx-auto w-full">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Sessions History</h1>
                    <p className="text-muted-foreground mt-1">Keep track of your scheduled and past buddy connections.</p>
                </div>
                <Button>Schedule Session</Button>
            </header>

            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="mb-6 grid w-full max-w-[400px] grid-cols-2">
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="space-y-4">
                    {SESSIONS.filter(s => s.status === 'scheduled').map(session => (
                        <SessionCard key={session.id} session={session} />
                    ))}
                    {SESSIONS.filter(s => s.status === 'scheduled').length === 0 && (
                        <EmptyState message="No upcoming sessions scheduled." />
                    )}
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    {SESSIONS.filter(s => s.status !== 'scheduled').map(session => (
                        <SessionCard key={session.id} session={session} isHistory />
                    ))}
                    {SESSIONS.filter(s => s.status !== 'scheduled').length === 0 && (
                        <EmptyState message="No past sessions found." />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}

function SessionCard({ session, isHistory }: { session: any, isHistory?: boolean }) {
    return (
        <Card className="flex flex-col md:flex-row items-center p-6 gap-6 hover:shadow-sm transition-shadow">
            <div className="flex-none flex items-center justify-center h-16 w-16 bg-primary/5 rounded-full text-primary">
                {session.type === 'Video Chat' ? <Video className="h-8 w-8" /> : <Clock className="h-8 w-8" />}
            </div>

            <div className="flex-1 text-center md:text-left space-y-1">
                <div className="flex items-center justify-center md:justify-start gap-2">
                    <h3 className="text-lg font-semibold">{session.buddy}</h3>
                    <Badge variant={session.status === 'scheduled' ? 'default' : 'secondary'} className="capitalize">
                        {session.status}
                    </Badge>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><CalendarIcon className="h-3.5 w-3.5" /> {session.date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {session.time} ({session.duration})</span>
                </div>
            </div>

            <div className="flex-none flex gap-3 w-full md:w-auto">
                {session.status === 'scheduled' ? (
                    <Button className="w-full md:w-auto">Join Session</Button>
                ) : (
                    <Button variant="outline" className="w-full md:w-auto">View Notes</Button>
                )}
            </div>
        </Card>
    )
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
            <CalendarIcon className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">{message}</p>
        </div>
    )
}
