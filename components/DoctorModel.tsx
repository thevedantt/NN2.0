"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, ContactShadows, Environment, useAnimations } from "@react-three/drei";
import * as THREE from "three";

function Model(props: any) {
    const group = useRef<THREE.Group>(null);
    const { scene, animations } = useGLTF("/models/doctor_-_sketchfab_weekly_-_13_mar23.glb");
    const { actions } = useAnimations(animations, group);

    // Play the first animation found (usually the main one)
    React.useEffect(() => {
        if (actions && Object.keys(actions).length > 0) {
            const firstAction = Object.values(actions)[0];
            firstAction?.reset().fadeIn(0.5).play();
        }
    }, [actions]);

    useFrame((state) => {
        if (group.current) {
            // Very subtle floating, stable rotation
            group.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
            // Removed constant rotation so user can see the "checking pad" pose better
            // group.current.rotation.y = state.clock.elapsedTime * 0.1; 
        }
    });

    return <primitive ref={group} object={scene} {...props} />;
}

export default function DoctorModel() {
    return (
        <div className="w-full h-full min-h-[400px]">
            <Canvas camera={{ position: [0, 1.5, 4], fov: 40 }}> {/* Adjusted camera for better view */}
                <ambientLight intensity={0.5} />
                <spotLight
                    position={[10, 10, 10]}
                    angle={0.15}
                    penumbra={1}
                    intensity={1}
                    castShadow
                />
                <Environment preset="city" />
                <group position={[0, 0.5, 0]}>
                    <Model scale={1.1} /> {/* Reduced scale from 1.5 to 1.1 */}
                    <ContactShadows opacity={0.7} scale={10} blur={2.5} far={4} color="black" />
                </group>
                <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2} />
            </Canvas>
        </div>
    );
}

// Preload the model
useGLTF.preload("/models/doctor_-_sketchfab_weekly_-_13_mar23.glb");
