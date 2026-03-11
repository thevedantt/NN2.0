"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gamepad2, X, ArrowLeft } from "lucide-react"

import ColorGameShared from "@/components/games/ColorGame"
import ShapeGameShared from "@/components/games/ShapeGame"
import BreathingGameShared from "@/components/games/BreathingGame"
import BubblePopShared from "@/components/games/BubblePop"
import TracePathShared from "@/components/games/TracePath"
import { useLanguage } from "@/context/LanguageContext"

interface MiniGamesProps {
    onXPGain: (amount: number, action: string) => void
    onClose: () => void
}

type ActiveGame = 'menu' | 'color' | 'shape' | 'breath' | 'bubble' | 'trace'

export default function MiniGames({ onXPGain, onClose }: MiniGamesProps) {
    const [activeGame, setActiveGame] = useState<ActiveGame>('menu')
    const { t } = useLanguage()

    const GAMES = [
        { id: 'color', name: t('offline_game_color'), icon: '🎨', color: 'bg-green-500' },
        { id: 'shape', name: t('offline_game_shape'), icon: '📐', color: 'bg-orange-500' },
        { id: 'breath', name: t('offline_game_breath'), icon: '🌬️', color: 'bg-blue-500' },
        { id: 'bubble', name: t('offline_game_bubble'), icon: '🫧', color: 'bg-cyan-500' },
        { id: 'trace', name: t('offline_game_trace'), icon: '✨', color: 'bg-indigo-500' },
    ] as const

    return (
        <Card className="w-full h-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-none shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50">
                <div className="flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-primary" />
                    <div>
                        <h2 className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase leading-none opacity-60">Neuro Microtasks</h2>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5 opacity-40">Complete tasks to earn XP</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-black/5 dark:hover:bg-white/5">
                    <X className="w-5 h-5" />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <AnimatePresence mode="wait">
                    {activeGame === 'menu' ? (
                        <motion.div 
                            key="menu"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-2 gap-3 h-full content-start"
                        >
                            {GAMES.map((g) => (
                                <button
                                    key={g.id}
                                    onClick={() => setActiveGame(g.id)}
                                    className="group relative flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-100/50 dark:bg-zinc-800/50 border-2 border-transparent hover:border-primary/20 hover:bg-white dark:hover:bg-zinc-800 transition-all duration-300 overflow-hidden"
                                >
                                    <div className={`w-12 h-12 rounded-2xl ${g.color} flex items-center justify-center text-2xl shadow-lg mb-3 group-hover:scale-110 transition-transform`}>
                                        {g.icon}
                                    </div>
                                    <span className="text-[10px] font-black tracking-widest uppercase text-zinc-600 dark:text-zinc-400 text-center">
                                        {g.name}
                                    </span>
                                </button>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="game"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="h-full flex flex-col"
                        >
                             <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setActiveGame('menu')}
                                className="self-start mb-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary"
                            >
                                <ArrowLeft className="w-3 h-3 mr-1" /> Back to tasks
                            </Button>
                            
                            <div className="flex-1 overflow-hidden">
                                {activeGame === 'color' && (
                                    <ColorGameShared 
                                        isMini 
                                        t={t} 
                                        onScore={(p) => onXPGain(p, 'Color Tap')} 
                                        onEnd={() => setActiveGame('menu')} 
                                    />
                                )}
                                {activeGame === 'shape' && (
                                    <ShapeGameShared 
                                        isMini 
                                        t={t} 
                                        onScore={(p) => onXPGain(p, 'Shape Match')} 
                                        onEnd={() => setActiveGame('menu')} 
                                    />
                                )}
                                {activeGame === 'breath' && (
                                    <BreathingGameShared 
                                        isMini 
                                        t={t} 
                                        onScore={(p) => onXPGain(p, 'Breathing Circle')} 
                                        onEnd={() => setActiveGame('menu')} 
                                    />
                                )}
                                {activeGame === 'bubble' && (
                                    <BubblePopShared 
                                        isMini 
                                        t={t} 
                                        onScore={(p) => onXPGain(p, 'Bubble Pop')} 
                                        onEnd={() => setActiveGame('menu')} 
                                    />
                                )}
                                {activeGame === 'trace' && (
                                    <TracePathShared 
                                        isMini 
                                        t={t} 
                                        onScore={(p) => onXPGain(p, 'Trace Path')} 
                                        onEnd={() => setActiveGame('menu')} 
                                    />
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Card>
    )
}
