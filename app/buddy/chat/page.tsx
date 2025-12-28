"use client"

import * as React from "react"
import { Send, Phone, Video, Info, MoreVertical, Image as ImageIcon, Mic, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const CONVERSATIONS = [
    { id: "1", name: "Aarav Rao", avatar: "AR", lastMessage: "Thanks for listening!", time: "2m", unread: 1, online: true },
    { id: "2", name: "Jay Chopra", avatar: "JC", lastMessage: "Let's catch up later.", time: "1h", unread: 0, online: false },
    { id: "3", name: "Sameer S.", avatar: "SS", lastMessage: "How was your day?", time: "3h", unread: 0, online: false },
]

const MESSAGES = [
    { id: "1", sender: "Aarav Rao", content: "Hey! How are you holding up today?", time: "10:30 AM", isMe: false },
    { id: "2", sender: "Me", content: "doing okay, just a bit overwhelmed with work.", time: "10:32 AM", isMe: true },
    { id: "3", sender: "Aarav Rao", content: "I totally get that. Remember to take small breaks! breaks are important.", time: "10:33 AM", isMe: false },
    { id: "4", sender: "Me", content: "Thanks for listening!", time: "10:35 AM", isMe: true },
]

export default function BuddyChatPage() {
    const [selectedChat, setSelectedChat] = React.useState<string | null>("1")
    const [input, setInput] = React.useState("")

    // Auto-scroll to bottom of chat
    const scrollRef = React.useRef<HTMLDivElement>(null)
    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [selectedChat])

    return (
        <div className="flex h-full max-h-screen overflow-hidden bg-background border rounded-lg m-4 shadow-sm">
            {/* Left: Chat List */}
            <div className={cn(
                "w-full md:w-80 border-r flex flex-col bg-card/50",
                selectedChat ? "hidden md:flex" : "flex"
            )}>
                <div className="p-4 border-b h-16 flex items-center justify-between">
                    <h2 className="font-semibold text-lg">Messages</h2>
                    <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
                </div>
                <div className="p-4 border-b bg-background/50">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {/* Stories/Active Users Row */}
                        {CONVERSATIONS.map(user => (
                            <div key={user.id} className="flex flex-col items-center gap-1 min-w-[60px] cursor-pointer" onClick={() => setSelectedChat(user.id)}>
                                <div className={cn("p-0.5 rounded-full border-2", user.id === selectedChat ? "border-primary" : "border-transparent")}>
                                    <Avatar className="h-14 w-14 border-2 border-background">
                                        <AvatarFallback>{user.avatar}</AvatarFallback>
                                    </Avatar>
                                </div>
                                <span className="text-xs text-muted-foreground truncate w-full text-center">{user.name.split(' ')[0]}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    {CONVERSATIONS.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => setSelectedChat(chat.id)}
                            className={cn(
                                "flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                                selectedChat === chat.id ? "bg-muted/80" : ""
                            )}
                        >
                            <div className="relative">
                                <Avatar>
                                    <AvatarFallback>{chat.avatar}</AvatarFallback>
                                </Avatar>
                                {chat.online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className={cn("font-medium text-sm", chat.unread ? "font-bold text-foreground" : "text-foreground")}>{chat.name}</h4>
                                    <span className={cn("text-xs", chat.unread ? "text-primary font-bold" : "text-muted-foreground")}>{chat.time}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className={cn("text-sm truncate mr-2", chat.unread ? "font-semibold text-foreground" : "text-muted-foreground")}>{chat.lastMessage}</p>
                                    {chat.unread > 0 && (
                                        <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground text-[10px]">{chat.unread}</Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </ScrollArea>
            </div>

            {/* Center: Active Chat Window */}
            {selectedChat ? (
                <div className="flex-1 flex flex-col bg-background h-full overflow-hidden">
                    {/* Chat Header */}
                    <header className="h-16 border-b flex items-center justify-between px-6 bg-card/30 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" className="md:hidden mr-1" onClick={() => setSelectedChat(null)}>
                                <span className="text-lg">←</span>
                            </Button>
                            <Avatar className="h-9 w-9">
                                <AvatarFallback>AR</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-semibold text-sm">Aarav Rao</h3>
                                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Active now
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon"><Phone className="h-5 w-5" /></Button>
                            <Button variant="ghost" size="icon"><Video className="h-5 w-5" /></Button>
                            <Button variant="ghost" size="icon"><Info className="h-5 w-5" /></Button>
                        </div>
                    </header>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/5" ref={scrollRef}>
                        {MESSAGES.map((msg) => (
                            <div key={msg.id} className={cn("flex w-full", msg.isMe ? "justify-end" : "justify-start")}>
                                <div className={cn(
                                    "flex flex-col max-w-[70%]",
                                    msg.isMe ? "items-end" : "items-start"
                                )}>
                                    <div className={cn(
                                        "px-4 py-2 rounded-2xl shadow-sm text-sm",
                                        msg.isMe
                                            ? "bg-primary text-primary-foreground rounded-br-none"
                                            : "bg-card border text-foreground rounded-bl-none"
                                    )}>
                                        {msg.content}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground mt-1 px-1">{msg.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Disclaimer */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 border-t border-yellow-200 dark:border-yellow-900/30 px-4 py-2 text-center">
                        <p className="text-[10px] text-yellow-800 dark:text-yellow-200 font-medium">
                            <Info className="h-3 w-3 inline-block mr-1 mb-0.5" />
                            This chat is for peer support only. In a crisis, please contact emergency services.
                        </p>
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-background border-t">
                        <div className="flex items-center gap-2 bg-card border rounded-full px-2 py-1 shadow-sm">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground"><Smile className="h-5 w-5" /></Button>
                            <Input
                                placeholder="Message..."
                                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent py-2 h-auto max-h-32"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            {input.trim() ? (
                                <Button size="sm" className="rounded-full px-4 h-8">Send</Button>
                            ) : (
                                <>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground"><ImageIcon className="h-5 w-5" /></Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground"><Mic className="h-5 w-5" /></Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-background/50 text-muted-foreground">
                    <div className="h-24 w-24 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                        <Send className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-xl font-medium">Your Messages</h3>
                    <p className="mt-2 text-sm">Send private messages to your buddies.</p>
                </div>
            )}
        </div>
    )
}
