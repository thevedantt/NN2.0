"use client"

import * as React from "react"
import { Camera, MapPin, Mail, Shield, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function BuddyProfilePage() {
    return (
        <div className="flex-1 h-full overflow-y-auto p-6 md:p-8 bg-background max-w-4xl mx-auto w-full">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">My Buddy Profile</h1>
                <p className="text-muted-foreground mt-1">Manage how you appear to others in the community.</p>
            </header>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Visual Identity Column */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="text-center">
                            <div className="mx-auto relative mb-4">
                                <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
                                    <AvatarFallback className="text-4xl bg-primary/10 text-primary">me</AvatarFallback>
                                </Avatar>
                                <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full h-8 w-8 shadow-sm">
                                    <Camera className="h-4 w-4" />
                                </Button>
                            </div>
                            <CardTitle>Display Name</CardTitle>
                            <CardDescription>@username</CardDescription>
                            <div className="mt-4 flex items-center justify-center gap-2">
                                <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                                    <Shield className="h-3 w-3 mr-1" /> Verified Buddy
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                                <span className="text-sm font-medium">Availability</span>
                                <Switch defaultChecked />
                            </div>
                            <div className="text-xs text-muted-foreground text-center">
                                You are currently visible in search.
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Account Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Member since</span>
                                <span>Dec 2024</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Sessions</span>
                                <span>12</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Rating</span>
                                <span>4.9/5.0</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Edit Form Column */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Details</CardTitle>
                            <CardDescription>Update your public profile information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">Display Name</Label>
                                    <Input id="firstName" placeholder="Aarav" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pronouns">Pronouns</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="they">They/Them</SelectItem>
                                            <SelectItem value="he">He/Him</SelectItem>
                                            <SelectItem value="she">She/Her</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    placeholder="Tell others a bit about yourself..."
                                    className="resize-none min-h-[100px]"
                                />
                                <p className="text-[10px] text-muted-foreground text-right">0/150 characters</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Interests & Topics</Label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    <Badge variant="secondary" className="cursor-pointer hover:bg-destructive/20 hover:text-destructive">Anxiety <span className="ml-1">×</span></Badge>
                                    <Badge variant="secondary" className="cursor-pointer hover:bg-destructive/20 hover:text-destructive">Meditation <span className="ml-1">×</span></Badge>
                                    <Badge variant="outline" className="border-dashed cursor-pointer hover:bg-primary/5">+ Add Topic</Badge>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-end border-t pt-6">
                            <Button>Save Changes</Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Preferences</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Email Notifications</Label>
                                    <p className="text-xs text-muted-foreground">Receive updates about new requests.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Show Online Status</Label>
                                    <p className="text-xs text-muted-foreground">Let connections know when you're active.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
