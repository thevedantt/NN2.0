"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"

export default function OnboardingPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        fullName: "",
        mobileNumber: "",
        licenseNumber: "",
        specializations: [] as string[],
        perSessionFee: "",
        preferredSessionType: "Video"
    })

    const SPECIALIZATIONS = ["Anxiety", "Depression", "Stress", "Trauma", "Relationships", "Career", "Adolescents"]

    const handleSpecChange = (spec: string, isChecked: boolean) => {
        if (isChecked) {
            setFormData(prev => ({ ...prev, specializations: [...prev.specializations, spec] }))
        } else {
            setFormData(prev => ({ ...prev, specializations: prev.specializations.filter(s => s !== spec) }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const token = localStorage.getItem("token")
        if (!token) {
            toast.error("You must be logged in.")
            router.push("/auth/login")
            return
        }

        setIsLoading(true)
        try {
            const res = await fetch("/api/therapist/onboarding", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                toast.success("Profile completed successfully!")
                // Force logout or token refresh to get new claims?
                // Actually, middleware might block them until they have a new token with isOnboardingComplete=true.
                // The frontend cannot easily update the HTTP-only cookie or JWT.
                // The standard pattern: User must re-login to update claims OR we have a refresh mechanism.
                // For this hackathon scope, asking them to re-login is safest/easiest to update the JWT.
                toast.info("Please log in again to access your dashboard.")
                localStorage.removeItem("token")
                // Adding a delay so they see the toast
                setTimeout(() => router.push("/auth/login"), 2000)
            } else {
                const data = await res.json()
                toast.error("Failed to save profile", { description: data.error })
            }
        } catch (error) {
            toast.error("Error submitting form")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container mx-auto py-10 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Therapist Onboarding</CardTitle>
                    <CardDescription>
                        Complete your professional profile to start accepting patients.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    required
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mobileNumber">Mobile Number</Label>
                                <Input
                                    id="mobileNumber"
                                    type="tel"
                                    required
                                    value={formData.mobileNumber}
                                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="licenseNumber">License Number</Label>
                            <Input
                                id="licenseNumber"
                                required
                                placeholder="e.g. A-123456"
                                value={formData.licenseNumber}
                                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Specializations</Label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {SPECIALIZATIONS.map((spec) => (
                                    <div key={spec} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`spec-${spec}`}
                                            checked={formData.specializations.includes(spec)}
                                            onCheckedChange={(checked) => handleSpecChange(spec, checked as boolean)}
                                        />
                                        <label htmlFor={`spec-${spec}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            {spec}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="perSessionFee">Per Session Fee (₹)</Label>
                                <Input
                                    id="perSessionFee"
                                    type="number"
                                    required
                                    placeholder="1500"
                                    value={formData.perSessionFee}
                                    onChange={(e) => setFormData({ ...formData, perSessionFee: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sessionType">Preferred Session Type</Label>
                                <Select
                                    value={formData.preferredSessionType}
                                    onValueChange={(val) => setFormData({ ...formData, preferredSessionType: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Video">Video</SelectItem>
                                        <SelectItem value="Audio">Audio</SelectItem>
                                        <SelectItem value="Both">Both</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Saving Profile..." : "Complete Onboarding"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
