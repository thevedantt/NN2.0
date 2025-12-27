"use client"

import * as React from "react"
import Link from "next/link"
import { Users, Search, MessageSquare, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const GROUPS = [
    { id: "1", name: "Anxiety Warriors", members: 1205, topic: "Anxiety", description: "A safe space to share strategies for managing daily anxiety and panic attacks.", type: "Public" },
    { id: "2", name: "Mindful Living", members: 890, topic: "Wellness", description: "Practicing mindfulness, meditation, and staying present in the moment.", type: "Public" },
    { id: "3", name: "Depression Support", members: 2300, topic: "Depression", description: "You are not alone. deeply supportive community for those navigating depression.", type: "Moderated" },
    { id: "4", name: "Social Confidence", members: 450, topic: "Social Anxiety", description: "Building confidence in social situations step by step.", type: "Public" },
    { id: "5", name: "Sleep & Insomnia", members: 670, topic: "Sleep", description: "Tips and support for better rest and sleep hygiene.", type: "Public" },
    { id: "6", name: "Work Stress", members: 1500, topic: "Career", description: "Navigating burnout and workplace stress together.", type: "Closed" },
]

export default function GroupsPage() {
    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Community Groups</h1>
                    <p className="text-muted-foreground mt-1">Connect with others who understand what you're going through.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Find a group..." className="pl-9 bg-background" />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {GROUPS.map((group) => (
                    <Card key={group.id} className="group hover:shadow-lg transition-all duration-300 border-border/60 bg-card/50 backdrop-blur-sm flex flex-col">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant="secondary" className="bg-secondary/50 hover:bg-secondary/70">{group.topic}</Badge>
                                {group.type === "Moderated" && (
                                    <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 flex gap-1 items-center">
                                        <Shield className="h-3 w-3" /> Safe Space
                                    </Badge>
                                )}
                            </div>
                            <h3 className="text-xl font-semibold leading-tight group-hover:text-primary transition-colors">{group.name}</h3>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-muted-foreground text-sm line-clamp-3">{group.description}</p>
                            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground font-medium">
                                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {group.members} Members</span>
                                <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Active now</span>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-0">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="w-full">Join Group</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Join {group.name}?</DialogTitle>
                                        <DialogDescription>
                                            This is a {group.type.toLowerCase()} group. Please agree to the community rules before joining.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="p-4 bg-muted/30 rounded-lg text-sm space-y-2 border">
                                        <p>1. Be kind and respectful.</p>
                                        <p>2. No medical advice.</p>
                                        <p>3. Maintain confidentiality.</p>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline">Cancel</Button>
                                        <Link href={`/groups/${group.id}`} passHref className="w-full sm:w-auto">
                                            <Button className="w-full">Agree & Join</Button>
                                        </Link>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
