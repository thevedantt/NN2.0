"use client"

import React, { useState } from "react"
import { usePetStore } from "../store/petStore"
import { useRouter } from "next/navigation"

interface AdoptionModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function AdoptionModal({ isOpen, onClose }: AdoptionModalProps) {
    const [name, setName] = useState("")
    const setPetName = usePetStore((s) => s.setPetName)
    const router = useRouter()

    if (!isOpen) return null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (name.trim()) {
            setPetName(name.trim())
            onClose()
            router.push("/neuropet")
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[#280B0B]/40 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border border-[#EAD8BB] animate-in zoom-in-95 duration-300">
                <div className="text-center space-y-6">
                    <div className="text-5xl animate-bounce">🐣</div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-[#781C2E]">Name Your Pet</h2>
                        <p className="text-[#280B0B]/60 text-lg">
                            Every journey starts with a name. What would you like to call your companion?
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                        <input
                            autoFocus
                            type="text"
                            placeholder="e.g. Buddy, Sparky, Pip..."
                            className="w-full px-6 py-4 rounded-2xl bg-[#F9E7C9]/30 border-2 border-[#EAD8BB] text-xl font-bold text-[#280B0B] placeholder:text-[#280B0B]/30 focus:outline-none focus:border-[#781C2E] focus:ring-4 focus:ring-[#781C2E]/5 transition-all"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

                        <div className="flex flex-col gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={!name.trim()}
                                className="w-full py-5 bg-[#781C2E] text-white rounded-full font-bold text-xl shadow-xl hover:bg-[#5a1523] disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 transition-all"
                            >
                                Start Journey
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full py-3 text-[#280B0B]/40 font-bold hover:text-[#280B0B]/60 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
