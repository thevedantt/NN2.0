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
// Firebase imports
import { db } from "@/lib/firebase"
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, Timestamp, getDocs } from "firebase/firestore"
import { useLanguage } from "@/context/LanguageContext"

// Mock Data for Group Info (could be fetched too, but keeping simple as per request)
const GROUP_INFO = {
    "anxiety-warriors": { name: "Anxiety Warriors", members: 1205, topic: "Anxiety", description: "A safe space to share strategies for managing daily anxiety and panic attacks." },
    "mindful-living": { name: "Mindful Living", members: 890, topic: "Wellness", description: "Practicing mindfulness, meditation, and staying present in the moment." },
    "depression-support": { name: "Depression Support", members: 2300, topic: "Depression", description: "You are not alone. Deeply supportive community for those navigating depression." },
    "social-confidence": { name: "Social Confidence", members: 450, topic: "Social Anxiety", description: "Building confidence in social situations step by step." },
    "sleep-insomnia": { name: "Sleep & Insomnia", members: 670, topic: "Sleep", description: "Tips and support for better rest and sleep hygiene." },
    "work-stress": { name: "Work Stress", members: 1500, topic: "Career", description: "Navigating burnout and workplace stress together." }
}

interface Message {
    id: string
    user: string
    avatar: string
    content: string
    time: string
    likes: number
    createdAt?: Timestamp
}

