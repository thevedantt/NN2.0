"use client"
import { Canvas } from '@react-three/fiber'
import React, { useState, useRef, useCallback, useEffect } from 'react'
import Character2, { Character2Ref } from '@/components/neuropet/Character2'
import { OrbitControls } from '@react-three/drei'
import SceneEnvironment from '@/components/neuropet/SceneEnvironment'
import PetProgressPanel from '@/components/neuropet/PetProgressPanel'
import EmojiReaction from '@/components/neuropet/EmojiReaction'
import VoiceChat from '@/components/neuropet/VoiceChat'
import RewardShowcase from '@/components/neuropet/RewardShowcase'
import ActionButtons from '@/components/neuropet/ActionButtons'
import { usePetStore } from '@/lib/neuropet/store/petStore'
import { getEmotion } from '@/lib/neuropet/data/emotionMap'
import { toast } from 'sonner'
import * as THREE from 'three'

export default function Page() {
    const [animations, setAnimations] = useState<string[]>([])
    const characterRef = useRef<Character2Ref>(null)
    const performAction = usePetStore((s) => s.performAction)

    // Emoji reaction state
    const [reactionEmojis, setReactionEmojis] = useState<string[]>([])
    const [reactionKey, setReactionKey] = useState(0)
    const [reactionColor, setReactionColor] = useState("#FFD700")

    // Play landing sound on page load
    useEffect(() => {
        const landingAudio = new Audio("/neuropet/voices/landing.mpeg")
        landingAudio.volume = 0.6

        const playSound = () => {
            landingAudio.play()
                .then(() => {
                    // Success! Clean up listener
                    window.removeEventListener('click', playSound)
                })
                .catch(() => {
                    // If blocked, wait for first click
                    window.addEventListener('click', playSound, { once: true })
                })
        }

        playSound()

        // Clean up
        return () => window.removeEventListener('click', playSound)
    }, [])

    // Play background voice after 15 seconds for ambient feel
    useEffect(() => {
        const timer = setTimeout(() => {
            const bgAudio = new Audio("/neuropet/voices/bgvoice.mpeg")
            bgAudio.volume = 0.4
            bgAudio.play().catch(() => { })
        }, 15000)
        return () => clearTimeout(timer)
    }, [])

    const handleAnimationsLoad = useCallback((names: string[]) => {
        setAnimations(names)
    }, [])

    const handlePlayAnimation = useCallback((name: string) => {
        // 1. Play the animation on the pet model
        characterRef.current?.playAnimation(name)

        // 2. Grant XP
        performAction(name)

        // 3. Trigger emoji burst
        const emotion = getEmotion(name)
        setReactionEmojis(emotion.emojis)
        setReactionColor(emotion.color)
        setReactionKey((prev) => prev + 1)

        // 4. Play sound effect if configured
        if (emotion.sound) {
            const audio = new Audio(emotion.sound)
            audio.volume = 0.7
            audio.play().catch(() => { })
        }

        // 5. Show sonner toast notification
        toast(emotion.message, {
            duration: 3000,
            icon: emotion.emojis[0],
            style: {
                borderLeft: `3px solid ${emotion.color}`,
            },
        })
    }, [performAction])

    // Voice chat: when pet starts speaking, play matching animation + emojis
    const handlePetSpeak = useCallback((emotion: string) => {
        characterRef.current?.playAnimation(emotion)
        performAction("interact")

        const emotionConfig = getEmotion(emotion)
        setReactionEmojis(emotionConfig.emojis)
        setReactionColor(emotionConfig.color)
        setReactionKey((prev) => prev + 1)
    }, [performAction])

    // Voice chat: when pet finishes speaking, return to Idle
    const handlePetFinishSpeaking = useCallback(() => {
        characterRef.current?.playAnimation("Idle")
    }, [])

    return (
        <div
            className='w-full h-full relative'
            style={{
                background: 'linear-gradient(180deg, #0a0a1a 0%, #1a1428 40%, #2d1f1a 100%)',
            }}
        >
            <Canvas
                camera={{ position: [0.05, 0.634, 1.776], fov: 50 }}
                shadows
                gl={{
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.2,
                }}
            >
                {/* Scene environment: lighting, ground, sky dome, particles */}
                <SceneEnvironment />

                <OrbitControls target={[0, 0, 0]} />
                <Character2
                    ref={characterRef}
                    onAnimationsLoad={handleAnimationsLoad}
                />
            </Canvas>

            {/* Emoji Reaction Burst (positioned over the pet) */}
            <EmojiReaction
                emojis={reactionEmojis}
                triggerKey={reactionKey}
                accentColor={reactionColor}
                particleCount={14}
                duration={1800}
            />

            {/* Pet Progression HUD with Action Buttons */}
            <PetProgressPanel>
                <ActionButtons
                    animations={animations}
                    onPlay={handlePlayAnimation}
                />
            </PetProgressPanel>

            {/* Level 50 Reward: BMW M4 */}
            <RewardShowcase />

            {/* Voice Conversation System */}
            <VoiceChat
                onPetSpeak={handlePetSpeak}
                onPetFinishSpeaking={handlePetFinishSpeaking}
            />
        </div>
    )
}
