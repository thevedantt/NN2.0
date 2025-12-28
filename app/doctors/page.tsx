"use client"

import { DOCTORS } from "@/data/doctors"
import { DoctorCard } from "@/components/doctors/DoctorCard"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function DoctorsPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <header className="mb-8 flex flex-col items-start gap-4">
                <Link href="/chat-ai">
                    <Button variant="ghost" size="sm" className="pl-0 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to AI Chat
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Find a Specialist</h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl">
                        Our licensed professionals are here to help. Select a doctor to view their profile and book a consultation.
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {DOCTORS.map((doctor) => (
                    <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
            </div>

            <div className="mt-12 p-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg text-center">
                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">Need Immediate Help?</h3>
                <p className="text-amber-700 dark:text-amber-300 text-sm mb-4">
                    If you are in crisis or need urgent support, please contact emergency services or a crisis helpline immediately.
                </p>
                <div className="flex gap-4 justify-center">
                    <Button variant="destructive" className="bg-amber-600 hover:bg-amber-700 text-white">Call Crisis Line</Button>
                </div>
            </div>
        </div>
    )
}
