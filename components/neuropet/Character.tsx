"use client"

import React, { useRef, useEffect, forwardRef, useImperativeHandle, useCallback, useMemo } from "react"
import * as THREE from "three"
import { useGLTF, useAnimations } from "@react-three/drei"
import { SkeletonUtils } from "three-stdlib"

export interface CharacterRef {
    playAnimation: (name: string) => void;
}

interface CharacterProps {
    onAnimationsLoad?: (names: string[]) => void;
}

const Character = forwardRef<CharacterRef, CharacterProps>(({ onAnimationsLoad }, ref) => {
    const group = useRef<THREE.Group>(null)

    const { scene, animations } = useGLTF("/puppy.glb")

    // Clone the scene so we get our own independent copy (avoids shared-reference issues from useGLTF cache)
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])

    // Use the cloned scene as the mixer root
    const { actions, names, mixer } = useAnimations(animations, clone)

    // Use a ref to track the current animation name — avoids stale closure issues
    const currentRef = useRef<string | null>(null)

    // Diagnostic: check bone binding and compare clips
    useEffect(() => {
        if (animations.length === 0) return

        // 1. List all object names in the scene for binding verification
        const sceneNames: string[] = []
        clone.traverse((obj) => {
            if (obj.name) sceneNames.push(obj.name)
        })
        console.log(`[Character] Scene object names (${sceneNames.length}):`, sceneNames)

        // 2. Check if first clip's track targets can be found in the scene
        const firstClip = animations[0]
        const sampleTrackName = firstClip.tracks[0]?.name?.split('.')[0] // e.g. "Root" from "Root.position"
        const foundInScene = sampleTrackName ? sceneNames.includes(sampleTrackName) : false
        console.log(`[Character] Track target "${sampleTrackName}" found in scene: ${foundInScene}`)

        // 3. Compare first keyframe of each clip to check if poses differ
        console.log(`[Character] Comparing clips (duration & first keyframe of track 0):`)
        animations.forEach((clip) => {
            const track0 = clip.tracks[0]
            const firstValues = track0 ? Array.from(track0.values.slice(0, 3)) : []
            console.log(`  "${clip.name}" — duration: ${clip.duration.toFixed(4)}s, track0 first values: [${firstValues.map(v => v.toFixed(4)).join(', ')}]`)
        })
    }, [animations, clone])

    // Stable play function that always reads the latest currentRef
    const playAnimationInternal = useCallback((name: string) => {
        console.log(`[Character] playAnimationInternal called with: "${name}"`)

        if (!actions || !actions[name]) {
            console.warn(`[Character] Animation "${name}" not found or actions not ready`)
            return
        }

        const prev = currentRef.current
        console.log(`[Character] Previous animation: "${prev}"`)

        // Stop ALL actions for a clean slate
        mixer.stopAllAction()

        // Play the requested animation
        const nextAction = actions[name]
        if (nextAction) {
            nextAction.reset()
            nextAction.setEffectiveTimeScale(1)
            nextAction.setEffectiveWeight(1)
            nextAction.clampWhenFinished = false
            nextAction.loop = THREE.LoopRepeat
            nextAction.play()
            currentRef.current = name
            console.log(`[Character] Now playing: "${name}", isRunning: ${nextAction.isRunning()}, weight: ${nextAction.getEffectiveWeight()}`)
        }
    }, [actions, mixer])

    // Expose playAnimation to parent via ref
    useImperativeHandle(ref, () => ({
        playAnimation: (name: string) => {
            playAnimationInternal(name)
        }
    }), [playAnimationInternal])

    // Report animation names to parent when loaded
    useEffect(() => {
        if (names && names.length > 0 && onAnimationsLoad) {
            onAnimationsLoad(names)
        }
    }, [names, onAnimationsLoad])

    // Auto-play the first animation once actions are ready
    useEffect(() => {
        if (names.length > 0 && actions && Object.keys(actions).length > 0) {
            playAnimationInternal(names[0])
        }
    }, [names, actions, playAnimationInternal])

    return (
        <group ref={group} dispose={null}>
            <primitive object={clone} />
        </group>
    )
})

Character.displayName = "Character"
export default Character

useGLTF.preload("/puppy.glb")

