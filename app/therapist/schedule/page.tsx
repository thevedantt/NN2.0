"use client"

import * as React from "react"
import { Calendar as CalendarIcon, Clock, MoreHorizontal, Plus, Search, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

// Types
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
    patientWallet?: string
}

export default function SchedulePage() {
    const [date, setDate] = React.useState<Date | undefined>(new Date())
    const [appointments, setAppointments] = React.useState<AptResponse[]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const token = localStorage.getItem("token")
                if (!token) return

                const aptRes = await fetch('/api/appointments/therapist', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                const aptData = await aptRes.json()
                if (aptData.success) {
                    setAppointments(aptData.appointments || [])
                }
            } catch (err) {
                console.error("Failed to load schedule data", err)
            } finally {
                setLoading(false)
            }
        }
        fetchSchedule()
    }, [])


    return (
        <div className="flex flex-col h-full p-6 animate-in fade-in-50">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Schedule</h1>
                    <p className="text-muted-foreground">Manage your availability and upcoming sessions.</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Slot
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">

                {/* Left: Calendar & Filters */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-none shadow-md">
                        <CardHeader>
                            <CardTitle>Calendar</CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-center p-0 pb-4">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border"
                            />
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-muted/20">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Filters</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <div className="flex items-center space-x-2">
                                <div className="h-3 w-3 rounded-full bg-primary" />
                                <span className="text-sm">Confirmed Bookings</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="h-3 w-3 rounded-full bg-orange-400" />
                                <span className="text-sm">Pending Request</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="h-3 w-3 rounded-full bg-muted-foreground/30" />
                                <span className="text-sm">Blocked / Unavailable</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Daily Agenda */}
                <div className="lg:col-span-8 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                            {date?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </h2>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search..."
                                    className="pl-8 w-[200px] h-9"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 flex-1 overflow-auto pr-2">
                        {/* Time Slots Visualization */}
                        {loading ? (
                            <div className="text-center py-8 text-muted-foreground">Loading schedule...</div>
                        ) : appointments.length > 0 ? (
                            appointments.map((aptWrap) => {
                                const appt = aptWrap.appointment;
                                const isConfirmed = appt.status === 'scheduled' || appt.status === 'confirmed';
                                return (
                                <div key={appt.appointmentId} className="group flex items-start gap-4 p-4 rounded-xl border bg-card hover:shadow-md transition-all">
                                    <div className="flex flex-col items-center gap-1 min-w-[4rem] text-sm font-medium text-muted-foreground pt-1">
                                        <span>{appt.appointmentTime}</span>
                                        <span className="text-xs text-muted-foreground/70">60 min</span>
                                    </div>

                                    {/* Appointment Card Line */}
                                    <div className={`w-1 self-stretch rounded-full ${isConfirmed ? 'bg-primary' : 'bg-orange-400'}`} />

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarFallback>PT</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="font-semibold text-sm">Patient {appt.userId.substring(0,6)}</h3>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                        <Badge variant="outline" className="font-normal">{appt.sessionType}</Badge>
                                                        {!isConfirmed && <Badge variant="secondary" className="text-orange-600 bg-orange-100">{appt.status}</Badge>}
                                                    </div>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>View Patient Details</DropdownMenuItem>
                                                    <DropdownMenuItem>Reschedule</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive">Cancel Appointment</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </div>
                                )
                            })
                        ) : (
                            <div className="text-center py-8 text-muted-foreground border-dashed border-2 rounded-xl">
                                No appointments scheduled for this date.
                            </div>
                        )}

                        {/* Empty Slot Example */}
                        <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed hover:bg-muted/30 transition-colors cursor-pointer opacity-70 hover:opacity-100">
                            <div className="flex flex-col items-center gap-1 min-w-[4rem] text-sm text-muted-foreground">
                                <span>04:00 PM</span>
                            </div>
                            <div className="w-1 self-stretch bg-transparent" />
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Plus className="h-4 w-4" />
                                <span>Available for booking</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
