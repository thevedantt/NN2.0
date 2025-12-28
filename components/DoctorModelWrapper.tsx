"use client";

import dynamic from "next/dynamic";

// Three.js relies on browser APIs, so we dynamically import with SSR disabled
// This wrapper component is a Client Component, which allows ssr: false
const DoctorModel = dynamic(
    () => import("@/components/DoctorModel"),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-muted/20 rounded-xl">
                <div className="animate-pulse text-muted-foreground">Loading 3D Model...</div>
            </div>
        )
    }
);

export default function DoctorModelWrapper() {
    return <DoctorModel />;
}
