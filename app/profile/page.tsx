"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

const DROPDOWN_OPTIONS = {
    gender: ["Male", "Female", "Prefer not to say"],
    preferredLanguage: ["English", "Hindi", "Both"],
    primaryConcern: ["Anxiety & Stress", "Low Mood", "Career Direction"],
    therapyPreference: ["Chat", "Video", "Both"],
    previousExperience: ["Yes", "No", "Not sure"],
    sleepPattern: ["Good", "Average", "Poor"],
    supportSystem: ["Friends/Family", "Limited", "None"],
    stressLevel: ["Low", "Medium", "High"],
    spirituality: ["Yes", "No", "Somewhat"]
};

const SOCIAL_PLATFORMS = [
    { id: "youtube", label: "YouTube", question: "What do you like to watch on YouTube? (e.g., Podcasts, Motivational)" },
    { id: "instagram", label: "Instagram", question: "What content do you enjoy on Instagram? (e.g., Reels, Quotes)" },
    { id: "twitter", label: "Twitter (X)", question: "What do you follow on Twitter? (e.g., Tech, News)" },
    { id: "reddit", label: "Reddit", question: "Which topics do you follow on Reddit? (e.g., Career, Hobbies)" },
];

const HOBBIES = ["Watching videos", "Listening to music", "Drawing", "Exploring / traveling", "Reading", "Gaming"];
const MUSIC_GENRES = ["Pop", "Rock", "Indie", "Classical", "Hip Hop", "Jazz", "Electronic", "Bollywood", "K-Pop", "Other"];
const BINGE_TYPES = ["Movies", "Series", "Anime", "Comics/Manga", "None"];

const DEFAULT_PROFILE = {
    gender: "Prefer not to say",
    preferredLanguage: "English",
    primaryConcern: "Anxiety & Stress",
    therapyPreference: "Video",
    previousExperience: "No",
    sleepPattern: "Average",
    supportSystem: "Friends/Family",
    stressLevel: "Medium",
    spirituality: "Somewhat"
};

