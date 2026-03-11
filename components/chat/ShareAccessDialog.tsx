"use client"

import * as React from "react"
import { Shield, ShieldCheck, ShieldOff, Loader2, Lock, Unlock, Wallet, UserCheck, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useWeb3 } from "@/context/Web3Context"

type ShareStep = "idle" | "uploading" | "granting" | "done" | "error"

type TherapistOption = {
    userId: string
    fullName: string
    specializations: string[]
    walletAddress: string | null
    isVerified: boolean
}

interface ShareAccessDialogProps {
    sessionId: number | null
    language?: string
}

export function ShareAccessDialog({ sessionId, language = "en" }: ShareAccessDialogProps) {
    const { walletAddress, connectWallet, isConnecting, getProvider } = useWeb3()
    const [open, setOpen] = React.useState(false)
    const [step, setStep] = React.useState<ShareStep>("idle")
    const [cid, setCid] = React.useState<string | null>(null)
    const [txHash, setTxHash] = React.useState<string | null>(null)
    const [error, setError] = React.useState<string | null>(null)

    // DB-stored wallet (fallback when Web3Auth is not connected)
    const [dbWallet, setDbWallet] = React.useState<string | null>(null)
    const effectiveWallet = walletAddress || dbWallet

    // Therapist selection
    const [therapists, setTherapists] = React.useState<TherapistOption[]>([])
    const [selectedTherapist, setSelectedTherapist] = React.useState<string>("")
    const [loadingTherapists, setLoadingTherapists] = React.useState(false)

    // Active grants for this session
    const [grants, setGrants] = React.useState<any[]>([])
    const [loadingGrants, setLoadingGrants] = React.useState(false)

    // Fetch DB wallet on dialog open
    React.useEffect(() => {
        if (open && !walletAddress) {
            fetch("/api/web3/wallet").then(r => r.json()).then(d => {
                if (d.walletAddress) setDbWallet(d.walletAddress)
            }).catch(() => {})
        }
    }, [open, walletAddress])

    const isHindi = language === "hi"

    const selectedTherapistData = React.useMemo(
        () => therapists.find(t => t.userId === selectedTherapist),
        [therapists, selectedTherapist]
    )

    // Fetch available therapists
    const fetchTherapists = React.useCallback(async () => {
        setLoadingTherapists(true)
        try {
            const res = await fetch("/api/therapist/list")
            const data = await res.json()
            if (res.ok) {
                setTherapists(data.therapists || [])
            }
        } catch (err) {
            console.error("Failed to fetch therapists:", err)
        } finally {
            setLoadingTherapists(false)
        }
    }, [])

    const fetchGrants = React.useCallback(async () => {
        setLoadingGrants(true)
        try {
            const res = await fetch("/api/web3/access")
            const data = await res.json()
            if (res.ok) {
                setGrants((data.grants || []).filter((g: any) => g.sessionId === sessionId && g.isActive))
            }
        } catch (err) {
            console.error("Failed to fetch grants:", err)
        } finally {
            setLoadingGrants(false)
        }
    }, [sessionId])

    React.useEffect(() => {
        if (open && sessionId) {
            fetchTherapists()
            fetchGrants()
        }
    }, [open, sessionId, fetchTherapists, fetchGrants])

    const handleShare = async () => {
        if (!sessionId || !selectedTherapistData || !effectiveWallet) return
        if (!selectedTherapistData.walletAddress) return
        setError(null)

        try {
            // Step 1: Upload encrypted chat to IPFS
            setStep("uploading")
            const uploadRes = await fetch("/api/web3/ipfs/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId }),
            })
            const uploadData = await uploadRes.json()
            if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed")
            setCid(uploadData.cid)

            // Step 2: Record access grant in DB (wallets used for encryption, not on-chain tx)
            setStep("granting")
            const grantRes = await fetch("/api/web3/access", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    therapistUserId: selectedTherapistData.userId,
                    sessionId,
                    ipfsCid: uploadData.cid,
                    patientWallet: effectiveWallet,
                    therapistWallet: selectedTherapistData.walletAddress,
                    txHash: null,
                }),
            })
            const grantData = await grantRes.json()
            if (!grantRes.ok) throw new Error(grantData.error || "Grant failed")

            setStep("done")
            fetchGrants()

        } catch (err: any) {
            setError(err.message)
            setStep("error")
        }
    }

    const handleRevoke = async (grantId: number, grant?: any) => {
        try {
            const res = await fetch("/api/web3/access", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ grantId }),
            })
            if (res.ok) {
                fetchGrants()
            }
        } catch (err) {
            console.error("Revoke failed:", err)
        }
    }

    const resetDialog = () => {
        setStep("idle")
        setSelectedTherapist("")
        setCid(null)
        setTxHash(null)
        setError(null)
    }

    return (
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetDialog() }}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs h-8 gap-2 border-primary/20 hover:bg-primary/10 hover:text-primary bg-transparent text-foreground"
                    disabled={!sessionId}
                >
                    <Shield className="h-3.5 w-3.5" />
                    {isHindi ? "थेरेपिस्ट के साथ साझा करें" : "Share with Therapist"}
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-primary" />
                        {isHindi ? "डेटा साझाकरण प्रबंधित करें" : "Manage Data Sharing"}
                    </DialogTitle>
                    <DialogDescription>
                        {isHindi
                            ? "आपका डेटा एन्क्रिप्टेड है और केवल आप ही एक्सेस दे सकते हैं।"
                            : "Your data is encrypted and only you can grant access. You can revoke at any time."}
                    </DialogDescription>
                </DialogHeader>

                {/* Wallet Connection Status */}
                {!effectiveWallet && step === "idle" && (
                    <Card className="p-3 bg-orange-500/5 border-orange-500/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Wallet className="h-4 w-4 text-orange-500" />
                                <p className="text-xs text-muted-foreground">
                                    {isHindi ? "पहले अपना वॉलेट कनेक्ट करें" : "Connect your wallet to share on-chain"}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={connectWallet}
                                disabled={isConnecting}
                            >
                                {isConnecting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Connect"}
                            </Button>
                        </div>
                    </Card>
                )}
                {effectiveWallet && step === "idle" && (
                    <Card className="p-3 bg-green-500/5 border-green-500/20">
                        <div className="flex items-center gap-2">
                            <Wallet className="h-4 w-4 text-green-500" />
                            <p className="text-xs font-mono text-muted-foreground truncate">
                                {effectiveWallet.slice(0, 6)}...{effectiveWallet.slice(-4)}
                            </p>
                            <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-600 border-green-500/20 ml-auto">Connected</Badge>
                        </div>
                    </Card>
                )}

                {/* Active Grants */}
                {grants.length > 0 && (
                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                            {isHindi ? "सक्रिय एक्सेस" : "Active Access"}
                        </Label>
                        {grants.map((grant) => (
                            <Card key={grant.grantId} className="p-3 flex items-center justify-between bg-green-500/5 border-green-500/20">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-green-500" />
                                    <div>
                                        <p className="text-xs font-medium truncate max-w-[200px]">
                                            {grant.therapistWallet?.slice(0, 6)}...{grant.therapistWallet?.slice(-4)}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            CID: {grant.ipfsCid?.slice(0, 12)}...
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleRevoke(grant.grantId, grant)}
                                >
                                    <ShieldOff className="h-3.5 w-3.5 mr-1" />
                                    {isHindi ? "वापस लें" : "Revoke"}
                                </Button>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Therapist Selection */}
                {step === "idle" && (
                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label>
                                {isHindi ? "थेरेपिस्ट चुनें" : "Select Therapist"}
                            </Label>
                            {loadingTherapists ? (
                                <div className="flex items-center gap-2 p-3 border rounded-md">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Loading therapists...</span>
                                </div>
                            ) : therapists.length === 0 ? (
                                <Card className="p-3 bg-muted/50">
                                    <p className="text-xs text-muted-foreground text-center">
                                        {isHindi ? "कोई थेरेपिस्ट उपलब्ध नहीं" : "No therapists registered yet"}
                                    </p>
                                </Card>
                            ) : (
                                <Select value={selectedTherapist} onValueChange={setSelectedTherapist}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={isHindi ? "एक थेरेपिस्ट चुनें..." : "Choose a therapist..."} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {therapists.map((t) => (
                                            <SelectItem key={t.userId} value={t.userId} disabled={!t.walletAddress}>
                                                <div className="flex items-center gap-2">
                                                    <UserCheck className="h-3.5 w-3.5 text-primary" />
                                                    <span>{t.fullName}</span>
                                                    {t.walletAddress ? (
                                                        <Badge variant="outline" className="text-[9px] ml-1 bg-green-500/10 text-green-600 border-green-500/20">
                                                            Wallet ✓
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-[9px] ml-1 bg-orange-500/10 text-orange-500 border-orange-500/20">
                                                            No Wallet
                                                        </Badge>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {/* Selected therapist details */}
                            {selectedTherapistData && (
                                <Card className="p-3 bg-muted/30 border-border/60">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium">{selectedTherapistData.fullName}</span>
                                            {selectedTherapistData.isVerified && (
                                                <Badge variant="outline" className="text-[9px] bg-blue-500/10 text-blue-600 border-blue-500/20">Verified</Badge>
                                            )}
                                        </div>
                                        {selectedTherapistData.walletAddress ? (
                                            <p className="text-[10px] font-mono text-muted-foreground">
                                                🔗 {selectedTherapistData.walletAddress.slice(0, 10)}...{selectedTherapistData.walletAddress.slice(-6)}
                                            </p>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-[10px] text-orange-500">
                                                <AlertCircle className="h-3 w-3" />
                                                {isHindi
                                                    ? "इस थेरेपिस्ट ने अभी तक वॉलेट कनेक्ट नहीं किया है"
                                                    : "This therapist hasn't connected their wallet yet"}
                                            </div>
                                        )}
                                        {Array.isArray(selectedTherapistData.specializations) && (
                                            <div className="flex flex-wrap gap-1 pt-1">
                                                {(selectedTherapistData.specializations as string[]).slice(0, 3).map((s) => (
                                                    <Badge key={s} variant="secondary" className="text-[9px] px-1.5 py-0">
                                                        {s}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            )}
                        </div>
                    </div>
                )}

                {/* Progress States */}
                {step === "uploading" && (
                    <div className="flex flex-col items-center gap-3 py-6">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">
                            {isHindi ? "चैट डेटा एन्क्रिप्ट और अपलोड हो रहा है..." : "Encrypting and uploading chat data..."}
                        </p>
                        <Badge variant="outline" className="text-[10px]">IPFS → Pinata</Badge>
                    </div>
                )}

                {step === "granting" && (
                    <div className="flex flex-col items-center gap-3 py-6">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">
                            {isHindi ? "ब्लॉकचेन पर एक्सेस अनुमति दी जा रही है..." : "Recording access grant on blockchain..."}
                        </p>
                        <Badge variant="outline" className="text-[10px]">Polygon Amoy</Badge>
                    </div>
                )}

                {step === "done" && (
                    <div className="flex flex-col items-center gap-3 py-6 text-center">
                        <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                            <ShieldCheck className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">
                                {isHindi ? "एक्सेस सफलतापूर्वक दी गई!" : "Access Granted Successfully!"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {selectedTherapistData?.fullName} {isHindi ? "अब इस सत्र को देख सकते हैं" : "can now view this session"}
                            </p>
                        </div>
                        {cid && (
                            <Badge variant="secondary" className="text-[10px] font-mono">
                                CID: {cid.slice(0, 16)}...
                            </Badge>
                        )}
                        {txHash && (
                            <Badge variant="outline" className="text-[10px] font-mono bg-primary/5">
                                Tx: {txHash.slice(0, 16)}...
                            </Badge>
                        )}
                    </div>
                )}

                {step === "error" && (
                    <div className="flex flex-col items-center gap-3 py-6 text-center">
                        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                            <ShieldOff className="h-6 w-6 text-destructive" />
                        </div>
                        <p className="text-sm text-destructive">{error}</p>
                    </div>
                )}

                <DialogFooter>
                    {step === "idle" && (
                        <Button
                            onClick={handleShare}
                            disabled={!selectedTherapist || !selectedTherapistData?.walletAddress || !sessionId || !effectiveWallet}
                            className="w-full gap-2"
                        >
                            <Unlock className="h-4 w-4" />
                            {isHindi ? "एन्क्रिप्ट करें और साझा करें" : "Encrypt & Share"}
                        </Button>
                    )}
                    {(step === "done" || step === "error") && (
                        <Button variant="outline" onClick={resetDialog} className="w-full">
                            {step === "done"
                                ? (isHindi ? "बंद करें" : "Close")
                                : (isHindi ? "पुनः प्रयास करें" : "Try Again")
                            }
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
