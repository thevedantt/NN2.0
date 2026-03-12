"use client"

import React, { useRef, useEffect, forwardRef, useImperativeHandle, useMemo } from "react"
import * as THREE from "three"
import { useGLTF, useAnimations } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { SkeletonUtils } from "three-stdlib"

// Procedural animation names
const ANIMATION_NAMES = [
    "Happy",
    "Sad",
    "Excited",
    "Sleepy",
    "Wave",
    "Dance",
    "Scared",
    "Angry",
    "Clap",
    "Nod",
    "Shake",
] as const

type AnimationName = (typeof ANIMATION_NAMES)[number]

export interface Character2Ref {
    playAnimation: (name: string) => void;
}

interface Character2Props {
    onAnimationsLoad?: (names: string[]) => void;
}

const Character2 = forwardRef<Character2Ref, Character2Props>(({ onAnimationsLoad }, ref) => {
    const group = useRef<THREE.Group>(null)

    const { scene, animations } = useGLTF("/neuropet/test_pet.glb")

    // Clone the scene and ground it
    const clone = useMemo(() => {
        const c = SkeletonUtils.clone(scene)
        // Calculate bounding box to find the bottom point
        const box = new THREE.Box3().setFromObject(c)
        const minY = box.min.y
        // Offset the model down so its feet are at y=0
        c.position.y = -minY
        return c
    }, [scene])

    // Use the first NLA clip as a base rest pose (prevents T-posing)
    const { actions, names: clipNames, mixer } = useAnimations(animations, clone)

    // Track current procedural animation and time
    const currentAnimation = useRef<AnimationName>("Happy")
    const animTime = useRef(0)

    // Cache bone references for performance
    const bones = useRef<Record<string, THREE.Object3D>>({})

    // Find and cache bones on mount
    useEffect(() => {
        const boneNames = ["Root", "Hip", "Pelvis", "Waist", "Spine01", "Spine02",
            "Head", "NeckTwist01", "NeckTwist02",
            "L_Upperarm", "R_Upperarm", "L_Forearm", "R_Forearm",
            "L_Hand", "R_Hand", "L_Clavicle", "R_Clavicle",
            "L_Thigh", "R_Thigh", "L_Calf", "R_Calf", "L_Foot", "R_Foot"]

        clone.traverse((obj) => {
            if (boneNames.includes(obj.name)) {
                bones.current[obj.name] = obj
            }
        })
        console.log(`[Character2] Found bones:`, Object.keys(bones.current))
    }, [clone])

    // Play the first NLA clip to hold the natural rest pose (prevents T-posing)
    useEffect(() => {
        if (clipNames.length > 0 && actions) {
            console.log(`[Character2] Available animations:`, clipNames)
            const firstClipName = clipNames[0]
            const action = actions[firstClipName]
            if (action) {
                action.reset()
                action.setEffectiveWeight(1)
                action.setEffectiveTimeScale(1)
                action.loop = THREE.LoopRepeat
                action.play()
                console.log(`[Character2] Playing base pose clip: "${firstClipName}"`)
            }
        }
    }, [clipNames, actions])

    // Report our procedural animation names to parent
    useEffect(() => {
        if (onAnimationsLoad) {
            onAnimationsLoad([...ANIMATION_NAMES])
        }
    }, [onAnimationsLoad])

    // Expose playAnimation to parent via ref
    useImperativeHandle(ref, () => ({
        playAnimation: (name: string) => {
            console.log(`[Character2] Switching to: "${name}"`)
            
            // Try to play GLB animation if it exists
            if (actions) {
                // Map common procedural names to available GLB clips
                const glbMapping: Record<string, string> = {
                    "Excited": "dance2",
                    "Happy": "agree",
                    "Sad": "cry",
                    "Sleepy": "depressed",
                    "Wave": "greet",
                    "Dance": "dance1",
                    "Scared": "scared",
                    "Angry": "angry",
                    "Clap": "claps",
                    "Nod": "agree",
                    "Shake": "angry2"
                };

                const mappedName = glbMapping[name] || name;

                // Find action with flexible name matching
                const foundKey = Object.keys(actions).find(k => k.toLowerCase().includes(mappedName.toLowerCase()))
                const action = actions[mappedName] || 
                             actions[mappedName.toLowerCase()] || 
                             actions[mappedName.charAt(0).toUpperCase() + mappedName.slice(1).toLowerCase()] ||
                             (foundKey ? actions[foundKey] : null);
                
                // Stop others
                Object.values(actions).forEach(a => {
                    if (a && a.isRunning()) a.fadeOut(0.3)
                })

                if (action) {
                    console.log(`[Character2] Found GLB animation for "${name}", playing it.`)
                    action.reset().fadeIn(0.3).play()
                } else {
                    console.log(`[Character2] No GLB animation found for "${name}", relying on procedural.`)
                }
            }

            animTime.current = 0
            currentAnimation.current = name as AnimationName
        }
    }), [actions])

    // Add a parallax rotation effect to the character
    useFrame((state) => {
        if (group.current) {
            // Gently rotate the character based on mouse X/Y for depth
            const targetRotationY = state.mouse.x * 0.2
            const targetRotationX = -state.mouse.y * 0.1
            group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotationY, 0.05)
            group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetRotationX, 0.05)
        }
    })

    // Procedural animation loop — runs AFTER the mixer (which sets the rest pose each frame)
    // We apply ADDITIVE offsets on top of the rest pose
    useFrame((_, delta) => {
        const t = animTime.current
        animTime.current += delta
        const b = bones.current

        if (Object.keys(b).length === 0) return

        const anim = currentAnimation.current

        switch (anim) {
            case "Happy": {
                // Arms swinging + head bob
                const armSwing = Math.sin(t * 5) * 0.4
                if (b.L_Upperarm) b.L_Upperarm.rotation.z += armSwing
                if (b.R_Upperarm) b.R_Upperarm.rotation.z -= armSwing
                if (b.Head) b.Head.rotation.x += Math.sin(t * 6) * 0.1
                if (b.Spine01) b.Spine01.rotation.x += Math.sin(t * 5) * 0.05
                if (b.Waist) b.Waist.rotation.y += Math.sin(t * 3) * 0.05
                break
            }

            case "Sad": {
                // Drooping head, slumped body
                const droop = Math.sin(t * 0.8) * 0.02
                if (b.Head) b.Head.rotation.x += 0.3 + droop
                if (b.NeckTwist01) b.NeckTwist01.rotation.x += 0.1
                if (b.Spine01) b.Spine01.rotation.x += 0.1
                if (b.Spine02) b.Spine02.rotation.x += 0.08
                if (b.L_Upperarm) b.L_Upperarm.rotation.z += 0.2
                if (b.R_Upperarm) b.R_Upperarm.rotation.z -= 0.2
                break
            }

            case "Excited": {
                // Rapid arm movement + head shake + leg kicks
                if (b.L_Upperarm) b.L_Upperarm.rotation.x += Math.sin(t * 10) * 0.5
                if (b.R_Upperarm) b.R_Upperarm.rotation.x += Math.sin(t * 10 + 1) * 0.5
                if (b.Head) b.Head.rotation.z += Math.sin(t * 8) * 0.15
                if (b.Spine01) b.Spine01.rotation.x += Math.sin(t * 8) * 0.08
                if (b.L_Thigh) b.L_Thigh.rotation.x += Math.sin(t * 8) * 0.2
                if (b.R_Thigh) b.R_Thigh.rotation.x += Math.sin(t * 8 + Math.PI) * 0.2
                break
            }

            case "Sleepy": {
                // Very slow breathing, drooping head
                const slowBreathe = Math.sin(t * 1) * 0.03
                if (b.Spine01) b.Spine01.rotation.x += slowBreathe + 0.05
                if (b.Spine02) b.Spine02.rotation.x += slowBreathe * 0.5
                if (b.Head) {
                    b.Head.rotation.x += 0.2 + Math.sin(t * 0.5) * 0.05
                    b.Head.rotation.z += Math.sin(t * 0.3) * 0.08
                }
                if (b.L_Upperarm) b.L_Upperarm.rotation.z += 0.15
                if (b.R_Upperarm) b.R_Upperarm.rotation.z -= 0.15
                break
            }

            case "Wave": {
                // Raise right arm and wave
                const wave = Math.sin(t * 6) * 0.4
                if (b.R_Upperarm) b.R_Upperarm.rotation.z -= 1.2
                if (b.R_Forearm) b.R_Forearm.rotation.z -= 0.5 + wave
                if (b.R_Hand) b.R_Hand.rotation.x += wave * 0.5
                if (b.Spine01) b.Spine01.rotation.z -= 0.05
                if (b.Head) {
                    b.Head.rotation.z -= 0.1
                    b.Head.rotation.x -= Math.sin(t * 3) * 0.05
                }
                break
            }

            case "Dance": {
                // Upper body dance - arms, head, spine
                const beat = Math.sin(t * 4)
                const halfBeat = Math.sin(t * 8)
                // Spine sway side to side
                if (b.Spine01) b.Spine01.rotation.z += beat * 0.08
                if (b.Spine02) b.Spine02.rotation.z += beat * 0.05
                // Arms pump alternately
                if (b.L_Upperarm) b.L_Upperarm.rotation.z += 0.3 + halfBeat * 0.3
                if (b.R_Upperarm) b.R_Upperarm.rotation.z -= 0.3 - halfBeat * 0.3
                if (b.L_Forearm) b.L_Forearm.rotation.x += Math.sin(t * 6) * 0.4
                if (b.R_Forearm) b.R_Forearm.rotation.x += Math.sin(t * 6 + Math.PI) * 0.4
                // Head bobs
                if (b.Head) {
                    b.Head.rotation.z += beat * 0.08
                    b.Head.rotation.x += Math.sin(t * 8) * 0.05
                }
                break
            }

            case "Scared": {
                // Trembling + crouching
                const tremble = (Math.random() - 0.5) * 0.03
                if (b.Spine01) b.Spine01.rotation.x += 0.15 + tremble
                if (b.Spine02) b.Spine02.rotation.x += 0.1 + tremble
                if (b.Head) {
                    b.Head.rotation.x -= 0.1 + tremble
                    b.Head.rotation.y += tremble * 2
                }
                if (b.L_Upperarm) b.L_Upperarm.rotation.x += 0.3
                if (b.R_Upperarm) b.R_Upperarm.rotation.x += 0.3
                if (b.L_Forearm) b.L_Forearm.rotation.x += 0.4
                if (b.R_Forearm) b.R_Forearm.rotation.x += 0.4
                if (b.L_Thigh) b.L_Thigh.rotation.x += 0.1
                if (b.R_Thigh) b.R_Thigh.rotation.x += 0.1
                break
            }

            case "Angry": {
                // Arms come together and apart
                const clap = Math.sin(t * 8)
                const clapOpen = Math.max(0, clap) * 0.4
                if (b.L_Upperarm) b.L_Upperarm.rotation.x += 0.6
                if (b.R_Upperarm) b.R_Upperarm.rotation.x += 0.6
                if (b.L_Upperarm) b.L_Upperarm.rotation.z += 0.4 - clapOpen
                if (b.R_Upperarm) b.R_Upperarm.rotation.z -= 0.4 - clapOpen
                if (b.L_Forearm) b.L_Forearm.rotation.x += 0.6
                if (b.R_Forearm) b.R_Forearm.rotation.x += 0.6
                // Slight body reaction on clap
                if (b.Spine01) b.Spine01.rotation.x += Math.max(0, -clap) * 0.04
                if (b.Head) b.Head.rotation.x += Math.max(0, -clap) * 0.05
                break
            }

            case "Nod": {
                // Agreeable head nod
                const nod = Math.sin(t * 4) * 0.15
                if (b.Head) b.Head.rotation.x += nod
                if (b.NeckTwist01) b.NeckTwist01.rotation.x += nod * 0.3
                // Subtle body follows
                if (b.Spine02) b.Spine02.rotation.x += nod * 0.1
                break
            }

            case "Shake": {
                // Disagreeing head shake
                const shake = Math.sin(t * 6) * 0.2
                if (b.Head) b.Head.rotation.y += shake
                if (b.NeckTwist01) b.NeckTwist01.rotation.y += shake * 0.3
                // Slight frown posture
                if (b.Head) b.Head.rotation.x -= 0.05
                if (b.Spine01) b.Spine01.rotation.x += 0.03
                break
            }
        }
    })

    // Fix transparency issues on Tripo AI models
    useEffect(() => {
        clone.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh
                const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
                mats.forEach((mat) => {
                    const m = mat as THREE.MeshStandardMaterial
                    if (m) {
                        m.transparent = false
                        m.opacity = 1.0
                        m.alphaTest = 0
                        if (m.alphaMap) m.alphaMap = null
                        m.depthWrite = true
                        m.depthTest = true
                        m.side = THREE.FrontSide
                        m.needsUpdate = true
                    }
                })
                mesh.frustumCulled = false
            }
        })
    }, [clone])

    return (
        <group ref={group} dispose={null} scale={0.4}>
            <primitive object={clone} />
        </group>
    )
})

Character2.displayName = "Character2"
export default Character2

useGLTF.preload("/neuropet/test_pet.glb")
