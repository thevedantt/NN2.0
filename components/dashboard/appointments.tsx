"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export function UpcomingAppointments() {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [appointments, setAppointments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/appointments')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setAppointments(data.appointments)
                }
            })
            .finally(() => setLoading(false))
    }, [])

    const upcoming = appointments.find(a => new Date(a.appointmentDate) >= new Date(new Date().setHours(0, 0, 0, 0))) || appointments[0];

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-2 shadow-md border-none flex flex-col h-full">
            <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Manage your sessions and events</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col xl:flex-row gap-6 items-center xl:items-start justify-center">
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="p-3 pointer-events-none"
                    />
                </div>

                <div className="flex-1 space-y-4 w-full">
                    {loading ? (
                        <div className="p-4 border rounded-xl text-center text-sm text-muted-foreground">Loading...</div>
                    ) : upcoming ? (
                        <div className="flex items-center justify-between p-4 border rounded-xl bg-background shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                            <div>
                                <p className="font-semibold">{upcoming.doctorSnapshot?.name || "Unknown Doctor"}</p>
                                <p className="text-sm text-muted-foreground">{upcoming.sessionType}</p>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <Badge variant="default" className="mb-1 bg-primary text-primary-foreground">
                                    {upcoming.status === 'scheduled' ? 'Upcoming' : upcoming.status}
                                </Badge>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(upcoming.appointmentDate).toLocaleDateString()} at {upcoming.appointmentTime}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 border rounded-xl bg-muted/30 text-center">
                            <p className="font-medium text-muted-foreground">No upcoming sessions</p>
                            <p className="text-xs text-muted-foreground">Book a session to get started.</p>
                        </div>
                    )}

                    <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/30">
                        <div>
                            <p className="font-medium text-muted-foreground">Wellness Circle</p>
                            <p className="text-sm text-muted-foreground">Group Meditation</p>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <Badge variant="secondary" className="mb-1">Completed</Badge>
                            <p className="text-xs text-muted-foreground">Yesterday, 9:00 AM</p>
                        </div>
                    </div>

                    <Button variant="outline" className="w-full">View Full Schedule</Button>
                </div>
            </CardContent>
        </Card>
    )
}
