"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Doctor } from "@/data/doctors"
import { useAppointment } from "@/context/AppointmentContext"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, CalendarDays } from "lucide-react"

interface DoctorCardProps {
    doctor: Doctor
}

export function DoctorCard({ doctor }: DoctorCardProps) {
    const router = useRouter()
    const { setSelectedDoctor, setBookingStep } = useAppointment()

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
            <div className="relative h-48 w-full overflow-hidden">
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
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg text-foreground">{doctor.name}</h3>
                        <p className="text-sm text-primary font-medium">{doctor.specialization}</p>
                    </div>
                    <Badge variant="outline" className="text-xs bg-secondary hover:bg-secondary/80">
                        {doctor.experience}y exp
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-2 space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                    {doctor.description}
                </p>

                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-md">
                        <CalendarDays className="w-3 h-3" />
                        <span>{doctor.availability.join(", ")}</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 flex items-center justify-between gap-3">
                <div className="text-sm font-semibold">
                    ${doctor.price}<span className="text-muted-foreground font-normal">/session</span>
                </div>
                <Button
                    onClick={handleBook}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                >
                    Book Appointment
                </Button>
            </CardFooter>
        </Card>
    )
}