export default function ProfilePage() {
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [socialPlatforms, setSocialPlatforms] = useState<string[]>([]);
    const [socialPreferences, setSocialPreferences] = useState<Record<string, string>>({});
    const [hobbies, setHobbies] = useState<string[]>([]);
    const [otherHobby, setOtherHobby] = useState("");
    const [musicGenre, setMusicGenre] = useState("");
    const [favoriteArtist, setFavoriteArtist] = useState("");
    const [bingeType, setBingeType] = useState("None");
    const [bingeList, setBingeList] = useState(["", "", ""]);
    const [comfortArtist, setComfortArtist] = useState("");
    const [favoriteComedian, setFavoriteComedian] = useState("");
    const [loading, setLoading] = useState(true); // Start loading true to fetch data

    // Fetch Profile Data on Mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/profile");
                if (res.status === 401) {
                    toast("Unauthorized", { description: "Please login to edit your profile." });
                    return;
                }
                const data = await res.json();

                if (data && Object.keys(data).length > 0) {
                    console.log("Fetched Profile Data:", data);

                    // Basic Details
                    const { socialPlatforms, socialPreferences, hobbies, musicDetails, entertainment, ...basicData } = data;

                    // Filter out non-basic fields from formData spread
                    const cleanBasicData = { ...basicData };
                    ['id', 'userId', 'createdAt', 'updatedAt'].forEach(k => delete cleanBasicData[k]);
                    setFormData(cleanBasicData);

                    // Social Media
                    if (Array.isArray(socialPlatforms)) setSocialPlatforms(socialPlatforms);
                    if (socialPreferences) setSocialPreferences(socialPreferences);

                    // Hobbies
                    if (Array.isArray(hobbies)) {
                        const standard = hobbies.filter((h: string) => HOBBIES.includes(h));
                        const other = hobbies.find((h: string) => !HOBBIES.includes(h));
                        setHobbies(standard);
                        if (other) setOtherHobby(other);
                    }

                    // Music
                    if (musicDetails) {
                        setMusicGenre(musicDetails.genre || "");
                        setFavoriteArtist(musicDetails.artist || "");
                    }

                    // Entertainment
                    if (entertainment) {
                        setBingeType(entertainment.bingeType || "None");
                        if (Array.isArray(entertainment.bingeList)) setBingeList(entertainment.bingeList);
                        setComfortArtist(entertainment.comfortArtist || "");
                        setFavoriteComedian(entertainment.favoriteComedian || "");
                    }
                }
            } catch (error) {
                console.error("Failed to load profile", error);
                toast("Error", { description: "Could not load existing profile." });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleValueChange = (key: string, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handlePlatformToggle = (platformId: string) => {
        setSocialPlatforms(prev =>
            prev.includes(platformId)
                ? prev.filter(p => p !== platformId)
                : [...prev, platformId]
        );
    };

    const handlePreferenceChange = (platformId: string, value: string) => {
        setSocialPreferences(prev => ({ ...prev, [platformId]: value }));
    };

    const handleHobbyToggle = (hobby: string) => {
        setHobbies(prev =>
            prev.includes(hobby)
                ? prev.filter(h => h !== hobby)
                : [...prev, hobby]
        );
    };

    const handleBingeChange = (index: number, value: string) => {
        const newList = [...bingeList];
        newList[index] = value;
        setBingeList(newList);
    };

    const autofillProfile = () => {
        setFormData(DEFAULT_PROFILE);
        setSocialPlatforms(["youtube", "instagram"]);
        setSocialPreferences({
            youtube: "Standup comedies videos",
            instagram: "Reels and quotes"
        });
        setHobbies(["Watching videos", "Listening to music"]);
        setOtherHobby("Photography");
        setMusicGenre("Bollywood");
        setFavoriteArtist("Arijit Singh");
        setBingeType("Series");
        setBingeList(["Breaking Bad", "Stranger Things", "The Office"]);
        setComfortArtist("Prateek Kuhad");
        setFavoriteComedian("Anubhav Singh Bassi");
        toast("Profile Autofilled", {
            description: "Default values have been selected for you.",
        });
    };

    const saveProfile = async () => {
        setLoading(true);

        // Merge standard hobbies with other hobby
        const finalHobbies = [...hobbies];
        if (otherHobby && otherHobby.trim() !== "") {
            finalHobbies.push(otherHobby);
        }

        const finalData = {
            ...formData,
            socialPlatforms,
            socialPreferences,
            hobbies: finalHobbies,
            musicDetails: hobbies.includes("Listening to music") ? { genre: musicGenre, artist: favoriteArtist } : null,
            entertainment: {
                bingeType,
                bingeList: bingeType !== "None" ? bingeList : [],
                comfortArtist,
                favoriteComedian
            }
        };

        console.log("[USER PROFILE UPDATE]", finalData);

        try {
            const response = await fetch("/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(finalData),
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
        <div className="container mx-auto py-10 max-w-3xl animate-in fade-in-50">
            <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
            <div className="space-y-6">

                {/* Core Profile Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Details</CardTitle>
                        <CardDescription>
                            Help us understand your background for better matches.
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
                </Card>

                {/* Social Media Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Social Media Interests</CardTitle>
                        <CardDescription>
                            Which platforms do you use most? This helps AI personalize content for you.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {SOCIAL_PLATFORMS.map(platform => (
                                <div key={platform.id} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => handlePlatformToggle(platform.id)}>
                                    <Checkbox
                                        id={platform.id}
                                        checked={socialPlatforms.includes(platform.id)}
                                        onCheckedChange={() => handlePlatformToggle(platform.id)}
                                    />
                                    <Label htmlFor={platform.id} className="cursor-pointer font-medium">{platform.label}</Label>
                                </div>
                            ))}
                        </div>

                        {socialPlatforms.length > 0 && (
                            <div className="space-y-4 pt-2 animate-in slide-in-from-top-2">
                                <Separator />
                                <h3 className="tex-sm font-semibold text-muted-foreground">Tell us a bit more...</h3>
                                {SOCIAL_PLATFORMS.filter(p => socialPlatforms.includes(p.id)).map(platform => (
                                    <div key={`pref-${platform.id}`} className="space-y-2">
                                        <Label className="text-sm font-medium">{platform.question}</Label>
                                        <Textarea
                                            placeholder="Type here..."
                                            className="h-20"
                                            value={socialPreferences[platform.id] || ""}
                                            onChange={(e) => handlePreferenceChange(platform.id, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Hobbies Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Hobbies & Interests</CardTitle>
                        <CardDescription>What do you enjoy doing in your free time?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {HOBBIES.map(hobby => (
                                <div key={hobby} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`hobby-${hobby}`}
                                        checked={hobbies.includes(hobby)}
                                        onCheckedChange={() => handleHobbyToggle(hobby)}
                                    />
                                    <Label htmlFor={`hobby-${hobby}`} className="font-normal">{hobby}</Label>
                                </div>
                            ))}
                        </div>

                        {/* Special Logic for Listening to Music */}
                        {hobbies.includes("Listening to music") && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 mt-2 animate-in slide-in-from-top-2 bg-muted/20 p-4 rounded-lg">
                                <div className="space-y-2">
                                    <Label>Favorite Genre</Label>
                                    <Select value={musicGenre} onValueChange={setMusicGenre}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Genre" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MUSIC_GENRES.map(g => (
                                                <SelectItem key={g} value={g}>{g}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Favorite Artist / Band</Label>
                                    <Input
                                        placeholder="e.g. Arijit Singh, Taylor Swift"
                                        value={favoriteArtist}
                                        onChange={(e) => setFavoriteArtist(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="pt-2">
                            <Label className="mb-2 block text-sm font-medium">Other (Optional)</Label>
                            <Input
                                placeholder="e.g., Photography, Cooking..."
                                value={otherHobby}
                                onChange={(e) => setOtherHobby(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Entertainment Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Entertainment & Relaxation</CardTitle>
                        <CardDescription>Share your comfort shows and music to help us know you.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Binge List */}
                        <div className="space-y-4">
                            <Label>Favorite Binge List (Movies, Series, Comics)</Label>
                            <Select value={bingeType} onValueChange={setBingeType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {BINGE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                            </Select>

                            {bingeType !== "None" && (
                                <div className="grid grid-cols-1 gap-3 animate-in slide-in-from-top-2">
                                    <Label className="text-sm text-muted-foreground">Top 3 Favorites:</Label>
                                    {bingeList.map((item, idx) => (
                                        <Input
                                            key={idx}
                                            placeholder={`#${idx + 1} ${bingeType === 'Comics/Manga' ? 'Comic/Manga Name' : 'Title'}`}
                                            value={item}
                                            onChange={(e) => handleBingeChange(idx, e.target.value)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Playlist Link */}
                        {/* Comfort Artist & Comedian */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Favorite Comfort Artist</Label>
                                <Input
                                    placeholder="e.g. Prateek Kuhad"
                                    value={comfortArtist}
                                    onChange={(e) => setComfortArtist(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Favorite Comedian</Label>
                                <Input
                                    placeholder="e.g. Zakir Khan"
                                    value={favoriteComedian}
                                    onChange={(e) => setFavoriteComedian(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-6">
                        <Button variant="outline" onClick={autofillProfile}>
                            Autofill Profile
                        </Button>
                        <Button onClick={saveProfile} disabled={loading} size="lg" className="px-8">
                            {loading ? "Saving..." : "Save Profile"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
