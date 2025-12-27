"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAppointment } from "@/context/AppointmentContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, ChevronLeft, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function BookingSchedulePage() {
    const router = useRouter()
    const { selectedDoctor, bookingStep, setBookingStep } = useAppointment()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Redirect if no doctor selected
    useEffect(() => {
        if (!selectedDoctor) {
            router.push("/appointments")
        }
    }, [selectedDoctor, router])

    if (!selectedDoctor) return null

    const handleConfirm = async () => {
        setIsSubmitting(true)

        try {
            const bookingPayload = {
                doctor: selectedDoctor,
                date: new Date().toISOString(),
                time: "10:00 AM"
            }

            console.log("🚀 Sending Booking Request:", bookingPayload)

            const res = await fetch('/api/appointments/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingPayload)
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || "Booking Failed")

            console.log("✅ Booking Success (DB):", data)

            setBookingStep('success')
        } catch (error) {
            console.error("❌ Booking Error:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (bookingStep === 'success') {
        return (
            <div className="flex-1 flex items-center justify-center p-6 bg-background">
                <Card className="w-full max-w-md text-center p-8 space-y-6">
                    <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
                        <p className="text-muted-foreground mt-2">
                            Your session with {selectedDoctor.name} has been scheduled.
                        </p>
                    </div>
                    <Button onClick={() => router.push("/appointments")} className="w-full">
                        Return to Appointments
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-y-auto w-full p-6 md:p-8 bg-background">
            <div className="max-w-4xl mx-auto w-full">
                <Button variant="ghost" size="sm" asChild className="pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground mb-6">
                    <Link href="/appointments">
                        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Selection
                    </Link>
                </Button>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left: Doctor Summary */}
                    <Card className="md:col-span-1 h-fit border-border/60">
                        <div className="relative h-48 w-full">
                            <Image
                                src={selectedDoctor.image}
                                alt={selectedDoctor.name}
                                fill
                                className="object-cover rounded-t-xl"
                            />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-xl">{selectedDoctor.name}</CardTitle>
                            <CardDescription className="text-primary font-medium">{selectedDoctor.specialization}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Price</span>
                                <span className="font-semibold">${selectedDoctor.price}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Duration</span>
                                <span className="font-semibold">50 mins</span>
                            </div>
                            <div className="pt-2">
                                <Badge variant="secondary" className="w-full justify-center">
                                    {selectedDoctor.experience} Years Experience
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right: Booking Details (Placeholder) */}
                    <div className="md:col-span-2 space-y-6">
                        <Card className="border-border/60">
                            <CardHeader>
                                <CardTitle>Complete Booking</CardTitle>
                                <CardDescription>Review details and confirm your appointment.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="p-4 rounded-lg bg-secondary/20 border border-border/50 flex flex-col gap-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Date & Time</p>
                                            <p className="text-muted-foreground text-xs">Selection coming soon...</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Session Type</p>
                                            <p className="text-muted-foreground text-xs">Video Consultation</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg flex gap-3 items-start text-sm text-blue-700 dark:text-blue-400">
                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <p>No payment is required right now. You will be charged after the session.</p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                                <Button onClick={handleConfirm} disabled={isSubmitting} className="min-w-[120px]">
                                    {isSubmitting ? "Processing..." : "Confirm Booking"}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
