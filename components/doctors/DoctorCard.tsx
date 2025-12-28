"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Doctor } from "@/data/doctors"
import { useAppointment } from "@/context/AppointmentContext"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Star, Clock, CalendarDays } from "lucide-react"

interface DoctorCardProps {
    doctor: Doctor
}

export function DoctorCard({ doctor }: DoctorCardProps) {
    const router = useRouter()
    const { setSelectedDoctor, setBookingStep } = useAppointment()
    const [isUrgent, setIsUrgent] = useState(false)

    const handleBook = () => {
        setSelectedDoctor(doctor)
        setBookingStep('view') // Start at view step of booking (or confirm if we want to skip details)
        // Navigate to booking page
        // Assuming we will create /appointments/book as the booking flow
        // But if we are ON the booking page selection list, we navigate to the next step?
        // Let's assume this card is shown on the selection list, and clicking "Book" goes to the details/confirm page.
        // Let's use /appointments/book/schedule
        router.push("/appointments/book/schedule")
    }

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 bg-card group">
            <div className="relative h-64 w-full overflow-hidden">
                <Image
                    src={doctor.image}
                    alt={doctor.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-semibold">{doctor.rating}</span>
                </div>
            </div>

            <CardHeader className="p-4 pb-2">
                <div className="flex flex-col items-start gap-1">
                    <div>
                        <h3 className="font-bold text-lg text-foreground line-clamp-1">{doctor.name}</h3>
                        <p className="text-sm text-primary font-medium">{doctor.specialization}</p>
                    </div>
                    <Badge variant="outline" className="text-xs bg-secondary hover:bg-secondary/80">
                        {doctor.experience}y exp
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-2 space-y-3 flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">
                    {doctor.description}
                </p>

                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-md">
                        <CalendarDays className="w-3 h-3" />
                        <span>{doctor.availability.join(", ")}</span>
                    </div>
                </div>

                <div className="flex items-center space-x-2 mt-4 pt-2 border-t border-border/40">
                    <Switch id={`urgent-mode-${doctor.id}`} checked={isUrgent} onCheckedChange={setIsUrgent} />
                    <Label htmlFor={`urgent-mode-${doctor.id}`} className={`text-xs font-medium cursor-pointer ${isUrgent ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                        {isUrgent ? 'Urgent Priority On' : 'Enable Urgent Priority'}
                    </Label>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 flex items-center justify-between gap-3 mt-auto">
                <div className="text-sm font-semibold text-lg">
                    ₹{doctor.price}<span className="text-muted-foreground font-normal text-sm">/session</span>
                </div>
                <Button
                    onClick={handleBook}
                    className={`shadow-md transition-colors ${isUrgent ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary/90'}`}
                >
                    {isUrgent ? 'Book Urgent' : 'Book Appointment'}
                </Button>
            </CardFooter>
        </Card>
    )
}
