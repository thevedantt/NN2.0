"use client"

import React, { useRef, useMemo } from "react"
import * as THREE from "three"
import { useFrame } from "@react-three/fiber"
import { Environment, ContactShadows, Sphere, useTexture } from "@react-three/drei"

/**
 * SceneEnvironment — adds depth, atmosphere, and grounding to the 3D scene.
 * Drop this inside the <Canvas> alongside the pet character.
 *
 * What it adds:
 *  - HDRI environment for realistic ambient lighting & reflections
 *  - Soft 3-point lighting (key, fill, rim)
 *  - Ground plane with contact shadows
 *  - Subtle animated floating particles for life
 *  - Gradient sky dome for a warm backdrop
 */
export default function SceneEnvironment() {
    return (
        <>
            {/* ─── HDRI Environment (reflections & ambient fill) ─── */}
            <Environment preset="sunset" background={false} environmentIntensity={0.6} />

            {/* ─── Lighting Rig ─── */}
            {/* Key light — warm directional from top-right */}
            <directionalLight
                position={[4, 6, 3]}
                intensity={1.8}
                color="#fff5e6"
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-camera-near={0.1}
                shadow-camera-far={20}
                shadow-camera-left={-4}
                shadow-camera-right={4}
                shadow-camera-top={4}
                shadow-camera-bottom={-4}
                shadow-bias={-0.002}
            />
            {/* Fill light — cool blue from the left */}
            <directionalLight
                position={[-3, 4, -2]}
                intensity={0.5}
                color="#a8c8ff"
            />
            {/* Rim / back light — warm accent from behind */}
            <pointLight
                position={[0, 3, -4]}
                intensity={0.7}
                color="#ffb380"
                distance={12}
                decay={2}
            />
            {/* Subtle ambient base */}
            <ambientLight intensity={0.4} color="#f0e6ff" />
            {/* Hemisphere light for natural sky-ground gradient */}
            <hemisphereLight
                args={["#b1d4ff", "#6b4c2a", 0.35]}
            />

            {/* ─── Ground Plane ─── */}
            <GroundPlane />

            {/* ─── Contact Shadows (soft shadow pool under the pet) ─── */}
            <ContactShadows
                position={[0, 0.01, 0]}
                opacity={0.5}
                scale={8}
                blur={2.5}
                far={3}
                color="#3d2b1a"
            />

            {/* ─── Sky Dome (warm gradient backdrop) ─── */}
            <SkyDome />

            {/* ─── Floating dust motes for atmosphere ─── */}
            <FloatingParticles count={30} />
        </>
    )
}

/* ────────────────────────────────────────────────────
 * Ground Plane
 * A large circular disc with a soft material,
 * appearing to fade at the edges for a natural look.
 * ──────────────────────────────────────────────────── */
function GroundPlane() {
    const meshRef = useRef<THREE.Mesh>(null)

    return (
        <mesh
            ref={meshRef}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0, 0]}
            receiveShadow
        >
            <circleGeometry args={[1.5, 64]} />
            <meshStandardMaterial
                color="#c4a882"
                roughness={0.8}
                metalness={0.1}
                transparent
                opacity={0.8}
            />
        </mesh>
    )
}

/* ────────────────────────────────────────────────────
 * Sky Dome
 * Uses the provided bg.png as a textured 3D environment.
 * ──────────────────────────────────────────────────── */
function SkyDome() {
    const texture = useTexture("/neuropet/bg.png")
    const meshRef = useRef<THREE.Mesh>(null)
    
    // Ensure the texture wraps correctly and is high quality
    texture.colorSpace = THREE.SRGBColorSpace
    texture.mapping = THREE.EquirectangularReflectionMapping 

    // Add a very subtle parallax effect to make the background feel "alive" and 3D
    useFrame((state) => {
        if (meshRef.current) {
            // Slow idle rotation
            meshRef.current.rotation.y += 0.0001
            // Subtle reaction to mouse movement for depth
            meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, state.mouse.x * 0.3, 0.05)
            meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, state.mouse.y * 0.2, 0.05)
        }
    })

    return (
        <Sphere ref={meshRef} args={[45, 64, 64]} rotation={[0, -Math.PI / 2, 0]}>
            <meshBasicMaterial 
                map={texture} 
                side={THREE.BackSide} 
                toneMapped={false}
                transparent={true}
                opacity={1}
            />
        </Sphere>
    )
}

/* ────────────────────────────────────────────────────
 * Floating Particles
 * Tiny animated dots that drift slowly to add life.
 * ──────────────────────────────────────────────────── */
function FloatingParticles({ count = 30 }: { count?: number }) {
    const pointsRef = useRef<THREE.Points>(null)

    const { positions, speeds } = useMemo(() => {
        const pos = new Float32Array(count * 3)
        const spd = new Float32Array(count)
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 8
            pos[i * 3 + 1] = Math.random() * 4 + 0.2
            pos[i * 3 + 2] = (Math.random() - 0.5) * 8
            spd[i] = 0.1 + Math.random() * 0.3
        }
        return { positions: pos, speeds: spd }
    }, [count])

    useFrame((_, delta) => {
        if (!pointsRef.current) return
        const posAttr = pointsRef.current.geometry.getAttribute(
            "position"
        ) as THREE.BufferAttribute
        const arr = posAttr.array as Float32Array
        for (let i = 0; i < count; i++) {
            arr[i * 3 + 1] += Math.sin(Date.now() * 0.001 * speeds[i] + i) * delta * 0.15
            arr[i * 3] += Math.cos(Date.now() * 0.0005 * speeds[i] + i * 0.7) * delta * 0.05
        }
        posAttr.needsUpdate = true
    })

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                    count={count}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.03}
                color="#ffe8c0"
                transparent
                opacity={0.5}
                sizeAttenuation
                depthWrite={false}
            />
        </points>
    )
}
