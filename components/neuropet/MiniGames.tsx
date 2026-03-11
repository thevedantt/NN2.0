"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gamepad2, Play, Trophy, ArrowLeft, RotateCcw } from "lucide-react"

interface MiniGameProps {
    onXPGain: (amount: number, action: string) => void;
    onClose: () => void;
}

export default function MiniGames({ onXPGain, onClose }: MiniGameProps) {
    const [activeGame, setActiveGame] = useState<'menu' | 'color' | 'shape'>('menu')

    return (
        <Card className="w-full h-full bg-black/40 backdrop-blur-xl border-white/20 overflow-hidden flex flex-col shadow-2xl relative">
            <AnimatePresence mode="wait">
                {activeGame === 'menu' && (
                    <motion.div 
                        key="menu"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="p-8 flex flex-col h-full items-center justify-center space-y-6"
                    >
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={onClose} 
                            className="absolute top-4 right-4 text-white/40 hover:text-white hover:bg-white/10"
                        >
                            <ArrowLeft className="h-5 w-5 rotate-90" />
                        </Button>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-yellow-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-yellow-400/30">
                                <Gamepad2 className="w-8 h-8 text-yellow-400" />
                            </div>
                            <h3 className="font-bold text-white uppercase tracking-[0.2em] text-lg">Neuro Training</h3>
                            <p className="text-sm text-white/40">Boost your pet's cognitive XP</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full">
                            <Button 
                                variant="outline" 
                                className="bg-white/5 border-white/10 hover:bg-white/20 h-28 flex flex-col gap-3 group transition-all"
                                onClick={() => setActiveGame('color')}
                            >
                                <div className="flex gap-2 group-hover:scale-110 transition-transform">
                                    <div className="w-3 h-3 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]" />
                                    <div className="w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
                                </div>
                                <span className="text-xs font-black tracking-widest">COLOR TAP</span>
                            </Button>
                            <Button 
                                variant="outline" 
                                className="bg-white/5 border-white/10 hover:bg-white/20 h-28 flex flex-col gap-3 group transition-all"
                                onClick={() => setActiveGame('shape')}
                            >
                                <div className="flex gap-2 group-hover:scale-110 transition-transform">
                                    <div className="w-3 h-3 border-2 border-white/60" />
                                    <div className="w-3 h-3 rounded-full border-2 border-white/60" />
                                </div>
                                <span className="text-xs font-black tracking-widest">SHAPE MATCH</span>
                            </Button>
                        </div>
                    </motion.div>
                )}

                {activeGame === 'color' && (
                    <ColorGame 
                        key="color"
                        onExit={() => setActiveGame('menu')} 
                        onXPGain={onXPGain}
                    />
                )}

                {activeGame === 'shape' && (
                    <ShapeGame 
                        key="shape"
                        onExit={() => setActiveGame('menu')} 
                        onXPGain={onXPGain}
                    />
                )}
            </AnimatePresence>
        </Card>
    )
}

function ColorGame({ onExit, onXPGain }: { onExit: () => void, onXPGain: (a: number, s: string) => void }) {
    const [score, setScore] = useState(0)
    const [targetColor, setTargetColor] = useState('')
    const [colors, setColors] = useState<string[]>([])
    const [message, setMessage] = useState("")

    const palette = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-orange-400']
    const colorNames: Record<string, string> = {
        'bg-red-400': 'RED', 'bg-blue-400': 'BLUE', 'bg-green-400': 'GREEN', 
        'bg-yellow-400': 'YELLOW', 'bg-purple-400': 'PURPLE', 'bg-orange-400': 'ORANGE'
    }

    const startRound = () => {
        const shuffled = [...palette].sort(() => 0.5 - Math.random()).slice(0, 4)
        setColors(shuffled)
        const target = shuffled[Math.floor(Math.random() * shuffled.length)]
        setTargetColor(target)
        setMessage(`TAP THE ${colorNames[target]}`)
    }

    useEffect(() => { startRound() }, [])

    const handleTap = (color: string) => {
        if (color === targetColor) {
            setScore(s => s + 1)
            onXPGain(2, "MiniGame Success")
            setMessage("EXCELLENT!")
            setTimeout(startRound, 400)
        } else {
            setMessage("WRONG COLOR")
            setTimeout(() => setMessage(`TAP THE ${colorNames[targetColor]}`), 800)
        }
    }

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full p-3"
        >
            <div className="flex justify-between items-center mb-2">
                <Button variant="ghost" size="icon" onClick={onExit} className="h-6 w-6 text-white/60 hover:text-white">
                    <ArrowLeft className="h-3 w-3" />
                </Button>
                <div className="flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-yellow-400" />
                    <span className="text-[10px] font-bold text-white">{score}</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                <p className="text-[10px] font-black tracking-widest text-white/80">{message}</p>
                <div className="grid grid-cols-2 gap-2">
                    {colors.map((c, i) => (
                        <motion.button
                            key={i}
                            whileTap={{ scale: 0.95 }}
                            className={`w-14 h-14 rounded-lg ${c} shadow-md border-2 border-white/10`}
                            onClick={() => handleTap(c)}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    )
}

function ShapeGame({ onExit, onXPGain }: { onExit: () => void, onXPGain: (a: number, s: string) => void }) {
    const [score, setScore] = useState(0)
    const [targetShape, setTargetShape] = useState('')
    const [shapes, setShapes] = useState<string[]>([])
    const [message, setMessage] = useState("")

    const allShapes = ['circle', 'square', 'triangle', 'diamond']

    const startRound = () => {
        const shuffled = [...allShapes].sort(() => 0.5 - Math.random()).slice(0, 3)
        setShapes(shuffled)
        const target = shuffled[Math.floor(Math.random() * shuffled.length)]
        setTargetShape(target)
        setMessage(`FIND THE ${target.toUpperCase()}`)
    }

    useEffect(() => { startRound() }, [])

    const handleTap = (shape: string) => {
        if (shape === targetShape) {
            setScore(s => s + 1)
            onXPGain(3, "MiniGame Success")
            setMessage("GREAT MATCH!")
            setTimeout(startRound, 400)
        } else {
            setMessage("TRY AGAIN")
            setTimeout(() => setMessage(`FIND THE ${targetShape.toUpperCase()}`), 800)
        }
    }

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full p-3"
        >
            <div className="flex justify-between items-center mb-2">
                <Button variant="ghost" size="icon" onClick={onExit} className="h-6 w-6 text-white/60 hover:text-white">
                    <ArrowLeft className="h-3 w-3" />
                </Button>
                <div className="flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-yellow-400" />
                    <span className="text-[10px] font-bold text-white">{score}</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                <p className="text-[10px] font-black tracking-widest text-white/80">{message}</p>
                <div className="flex gap-2">
                    {shapes.map((s, i) => (
                        <motion.button
                            key={i}
                            whileTap={{ scale: 0.95 }}
                            className="w-14 h-14 flex items-center justify-center bg-white/5 border-2 border-white/10 rounded-lg hover:bg-white/10"
                            onClick={() => handleTap(s)}
                        >
                            {s === 'circle' && <div className="w-6 h-6 rounded-full bg-white/80" />}
                            {s === 'square' && <div className="w-6 h-6 bg-white/80" />}
                            {s === 'triangle' && <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[24px] border-b-white/80" />}
                            {s === 'diamond' && <div className="w-6 h-6 bg-white/80 rotate-45" />}
                        </motion.button>
                    ))}
                </div>
            </div>
        </motion.div>
    )
}
