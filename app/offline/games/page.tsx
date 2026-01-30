"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Gamepad2, Trophy, History } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useLanguage } from "@/context/LanguageContext"
import { toast } from "sonner"
// Shadcn Table Components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface GameScores {
    total: number
    colorTap: number
    shapeMatch: number
    history: { game: string, score: number, date: string }[]
}

export default function GamesPage() {
    const [game, setGame] = useState<'menu' | 'color' | 'shape'>('menu')
    const { t } = useLanguage()
    const [scores, setScores] = useState<GameScores>({ total: 0, colorTap: 0, shapeMatch: 0, history: [] })

    useEffect(() => {
        const saved = localStorage.getItem('offline-game-scores')
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                setScores({
                    total: parsed.total || 0,
                    colorTap: parsed.colorTap || 0,
                    shapeMatch: parsed.shapeMatch || 0,
                    history: Array.isArray(parsed.history) ? parsed.history : []
                })
            } catch (e) {
                console.error("Failed to parse game scores", e)
            }
        }
    }, [])

    const updateScore = (gameName: 'colorTap' | 'shapeMatch', points: number) => {
        setScores(prev => {
            const newScore = Math.max(0, prev[gameName] + points) // Prevent negative game specific score if desired, or total
            // Let's keep individual game accumulated score.
            // But usually we track "current run" score.
            // The prompt says "gameScores = { totalScore: number, colorTap: number... }".
            // Let's interpret as "Total points earned ever" or "High Score".
            // Let's stick to "Total Accumulated" for positivity.

            const newTotal = Math.max(0, prev.total + points)

            const updated = {
                ...prev,
                total: newTotal,
                [gameName]: newScore
            }
            localStorage.setItem('offline-game-scores', JSON.stringify(updated))
            return updated
        })
    }

    const saveHistory = (gameName: string, roundScore: number) => {
        setScores(prev => {
            const newHistory = [{ game: gameName, score: roundScore, date: new Date().toLocaleDateString() }, ...prev.history].slice(0, 10)
            const updated = { ...prev, history: newHistory }
            localStorage.setItem('offline-game-scores', JSON.stringify(updated))
            return updated
        })
    }

    return (
        <div className="p-6 md:p-12 max-w-4xl mx-auto h-full flex flex-col items-center justify-center">
            {game === 'menu' && (
                <div className="w-full space-y-8 animate-in fade-in">
                    <div className="text-center space-y-2">
                        <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
                            <ArrowLeft className="w-4 h-4 mr-1" /> {t('offline_back_dashboard')}
                        </Link>
                        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
                            <Gamepad2 className="w-8 h-8 text-primary" /> {t('offline_games')}
                        </h1>
                        <p className="text-muted-foreground">{t('offline_message')}</p>
                    </div>

                    <div className="flex justify-center mb-8">
                        <div className="bg-primary/10 text-primary px-6 py-3 rounded-full flex items-center gap-2 font-bold text-lg">
                            <Trophy className="w-5 h-5" />
                            {t('offline_game_score')}: {scores.total}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-green-500/20" onClick={() => setGame('color')}>
                            <div className="h-40 bg-green-50 dark:bg-green-950/20 rounded-lg flex items-center justify-center mb-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="w-8 h-8 rounded-full bg-red-400"></div>
                                    <div className="w-8 h-8 rounded-full bg-blue-400"></div>
                                    <div className="w-8 h-8 rounded-full bg-green-400"></div>
                                    <div className="w-8 h-8 rounded-full bg-yellow-400"></div>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mb-2">{t('offline_game_color')}</h3>
                        </Card>

                        <Card className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-orange-500/20" onClick={() => setGame('shape')}>
                            <div className="h-40 bg-orange-50 dark:bg-orange-950/20 rounded-lg flex items-center justify-center mb-4">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 border-2 border-primary rounded-none"></div>
                                    <div className="w-8 h-8 border-2 border-primary rounded-full"></div>
                                    <div className="w-8 h-8 border-2 border-primary transform rotate-45"></div>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mb-2">{t('offline_game_shape')}</h3>
                        </Card>
                    </div>

                    {scores.history.length > 0 && (
                        <Card className="mt-8 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <History className="w-5 h-5 text-muted-foreground" />
                                <h3 className="font-semibold">Game History</h3>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Game</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Score</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {scores.history.map((h, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">{h.game === 'colorTap' ? t('offline_game_color') : t('offline_game_shape')}</TableCell>
                                            <TableCell>{h.date}</TableCell>
                                            <TableCell className="text-right">{h.score}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    )}
                </div>
            )}

            {game === 'color' && <ColorGame onExit={() => setGame('menu')} updateScore={updateScore} saveHistory={saveHistory} t={t} />}
            {game === 'shape' && <ShapeGame onExit={() => setGame('menu')} updateScore={updateScore} saveHistory={saveHistory} t={t} />}
        </div>
    )
}

function ColorGame({ onExit, updateScore, saveHistory, t }: { onExit: () => void, updateScore: (g: 'colorTap' | 'shapeMatch', p: number) => void, saveHistory: (g: string, s: number) => void, t: any }) {
    const [score, setScore] = useState(0)
    const [targetColor, setTargetColor] = useState('')
    const [colors, setColors] = useState<string[]>([])
    const [message, setMessage] = useState("")

    const palette = ['bg-slate-400', 'bg-rose-300', 'bg-blue-300', 'bg-green-300', 'bg-yellow-200', 'bg-purple-300', 'bg-teal-300', 'bg-orange-200']
    const colorKeys: { [key: string]: string } = {
        'bg-slate-400': 'color_slate',
        'bg-rose-300': 'color_rose',
        'bg-blue-300': 'color_blue',
        'bg-green-300': 'color_green',
        'bg-yellow-200': 'color_yellow',
        'bg-purple-300': 'color_purple',
        'bg-teal-300': 'color_teal',
        'bg-orange-200': 'color_orange'
    }

    const startRound = () => {
        const shuffled = [...palette].sort(() => 0.5 - Math.random()).slice(0, 4)
        setColors(shuffled)
        const target = shuffled[Math.floor(Math.random() * shuffled.length)]
        setTargetColor(target)
        setMessage(`${t('game_tap_instruction')} ${t(colorKeys[target])}`)
    }

    useEffect(() => {
        // Initial set (delayed slightly to ensure translations loaded or component mounted for t() usage if needed, though t is sync in this context)
        startRound()
    }, []) // Empty dependency to run once on mount

    const handleTap = (color: string) => {
        if (color === targetColor) {
            const points = 10
            setScore(s => s + points)
            updateScore('colorTap', points)
            // No translated "Good!", keeping it simple or translate it too? 
            // Let's use generic good feedback or just visual.
            setMessage("✓")
            setTimeout(startRound, 500)
        } else {
            const penalty = -5
            setScore(s => Math.max(0, s + penalty))
            setMessage("✕") // Use symbols for universal feedback
        }
    }

    const handleEnd = () => {
        saveHistory('colorTap', score)
        onExit()
    }

    return (
        <div className="flex flex-col items-center justify-center w-full animate-in zoom-in duration-300">
            <Button variant="ghost" onClick={handleEnd} className="absolute top-8 left-8">
                <ArrowLeft className="w-4 h-4 mr-2" /> {t('offline_game_end')}
            </Button>

            <div className="mb-8 text-center">
                <h2 className="text-4xl font-bold mb-2">{score}</h2>
                <p className="text-xl text-muted-foreground">{message}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {colors.map((c, i) => (
                    <motion.button
                        key={i}
                        whileTap={{ scale: 0.9 }}
                        className={`w-32 h-32 rounded-2xl ${c} shadow-sm hover:shadow-md transition-shadow`}
                        onClick={() => handleTap(c)}
                    />
                ))}
            </div>
        </div>
    )
}

function ShapeGame({ onExit, updateScore, saveHistory, t }: { onExit: () => void, updateScore: (g: 'colorTap' | 'shapeMatch', p: number) => void, saveHistory: (g: string, s: number) => void, t: any }) {
    const [score, setScore] = useState(0)
    const [targetShape, setTargetShape] = useState('')
    const [shapes, setShapes] = useState<string[]>([])
    const [message, setMessage] = useState("")

    const allShapes = ['circle', 'square', 'triangle', 'diamond']
    const shapeKeys: { [key: string]: string } = {
        'circle': 'shape_circle',
        'square': 'shape_square',
        'triangle': 'shape_triangle',
        'diamond': 'shape_diamond'
    }

    const startRound = () => {
        const shuffled = [...allShapes].sort(() => 0.5 - Math.random()).slice(0, 3)
        setShapes(shuffled)
        const target = shuffled[Math.floor(Math.random() * shuffled.length)]
        setTargetShape(target)
        setMessage(`${t('game_find_instruction')} ${t(shapeKeys[target])}`)
    }

    useEffect(() => {
        startRound()
    }, [])

    const handleTap = (shape: string) => {
        if (shape === targetShape) {
            const points = 15
            setScore(s => s + points)
            updateScore('shapeMatch', points)
            setMessage("✓")
            setTimeout(startRound, 500)
        } else {
            setScore(s => Math.max(0, s - 5))
            setMessage("✕")
        }
    }

    const handleEnd = () => {
        saveHistory('shapeMatch', score)
        onExit()
    }

    return (
        <div className="flex flex-col items-center justify-center w-full animate-in zoom-in duration-300">
            <Button variant="ghost" onClick={handleEnd} className="absolute top-8 left-8">
                <ArrowLeft className="w-4 h-4 mr-2" /> {t('offline_game_end')}
            </Button>

            <div className="mb-8 text-center">
                <h2 className="text-4xl font-bold mb-2">{score}</h2>
                <p className="text-xl text-muted-foreground capitalize">{message}</p>
            </div>

            <div className="flex gap-6">
                {shapes.map((s, i) => (
                    <motion.button
                        key={i}
                        whileTap={{ scale: 0.9 }}
                        className={`w-24 h-24 flex items-center justify-center bg-card border-2 rounded-xl hover:border-primary transition-colors`}
                        onClick={() => handleTap(s)}
                    >
                        {s === 'circle' && <div className="w-12 h-12 rounded-full bg-primary" />}
                        {s === 'square' && <div className="w-12 h-12 bg-primary" />}
                        {s === 'triangle' && <div className="w-0 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-b-[48px] border-b-primary" />}
                        {s === 'diamond' && <div className="w-12 h-12 bg-primary rotate-45" />}
                    </motion.button>
                ))}
            </div>
        </div>
    )
}
