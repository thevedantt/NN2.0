"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Send, Users, Info, Flag, MoreVertical, ArrowLeft, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

// Mock Data
const GROUP_INFO = {
    "1": { name: "Anxiety Warriors", members: 1205, topic: "Anxiety", description: "A safe space to share strategies for managing daily anxiety and panic attacks." },
    "2": { name: "Mindful Living", members: 890, topic: "Wellness", description: "Practicing mindfulness, meditation, and staying present in the moment." },
}

const INITIAL_MESSAGES = [
    { id: "1", user: "CalmBadger", avatar: "CB", content: "Had a tough morning, but trying deep breathing. Anyone else struggles with morning anxiety?", time: "10:30 AM", likes: 5 },
    { id: "2", user: "HopefulSky", avatar: "HS", content: "Yes! I find that drinking water first thing helps ground me. You're not alone.", time: "10:32 AM", likes: 3 },
    { id: "3", user: "GentleRain", avatar: "GR", content: "I listed 3 things I'm grateful for. It's a small step but it shifts the focus.", time: "10:35 AM", likes: 8 },
]

export default function GroupChatPage() {
    const params = useParams()
    const router = useRouter()
    const id = params?.id as string
    const group = GROUP_INFO[id as keyof typeof GROUP_INFO] || { name: "Community Group", members: 0, topic: "Support", description: "Welcome to the group." }

    const [messages, setMessages] = React.useState(INITIAL_MESSAGES)
    const [inputValue, setInputValue] = React.useState("")

    const handleSendMessage = () => {
        if (!inputValue.trim()) return
        const newMessage = {
            id: Date.now().toString(),
            user: "Me (Anonymous)",
            avatar: "ME",
            content: inputValue,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            likes: 0
        }
        setMessages([...messages, newMessage])
        setInputValue("")
    }

    return (
        <div className="flex h-full max-h-screen overflow-hidden">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-background/50">
                <header className="h-16 border-b flex items-center justify-between px-4 md:px-6 bg-background/95 backdrop-blur z-10">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="md:hidden">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <Avatar className="h-10 w-10 border">
                            <AvatarFallback className="bg-primary/5 text-primary">{group.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="font-semibold leading-none">{group.name}</h1>
                            <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Users className="h-3 w-3" /> {group.members} members
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Info className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent>
                                <SheetHeader>
                                    <SheetTitle>About Group</SheetTitle>
                                </SheetHeader>
                                <div className="py-6 space-y-6">
                                    <div>
                                        <h4 className="text-sm font-medium mb-2">Description</h4>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{group.description}</p>
                                    </div>
                                    <Separator />
                                    <div>
                                        <h4 className="text-sm font-medium mb-2">Group Rules</h4>
                                        <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                                            <li>Be respectful and kind.</li>
                                            <li>No medical advice.</li>
                                            <li>Respect privacy.</li>
                                            <li>Report harmful content.</li>
                                        </ul>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-center">
                                        <Button variant="outline" className="w-full border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600">Leave Group</Button>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                    {messages.map((msg) => (
                        <Card key={msg.id} className="border-border/60 bg-card/60 rounded-xl p-4 max-w-2xl mx-auto shadow-sm">
                            <div className="flex items-start gap-4">
                                <Avatar className="h-8 w-8 mt-1">
                                    <AvatarFallback className={cn("text-xs font-medium", msg.user === "Me (Anonymous)" ? "bg-primary text-primary-foreground" : "bg-muted")}>{msg.avatar}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-foreground/90">{msg.user}</span>
                                        <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                                    </div>
                                    <p className="text-sm text-foreground/80 leading-relaxed">{msg.content}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="p-4 md:p-6 border-t bg-background/95 backdrop-blur">
                    <div className="max-w-2xl mx-auto flex gap-2">
                        <Input
                            placeholder="Type a supportive message..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="bg-card border-border/60"
                        />
                        <Button size="icon" onClick={handleSendMessage} disabled={!inputValue.trim()}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Right Panel (Desktop) */}
            <div className="hidden lg:block w-80 border-l p-6 bg-card/30">
                <h3 className="font-semibold mb-6">About this Group</h3>
                <div className="space-y-6">
                    <div className="p-4 bg-background/50 rounded-lg border text-center">
                        <h4 className="font-medium text-2xl text-primary">{group.members}</h4>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Members</span>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                            <Info className="h-4 w-4 text-primary" />
                            Description
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{group.description}</p>
                    </div>

                    <Separator />

                    <div>
                        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            Community Rules
                        </h4>
                        <ul className="text-xs text-muted-foreground space-y-3">
                            <li className="flex gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                                Respect everyone's journey. Zero tolerance for hate speech.
                            </li>
                            <li className="flex gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                                This is peer support, not professional medical advice.
                            </li>
                            <li className="flex gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                                Maintain anonymity and confidentiality.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