export default function GroupChatPage() {
    const params = useParams()
    const router = useRouter()
    const id = params?.id as string
    // Use Language Context
    const { language } = useLanguage()

    const GROUP_DETAILS: Record<string, { en: string, hi: string }> = {
        "anxiety-warriors": {
            en: "Anxiety is a natural response to stress, but when it becomes overwhelming and persistent, it can interfere with daily life. This group focuses on understanding anxiety triggers, practicing grounding techniques, and sharing personal victories in overcoming panic and worry.",
            hi: "चिंता (Anxiety) तनाव के लिए एक स्वाभाविक प्रतिक्रिया है, लेकिन जब यह भारी और लगातार हो जाती है, तो यह दैनिक जीवन में बाधा डाल सकती है। यह समूह चिंता को ट्रिगर करने वाले कारणों को समझने, ग्राउंडिंग तकनीकों का अभ्यास करने और घबराहट पर काबू पाने में व्यक्तिगत जीत साझा करने पर केंद्रित है।"
        },
        "mindful-living": {
            en: "Mindfulness is the practice of being fully present and engaged in the moment, without judgment. In this group, we explore meditation, breathwork, and conscious living to reduce stress and enhance emotional well-being.",
            hi: "माइंडफुलनेस (Mindfulness) बिना किसी निर्णय के पूरी तरह से वर्तमान क्षण में उपस्थित और व्यस्त रहने का अभ्यास है। इस समूह में, हम तनाव को कम करने और भावनात्मक भलाई को बढ़ाने के लिए ध्यान, सांस लेने के व्यायाम और सचेत जीवन जीने के तरीकों का पता लगाते हैं।"
        },
        "depression-support": {
            en: "Depression is more than just feeling sad; it's a serious mood disorder that affects how you feel, think, and handle daily activities. Here, we offer a compassionate space to share experiences, find hope, and remind each other that we are not alone in this journey.",
            hi: "अवसाद (Depression) केवल उदास महसूस करने से कहीं अधिक है; यह एक गंभीर मूड विकार है जो आपके महसूस करने, सोचने और दैनिक गतिविधियों को संभालने के तरीके को प्रभावित करता है। यहाँ, हम अनुभव साझा करने, उम्मीद खोजने और एक-दूसरे को याद दिलाने के लिए एक दयालु स्थान प्रदान करते हैं कि हम इस यात्रा में अकेले नहीं हैं।"
        },
        "social-confidence": {
            en: "Social anxiety involves intense fear of being watched and judged by others. This group is dedicated to building self-assurance, practicing social skills in a safe environment, and celebrating small steps towards greater social freedom.",
            hi: "सामाजिक चिंता (Social Anxiety) में दूसरों द्वारा देखे जाने और आंके जाने का तीव्र डर शामिल होता है। यह समूह आत्मविश्वास बनाने, सुरक्षित वातावरण में सामाजिक कौशल का अभ्यास करने और अधिक सामाजिक स्वतंत्रता की ओर छोटे कदमों का जश्न मनाने के लिए समर्पित है।"
        },
        "sleep-insomnia": {
            en: "Insomnia and sleep disorders can significantly impact mental health. This community shares tips on sleep hygiene, relaxation routines, and cognitive behavioral strategies to help you get the restorative rest you need.",
            hi: "अनिद्रा (Insomnia) और नींद संबंधी विकार मानसिक स्वास्थ्य को महत्वपूर्ण रूप से प्रभावित कर सकते हैं। यह समुदाय नींद की स्वच्छता, विश्राम दिनचर्या और संज्ञानात्मक व्यवहार रणनीतियों पर सुझाव साझा करता है ताकि आपको आवश्यक आराम मिल सके।"
        },
        "work-stress": {
            en: "Burnout creates physical, emotional, and mental exhaustion caused by prolonged stress. We discuss setting boundaries, managing workload, and prioritizing self-care to maintain a healthy and sustainable career.",
            hi: "बर्नआउट (Burnout) लंबे समय तक तनाव के कारण शारीरिक, भावनात्मक और मानसिक थकावट पैदा करता है। हम एक स्वस्थ और टिकाऊ करियर बनाए रखने के लिए सीमाएं निर्धारित करने, कार्यभार का प्रबंधन करने और आत्म-देखभाल को प्राथमिकता देने पर चर्चा करते हैं।"
        }
    };

    const uiText = {
        en: {
            aboutGroup: "About this Group",
            description: "Description",
            members: "Members",
            communityRules: "Community Rules",
            rule1: "Respect everyone's journey. Zero tolerance for hate speech.",
            rule2: "This is peer support, not professional medical advice.",
            rule3: "Maintain anonymity and confidentiality.",
            typeMessage: "Type a supportive message...",
            leaveGroup: "Leave Group",
            noMessages: "No messages yet. Be the first to say hi!",
            aboutTitle: "About Group",
            groupRulesTitle: "Group Rules",
            ruleList: [
                "Be respectful and kind.",
                "No medical advice.",
                "Respect privacy.",
                "Report harmful content."
            ]
        },
        hi: {
            aboutGroup: "इस समूह के बारे में",
            description: "विवरण",
            members: "सदस्य",
            communityRules: "सामुदायिक नियम",
            rule1: "हर किसी की यात्रा का सम्मान करें। अभद्र भाषा के लिए शून्य सहिष्णुता।",
            rule2: "यह सहकर्मी समर्थन है, पेशेवर चिकित्सा सलाह नहीं।",
            rule3: "गुमनामी और गोपनीयता बनाए रखें।",
            typeMessage: "एक सहायक संदेश लिखें...",
            leaveGroup: "समूह छोड़ें",
            noMessages: "अभी तक कोई संदेश नहीं। नमस्ते कहने वाले पहले व्यक्ति बनें!",
            aboutTitle: "समूह के बारे में",
            groupRulesTitle: "समूह के नियम",
            ruleList: [
                "सम्मानजनक और दयालु बनें।",
                "कोई चिकित्सा सलाह नहीं।",
                "गोपनीयता का सम्मान करें।",
                "हानिकारक सामग्री की रिपोर्ट करें।"
            ]
        }
    }

    const t = uiText[language === 'hi' ? 'hi' : 'en'];

    // Resolve group details based on language, falling back to English if needed
    const baseGroup = GROUP_INFO[id as keyof typeof GROUP_INFO] || { name: "Community Group", members: 0, topic: "Support", description: "Welcome to the group." };

    // If we have hindi names map them?
    const localizedNames: Record<string, string> = {
        "anxiety-warriors": "Anxiety Warriors (चिंता मुक्ति)",
        "mindful-living": "Mindful Living (माइंडफुलनेस)",
        "depression-support": "Depression Support (अवसाद सहायता)",
        "social-confidence": "Social Confidence (सामाजिक आत्मविश्वास)",
        "sleep-insomnia": "Sleep & Insomnia (नींद और अनिद्रा)",
        "work-stress": "Work Stress (कार्य तनाव)"
    };

    const group = {
        name: (language === 'hi' && localizedNames[id as string]) ? localizedNames[id as string] : baseGroup.name,
        members: baseGroup.members,
        topic: baseGroup.topic,
        description: baseGroup.description, // We use detailedDescription mostly
        detailedDescription: GROUP_DETAILS[id as string]?.[language === 'hi' ? 'hi' : 'en'] || baseGroup.description
    }

    const [messages, setMessages] = React.useState<Message[]>([])
    const [inputValue, setInputValue] = React.useState("")

    // Mock User Data
    const USER_ID = "user_123"
    const USERNAME = "Demo User"

    // Real-time listener for messages
    React.useEffect(() => {
        if (!id) return;

        const q = query(
            collection(db, "groups", id, "messages"),
            orderBy("createdAt", "asc")
        );

        let unsubscribe: (() => void) | null = null;
        let isRealtime = true;

        const setupRealtimeListener = () => {
            // NOTE:
            // Firestore realtime listeners may be blocked by browser privacy tools
            // Fallback to standard fetch is used to ensure functionality
            try {
                unsubscribe = onSnapshot(q,
                    (snapshot) => {
                        const msgs: Message[] = [];
                        snapshot.forEach((doc) => {
                            const data = doc.data();
                            // Format timestamp to readable time
                            let timeString = "Just now";
                            if (data.createdAt) {
                                const date = data.createdAt.toDate();
                                timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            }

                            msgs.push({
                                id: doc.id,
                                user: data.username || "Anonymous",
                                avatar: (data.username || "A").substring(0, 2).toUpperCase(),
                                content: data.text || "",
                                time: timeString,
                                likes: 0,
                            });
                        });
                        setMessages(msgs);
                    },
                    (error) => {
                        console.warn("Firestore realtime blocked by browser (messages). Falling back to fetch.", error);
                        isRealtime = false;
                        fallbackFetch();
                    }
                );
            } catch (err) {
                console.warn("Listener failed:", err);
                isRealtime = false;
                fallbackFetch();
            }
        };

        const fallbackFetch = async () => {
            try {
                const snapshot = await getDocs(q);
                const msgs: Message[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    let timeString = "Just now";
                    if (data.createdAt) {
                        const date = data.createdAt.toDate();
                        timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    }

                    msgs.push({
                        id: doc.id,
                        user: data.username || "Anonymous",
                        avatar: (data.username || "A").substring(0, 2).toUpperCase(),
                        content: data.text || "",
                        time: timeString,
                        likes: 0,
                    });
                });
                setMessages(msgs);
                if (!isRealtime) console.log("Messages loaded in fallback mode.");
            } catch (e) {
                console.error("Error fetching messages (fallback):", e);
            }
        };

        setupRealtimeListener();

        return () => {
            if (unsubscribe) unsubscribe();
        }
    }, [id]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return

        try {
            await addDoc(collection(db, "groups", id, "messages"), {
                text: inputValue,
                userId: USER_ID,
                username: USERNAME,
                anonymous: true, // defaulting to true for this safe space app
                createdAt: serverTimestamp()
            });
            setInputValue("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
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
                                <Users className="h-3 w-3" /> {group.members} {t.members}
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
                                    <SheetTitle>{t.aboutTitle}</SheetTitle>
                                </SheetHeader>
                                <div className="py-6 space-y-6">
                                    <div>
                                        <h4 className="text-sm font-medium mb-2">{t.description}</h4>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{group.description}</p>
                                    </div>
                                    <Separator />
                                    <div>
                                        <h4 className="text-sm font-medium mb-2">{t.groupRulesTitle}</h4>
                                        <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                                            {t.ruleList.map((rule, idx) => (
                                                <li key={idx}>{rule}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-center">
                                        <Button variant="outline" className="w-full border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600">{t.leaveGroup}</Button>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                            {t.noMessages}
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <Card key={msg.id} className="border-border/60 bg-card/60 rounded-xl p-4 max-w-2xl mx-auto shadow-sm">
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-8 w-8 mt-1">
                                        <AvatarFallback className={cn("text-xs font-medium", msg.user.includes("Demo") ? "bg-primary text-primary-foreground" : "bg-muted")}>{msg.avatar}</AvatarFallback>
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
                        ))
                    )}
                </div>

                <div className="p-4 md:p-6 border-t bg-background/95 backdrop-blur">
                    <div className="max-w-2xl mx-auto flex gap-2">
                        <Input
                            placeholder={t.typeMessage}
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
                <h3 className="font-semibold mb-6">{t.aboutGroup}</h3>
                <div className="space-y-6">
                    <div className="p-4 bg-background/50 rounded-lg border text-center">
                        <h4 className="font-medium text-2xl text-primary">{group.members}</h4>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">{t.members}</span>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                            <Info className="h-4 w-4 text-primary" />
                            {t.description}
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{group.detailedDescription || group.description}</p>
                    </div>

                    <Separator />

                    <div>
                        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            {t.communityRules}
                        </h4>
                        <ul className="text-xs text-muted-foreground space-y-3">
                            <li className="flex gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                                {t.rule1}
                            </li>
                            <li className="flex gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                                {t.rule2}
                            </li>
                            <li className="flex gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                                {t.rule3}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
