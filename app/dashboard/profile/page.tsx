
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const DROPDOWN_OPTIONS = {
    gender: ["Male", "Female", "Prefer not to say"],
    preferredLanguage: ["English", "Hindi", "Both"],
    primaryConcern: ["Anxiety & Stress", "Low Mood", "Career Direction"],
    therapyPreference: ["Chat", "Video", "Both"],
    previousExperience: ["Yes", "No", "Not sure"],
    sleepPattern: ["Good", "Average", "Poor"],
    supportSystem: ["Friends/Family", "Limited", "None"],
    stressLevel: ["Low", "Medium", "High"],
};

const DEFAULT_PROFILE = {
    gender: "Prefer not to say",
    preferredLanguage: "English",
    primaryConcern: "Anxiety & Stress",
    therapyPreference: "Video",
    previousExperience: "No",
    sleepPattern: "Average",
    supportSystem: "Friends/Family",
    stressLevel: "Medium",
};

export default function ProfilePage() {
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const handleValueChange = (key: string, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const autofillProfile = () => {
        setFormData(DEFAULT_PROFILE);
        toast("Profile Autofilled", {
            description: "Default values have been selected for you.",
        });
    };

    const saveProfile = async () => {
        setLoading(true);
        console.log("Saving Profile Data:", formData);

        try {
            const response = await fetch("/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Failed to save profile");
            }

            toast("Profile Saved", {
                description: "Your profile has been successfully updated.",
            });
        } catch (error) {
            console.error("Error saving profile:", error);
            toast("Error", {
                description: "Could not save profile. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 max-w-3xl">
            <Card>
                <CardHeader>
                    <CardTitle>User Profile</CardTitle>
                    <CardDescription>
                        Update your profile details to help us personalize your experience.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    {Object.entries(DROPDOWN_OPTIONS).map(([key, options]) => (
                        <div key={key} className="space-y-2">
                            <Label htmlFor={key} className="capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                            </Label>
                            <Select
                                value={formData[key] || ""}
                                onValueChange={(value) => handleValueChange(key, value)}
                            >
                                <SelectTrigger id={key}>
                                    <SelectValue placeholder="Select an option" />
                                </SelectTrigger>
                                <SelectContent>
                                    {options.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ))}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={autofillProfile}>
                        Autofill Profile
                    </Button>
                    <Button onClick={saveProfile} disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
