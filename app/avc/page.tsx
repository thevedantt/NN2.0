"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Video, Briefcase, Coffee, Mic, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SCENARIOS } from "@/lib/avc/scenarios"

// Map string icon names to Lucide components
const IconMap: Record<string, any> = {
    Coffee: Coffee,
    Briefcase: Briefcase,
    Mic: Mic
}

export default function AVCPage() {
    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl">
            <div className="mb-10 text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Adaptive Video Coaching</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
                    Practice Makes Permanent
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Choose a scenario to practice your communication skills in a safe, judgment-free environment.
                    Get instant AI-driven feedback on your confidence, pacing, and engagement.
                </p>
                <div className="pt-2">
                    <Link href="/avc/history">
                        <Button variant="outline" className="gap-2 rounded-full px-6">
                            View Practice History <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SCENARIOS.map((scenario, index) => {
                    const Icon = IconMap[scenario.icon] || Video
                    return (
                        <motion.div
                            key={scenario.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-300 border-muted/60 overflow-hidden group">
                                <div className={`h-2 w-full bg-gradient-to-r ${scenario.bgGradient}`} />
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <Badge variant="outline" className="font-normal">
                                            {scenario.category}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-xl">{scenario.title}</CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {scenario.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-green-500" />
                                            {scenario.difficulty}
                                        </div>
                                        <div className="w-px h-4 bg-border" />
                                        <div>{scenario.duration}</div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Link href={`/avc/practice/${scenario.id}`} className="w-full">
                                        <Button className="w-full gap-2 group-hover:translate-x-1 transition-all" size="lg">
                                            Start Practice <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
