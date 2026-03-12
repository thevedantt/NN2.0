"use client"

import * as React from "react"
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    Clock,
    ExternalLink,
    TrendingUp,
    User,
    Video,
} from "lucide-react"
import Link from "next/link"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import { ModeToggle } from "@/components/mode-toggle"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

interface AptResponse {
    appointment: {
        appointmentId: number
        userId: string
        appointmentDate: string
        appointmentTime: string
        sessionType: string
        status: string
        meetLink?: string
    }
    patientEmail?: string
    patientWallet?: string
}

const chartData = [
    { day: "Mon", sessions: 4 },
    { day: "Tue", sessions: 6 },
    { day: "Wed", sessions: 5 },
    { day: "Thu", sessions: 8 },
    { day: "Fri", sessions: 7 },
    { day: "Sat", sessions: 3 },
    { day: "Sun", sessions: 2 },
]

const chartConfig = {
    sessions: {
        label: "Sessions",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig

function getInitials(email?: string) {
    if (!email) return "PT"
    const name = email.split("@")[0]
    return name.slice(0, 2).toUpperCase()
}

function formatPatientLabel(email?: string, userId?: string) {
    if (email) return email
    if (userId) return `Patient ${userId.substring(0, 8)}...`
    return "Unknown Patient"
}

function isToday(dateStr: string) {
    const today = new Date().toISOString().split("T")[0]
    return dateStr === today
}

function isUpcoming(dateStr: string) {
    return dateStr >= new Date().toISOString().split("T")[0]
}

export default function TherapistDashboardPage() {
    const [appointments, setAppointments] = React.useState<AptResponse[]>([])
    const [loading, setLoading] = React.useState(true)
    const [therapistName, setTherapistName] = React.useState("Therapist")

    React.useEffect(() => {
        const initDashboard = async () => {
            try {
                const token = localStorage.getItem("token")
                if (!token) return

                const [meRes, aptRes] = await Promise.all([
                    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } }),
                    fetch("/api/appointments/therapist", { headers: { Authorization: `Bearer ${token}` } }),
                ])

                if (meRes.ok) {
                    const data = await meRes.json()
                    setTherapistName(data.fullName || `Dr. ${data.email?.split("@")[0]}` || "Therapist")
                }

                const aptData = await aptRes.json()
                if (aptData.success) {
                    setAppointments(aptData.appointments || [])
                }
            } catch (err) {
                console.error("Failed to load dashboard data", err)
            } finally {
                setLoading(false)
            }
        }
        initDashboard()
    }, [])

    const currentDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    })

    // Derive real stats
    const todayAppts = appointments.filter((a) => isToday(a.appointment.appointmentDate))
    const upcomingAppts = appointments.filter((a) => isUpcoming(a.appointment.appointmentDate) && a.appointment.status === "scheduled")
    const uniquePatients = new Set(appointments.map((a) => a.appointment.userId)).size
    const apptWithLink = upcomingAppts.filter((a) => a.appointment.meetLink)

    return (
        <div className="flex flex-col gap-6 p-6 min-h-screen bg-background text-foreground animate-in fade-in-50">

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Welcome, {therapistName}</h1>
                    <p className="text-muted-foreground mt-1">{currentDate}</p>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/therapist/schedule">
                        <Button variant="outline" className="hidden md:flex">
                            <Calendar className="mr-2 h-4 w-4" /> Schedule
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2 border-l border-border pl-4 ml-2">
                        <ModeToggle />
                        <Avatar className="cursor-pointer hover:opacity-80 transition-opacity">
                            <AvatarFallback>{therapistName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </header>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm border-none bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? "—" : uniquePatients}</div>
                        <p className="text-xs text-muted-foreground">Unique patients booked</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-none bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
                        <Video className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? "—" : todayAppts.length}</div>
                        <p className="text-xs text-muted-foreground">Scheduled for today</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-none bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? "—" : upcomingAppts.length}</div>
                        <p className="text-xs text-muted-foreground">Scheduled sessions</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-none bg-primary text-primary-foreground">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-primary-foreground/90">Links Ready</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-primary-foreground/90" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? "—" : apptWithLink.length}</div>
                        <p className="text-xs text-primary-foreground/80">Sessions with meet link</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-12">

                {/* Left: Appointments List */}
                <div className="md:col-span-5 space-y-6">
                    <Card className="h-full shadow-md border-none">
                        <CardHeader>
                            <CardTitle>Upcoming Appointments</CardTitle>
                            <CardDescription>
                                {loading ? "Loading..." : upcomingAppts.length === 0
                                    ? "No upcoming sessions"
                                    : `${upcomingAppts.length} session${upcomingAppts.length > 1 ? "s" : ""} scheduled`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            {loading ? (
                                <div className="text-center py-8 text-sm text-muted-foreground">Loading appointments...</div>
                            ) : upcomingAppts.length > 0 ? (
                                upcomingAppts.map((aptWrap) => {
                                    const appt = aptWrap.appointment
                                    const today = isToday(appt.appointmentDate)
                                    return (
                                        <div
                                            key={appt.appointmentId}
                                            className={cn(
                                                "flex flex-col gap-3 p-3 rounded-lg border transition-colors",
                                                today ? "border-primary/30 bg-primary/5" : "border-border/50 hover:bg-muted/10"
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border-2 border-background">
                                                        <AvatarFallback className="text-xs">
                                                            {getInitials(aptWrap.patientEmail)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <Link href={`/therapist/patients/${appt.userId}`} className="block hover:underline text-sm font-medium leading-none truncate max-w-[160px]">
                                                            {formatPatientLabel(aptWrap.patientEmail, appt.userId)}
                                                        </Link>
                                                        <p className="text-xs text-muted-foreground mt-1">{appt.sessionType}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1 shrink-0">
                                                    <div className="flex items-center text-xs font-medium">
                                                        <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                                                        {appt.appointmentTime}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {today && <Badge className="text-[10px] h-4 px-1.5 bg-primary">Today</Badge>}
                                                        <Badge variant="outline" className="text-[10px] h-4 px-1.5 capitalize">{appt.status}</Badge>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Date row */}
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(appt.appointmentDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                                                </span>

                                                {appt.meetLink ? (
                                                    <Button size="sm" className="h-7 text-xs gap-1.5" asChild>
                                                        <a href={appt.meetLink} target="_blank" rel="noreferrer">
                                                            <Video className="h-3.5 w-3.5" /> Join Meet
                                                        </a>
                                                    </Button>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">Awaiting meet link</span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                                    <Calendar className="h-8 w-8 text-muted-foreground/40" />
                                    <p className="text-sm text-muted-foreground">No upcoming sessions</p>
                                    <p className="text-xs text-muted-foreground/70">Appointments booked by patients will appear here</p>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Link href="/therapist/schedule" className="w-full">
                                <Button variant="ghost" className="w-full text-muted-foreground text-sm">View Full Schedule</Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </div>

                {/* Right: Analytics & Insight */}
                <div className="md:col-span-7 space-y-6">

                    {/* Analytics Chart */}
                    <Card className="shadow-md border-none">
                        <CardHeader>
                            <CardTitle>Weekly Session Overview</CardTitle>
                            <CardDescription>Sessions conducted per day this week</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="max-h-[240px] w-full">
                                <BarChart accessibilityLayer data={chartData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="day"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent indicator="dashed" />}
                                    />
                                    <Bar dataKey="sessions" fill="var(--color-sessions)" radius={4} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* All appointments with past sessions */}
                    {appointments.filter(a => a.appointment.status !== "scheduled").length > 0 && (
                        <Card className="shadow-sm border-none">
                            <CardHeader>
                                <CardTitle className="text-base">Past Sessions</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-2">
                                {appointments
                                    .filter(a => a.appointment.status !== "scheduled")
                                    .slice(0, 4)
                                    .map((aptWrap) => {
                                        const appt = aptWrap.appointment
                                        return (
                                            <div key={appt.appointmentId} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-7 w-7">
                                                        <AvatarFallback className="text-[10px]">{getInitials(aptWrap.patientEmail)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm font-medium truncate max-w-[180px]">
                                                            {formatPatientLabel(aptWrap.patientEmail, appt.userId)}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(appt.appointmentDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {appt.appointmentTime}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant="secondary" className="capitalize text-xs">{appt.status}</Badge>
                                            </div>
                                        )
                                    })}
                            </CardContent>
                        </Card>
                    )}

                    {/* AI Insight placeholder */}
                    <Card className="bg-gradient-to-r from-primary/10 to-transparent border-none">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Session Prep Reminder
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-foreground/80">
                                {todayAppts.length > 0
                                    ? `You have ${todayAppts.length} session${todayAppts.length > 1 ? "s" : ""} today. Review your patient notes and check that meeting links are set before each session.`
                                    : "No sessions today. You can review upcoming bookings in your schedule."}
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Link href="/therapist/schedule">
                                <Button variant="link" className="px-0 text-primary text-sm">View Schedule</Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}
