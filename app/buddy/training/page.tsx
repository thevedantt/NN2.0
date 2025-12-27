"use client"

import * as React from "react"
import { PlayCircle, FileText, CheckCircle, Award, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const MODULES = [
    {
        id: "1",
        title: "Active Listening 101",
        description: "Learn the core skills of being a supportive listener without offering advice.",
        duration: "15 min",
        type: "Video",
        status: "completed",
    },
    {
        id: "2",
        title: "Empathy vs. Sympathy",
        description: "Understanding the difference and why it matters in peer support.",
        duration: "10 min",
        type: "Article",
        status: "in-progress",
        progress: 45
    },
    {
        id: "3",
        title: "Crisis Recognition",
        description: "How to identify when a buddy needs professional help and what to do.",
        duration: "20 min",
        type: "Interactive",
        status: "locked",
    },
    {
        id: "4",
        title: "Setting Boundaries",
        description: "Maintaining a healthy balance between supporting others and your own well-being.",
        duration: "12 min",
        type: "Video",
        status: "locked",
    },
]

export default function TrainingPage() {
    return (
        <div className="flex-1 h-full overflow-y-auto p-6 md:p-8 bg-background max-w-5xl mx-auto w-full">
            <header className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Buddy Training</h1>
                        <p className="text-muted-foreground mt-1">Complete these modules to become a verified Buddy.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-secondary/30 p-3 rounded-lg border border-secondary">
                        <Award className="h-8 w-8 text-primary" />
                        <div>
                            <div className="text-sm font-semibold">Certification Progress</div>
                            <div className="text-xs text-muted-foreground">1 of 4 Modules Completed</div>
                        </div>
                        <Progress value={25} className="w-20 h-2 ml-2" />
                    </div>
                </div>
            </header>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Learning Path */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <BookOpen className="h-5 w-5" /> Learning Path
                    </h2>
                    {MODULES.map((module, index) => (
                        <Card key={module.id} className={`transition-all ${module.status === 'locked' ? 'opacity-60' : 'hover:shadow-md'}`}>
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <Badge variant={module.status === 'completed' ? 'default' : 'secondary'}>
                                        {module.status === 'completed' ? 'Completed' : module.status === 'in-progress' ? 'In Progress' : 'Locked'}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        {module.type === 'Video' ? <PlayCircle className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                                        {module.duration}
                                    </span>
                                </div>
                                <CardTitle className="text-lg mt-2">{index + 1}. {module.title}</CardTitle>
                                <CardDescription>{module.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {module.status === 'in-progress' && (
                                    <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-primary h-full rounded-full" style={{ width: `${module.progress}%` }} />
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" disabled={module.status === 'locked'} variant={module.status === 'completed' ? "outline" : "default"}>
                                    {module.status === 'completed' ? <><CheckCircle className="mr-2 h-4 w-4" /> Review</> : 'Start Module'}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {/* Resources Sidebar */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Quick Resources</h2>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Crisis Helplines</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/10 rounded border border-red-100 dark:border-red-900/30">
                                <span className="font-medium text-red-700 dark:text-red-300">Emergency</span>
                                <span className="font-bold text-red-700 dark:text-red-300">911</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-muted rounded border">
                                <span className="font-medium">Suicide & Crisis Lifeline</span>
                                <span className="font-bold">988</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Support Guides</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>What if they stop responding?</AccordionTrigger>
                                    <AccordionContent>
                                        It's okay to send a gentle check-in after a few days. If you are worried about their safety, report it to the platform admins.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger>Handling heavy topics</AccordionTrigger>
                                    <AccordionContent>
                                        Acknowledge their feelings, validate them, but remind them you are a peer, not a professional. Encourage therapy for deep trauma.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
