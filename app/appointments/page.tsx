"use client"

import * as React from "react"
import { Calendar as CalendarIcon, Clock, Video, User, MapPin, MoreHorizontal, ChevronRight, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

import { DOCTORS } from "@/data/doctors"
import { DoctorCard } from "@/components/doctors/DoctorCard"
import { useLanguage } from "@/context/LanguageContext"
// import { useToast } from "@/hooks/use-toast" // Note: using standard alert if toast is broken or missing, but let's assume it exists or replace
import { toast } from "sonner" // if useToast is missing, replace with Sonner or custom. Let's try to mock it internally if hook is missing or use standard alert.

// For now, let's remove useToast and rely on default JS alert to be safe since the hook import failed.

interface Appointment {
    appointmentId: number
    doctorId: string
    doctorSnapshot: any
    appointmentDate: string
    appointmentTime: string
    sessionType: string
    status: string
    meetLink?: string
}

interface Therapist {
    userId: string
    fullName: string
    specializations: string[]
    isVerified: boolean
    walletAddress?: string
}

export default function AppointmentsPage() {
    const [date, setDate] = React.useState<Date | undefined>(new Date())
    const [activeTab, setActiveTab] = React.useState("upcoming")

    const [appointments, setAppointments] = React.useState<Appointment[]>([])
    const [therapists, setTherapists] = React.useState<Therapist[]>([])
    const [loading, setLoading] = React.useState(true)

    const fetchData = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem("token")
            const authHeaders: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}

            const [aptRes, therRes] = await Promise.all([
                fetch('/api/appointments', { headers: authHeaders }).then(r => r.json()),
                fetch('/api/therapist/list').then(r => r.json())
            ]);

            if (aptRes.success) setAppointments(aptRes.appointments || []);
            const EXCLUDED_NAMES = ["Dr. Sarah Mitchell", "Dr. James Wilson", "Dr. Michael Ross", "Dr. Emily Chen", "Mayur"]
            if (therRes.therapists) setTherapists(
                (therRes.therapists || []).filter((t: Therapist) => !EXCLUDED_NAMES.includes(t.fullName))
            );
        } catch (err) {
            console.error("Failed to load appointments data", err);
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        fetchData();
    }, [])

    return (
        <div className="flex-1 overflow-y-auto w-full p-6 md:p-8 bg-background">
            <div className="max-w-6xl mx-auto w-full">
                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Appointments</h1>
                        <p className="text-muted-foreground mt-1">Manage your sessions and schedule new ones.</p>
                    </div>
                    <Button className="shadow-sm" onClick={() => setActiveTab("book")}>
                        <Plus className="mr-2 h-4 w-4" /> Book New Session
                    </Button>
                </header>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left: Upcoming / Past List */}
                    <div className="lg:col-span-2 space-y-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-6">
                                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                                <TabsTrigger value="past">Past</TabsTrigger>
                                <TabsTrigger value="book">Find Therapist</TabsTrigger>
                            </TabsList>
                            <TabsContent value="upcoming" className="space-y-4">
                                {loading ? (
                                    <div className="text-center py-8 text-muted-foreground">Loading appointments...</div>
                                ) : appointments.filter(a => a.status === 'scheduled').length > 0 ? (
                                    appointments.filter(a => a.status === 'scheduled').map((apt) => (
                                        <AppointmentCard key={apt.appointmentId} appointment={apt} onUpdate={fetchData} />
                                    ))
                                ) : (
                                    <EmptyState onBook={() => setActiveTab("book")} />
                                )}
                            </TabsContent>
                            <TabsContent value="past" className="space-y-4">
                                {appointments.filter(a => a.status === 'completed' || a.status === 'cancelled').map((apt) => (
                                    <AppointmentCard key={apt.appointmentId} appointment={apt} isPast onUpdate={fetchData} />
                                ))}
                            </TabsContent>
                            <TabsContent value="book" className="space-y-6">
                                <div className="space-y-2 mb-4">
                                    <h3 className="text-lg font-semibold">Available Specialists</h3>
                                    <p className="text-sm text-muted-foreground">Select a therapist to book a session.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                    {loading ? (
                                        <div className="col-span-2 text-center py-8 text-muted-foreground">Loading therapists...</div>
                                    ) : therapists.length > 0 ? (
                                        therapists.map((therapist, index) => {
                                            const THERAPIST_IMAGES = ["/thp1.jpg", "/thp2.jpg", "/thp3.jpg", "/thp4.jpg"]
                                            const EXPERIENCES = [5, 8, 10, 12, 7, 15, 6, 9]
                                            const RATINGS = [4.7, 4.8, 4.9, 4.6, 4.8, 4.9, 4.7, 4.8]
                                            const PRICES = [499, 599, 699, 799, 549, 649, 749, 499]
                                            const AVAILABILITIES = [
                                                ["Mon", "Wed", "Fri"],
                                                ["Mon", "Thu", "Sat"],
                                                ["Tue", "Thu"],
                                                ["Wed", "Sat", "Sun"],
                                                ["Mon", "Tue", "Fri"],
                                                ["Thu", "Fri", "Sat"],
                                                ["Mon", "Wed", "Sun"],
                                                ["Tue", "Wed", "Thu"],
                                            ]
                                            const LANGUAGES = [
                                                ["English", "Hindi"],
                                                ["English", "Hindi", "Punjabi"],
                                                ["English", "Hindi", "Gujarati"],
                                                ["English", "Hindi", "Marathi"],
                                                ["English", "Hindi"],
                                                ["English", "Marathi"],
                                                ["English", "Hindi", "Tamil"],
                                                ["English", "Hindi", "Bengali"],
                                            ]
                                            const DESCRIPTIONS = [
                                                "Specializing in CBT and mindfulness-based therapies for anxiety and depression management.",
                                                "Expert in trauma-informed care and EMDR therapy for healing and recovery.",
                                                "Helping professionals navigate workplace stress, burnout, and career transitions.",
                                                "Specialized in couples counseling, family dynamics, and conflict resolution.",
                                                "Focused on helping young adults build resilience and emotional intelligence.",
                                                "Experienced in grief counseling, life transitions, and personal growth.",
                                                "Skilled in DBT and emotion regulation for mood and personality challenges.",
                                                "Dedicated to supporting children and adolescents through mental health journeys.",
                                            ]
                                            const i = index % 8
                                            const doc: any = {
                                                id: therapist.userId,
                                                name: therapist.fullName,
                                                image: THERAPIST_IMAGES[index % THERAPIST_IMAGES.length],
                                                specialization: therapist.specializations?.[0] || "General Therapy",
                                                experience: EXPERIENCES[i],
                                                languages: LANGUAGES[i],
                                                description: DESCRIPTIONS[i],
                                                availability: AVAILABILITIES[i],
                                                price: PRICES[i],
                                                rating: RATINGS[i],
                                            };
                                            return <DoctorCard key={therapist.userId} doctor={doc} />
                                        })
                                    ) : (
                                        <div className="col-span-2 p-8 text-center text-muted-foreground border border-dashed rounded-lg">No specialists available</div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Right: Calendar & Mini Widget */}
                    <div className="space-y-6">
                        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Calendar</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 flex justify-center pb-4">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="rounded-md border-0"
                                />
                            </CardContent>
                        </Card>

                        <Card className="bg-primary/5 border-primary/10">
                            <CardHeader>
                                <CardTitle className="text-base text-primary">Need urgent help?</CardTitle>
                                <CardDescription>Our crisis team is available 24/7.</CardDescription>
                            </CardHeader>
                            <CardFooter>
                                <Button variant="destructive" className="w-full text-xs">Contact Crisis Support</Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

function AppointmentCard({ appointment, isPast, onUpdate }: { appointment: Appointment, isPast?: boolean, onUpdate?: () => void }) {
    const [meetLinkInput, setMeetLinkInput] = React.useState("")
    const [isSaving, setIsSaving] = React.useState(false)

    const aptDate = new Date(appointment.appointmentDate)

    const handleSaveMeetLink = async () => {
        if (!meetLinkInput.trim()) return;
        setIsSaving(true)
        try {
            const response = await fetch(`/api/appointments/${appointment.appointmentId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ meetLink: meetLinkInput }),
            });
            if (response.ok) {
                alert("Meeting Link Saved. The therapist will use this link to join.")
                if (onUpdate) onUpdate()
            } else {
                alert("Failed to save the link.")
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Card className="overflow-hidden border-border/60 hover:shadow-md transition-shadow group">
            <div className="flex flex-col md:flex-row items-start md:items-center p-6 gap-6">
                {/* Date Box */}
                <div className="flex-none flex flex-col items-center justify-center p-4 bg-secondary/30 rounded-xl min-w-[80px]">
                    <span className="text-xs uppercase font-bold text-muted-foreground">{aptDate.toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-2xl font-bold text-foreground">{aptDate.getDate()}</span>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant={isPast ? "secondary" : "default"} className={cn("rounded-sm font-normal", !isPast && "bg-primary text-primary-foreground hover:bg-primary/90")}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Video className="h-3 w-3" /> {appointment.sessionType}
                        </span>
                    </div>
                    <h3 className="font-semibold text-lg">{appointment.doctorSnapshot?.name || "Therapist"}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {appointment.appointmentTime}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Online Meet</span>
                    </div>

                    {!isPast && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                            {appointment.meetLink ? (
                                <div className="text-sm bg-green-500/10 text-green-600 dark:text-green-400 p-2 rounded flex items-center gap-2">
                                    <Video className="h-4 w-4" /> Meeting link provided and sent to therapist
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <p className="text-xs text-muted-foreground">Please create a <a href="https://meet.google.com/new" target="_blank" rel="noreferrer" className="text-primary hover:underline">Google Meet</a> and paste the link below:</p>
                                    <div className="flex gap-2 max-w-sm">
                                        <Input
                                            placeholder="https://meet.google.com/abc-defg-hij"
                                            value={meetLinkInput}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMeetLinkInput(e.target.value)}
                                            className="h-9"
                                        />
                                        <Button size="sm" onClick={handleSaveMeetLink} disabled={!meetLinkInput || isSaving}>
                                            Save Link
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex-none flex flex-col md:flex-row items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
                    {!isPast && appointment.meetLink && (
                        <Button className="w-full md:w-auto" asChild>
                            <a href={appointment.meetLink} target="_blank" rel="noreferrer">Join Meet</a>
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    )
}

function EmptyState({ onBook }: { onBook?: () => void }) {
    return (
        <Card className="min-h-[200px] flex flex-col items-center justify-center p-8 text-center border-dashed">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <CalendarIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg">No upcoming sessions</h3>
            <p className="text-muted-foreground text-sm mt-1 mb-4">You have no appointments scheduled at the moment.</p>
            <Button onClick={onBook}>Schedule a Session</Button>
        </Card>
    )
}
