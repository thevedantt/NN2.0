"use client"

import * as React from "react"
import {
    Shield,
    ShieldCheck,
    ShieldOff,
    Loader2,
    Lock,
    MessageSquare,
    ClipboardList,
    Trash2,
    RefreshCw,
    ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Grant = {
    grantId: number
    patientUserId: string
    therapistUserId: string
    patientWallet: string
    therapistWallet: string
    sessionId: number | null
    dataType: string
    ipfsCid: string
    txHash: string | null
    isActive: boolean
    grantedAt: string
    revokedAt: string | null
}

type TherapistInfo = {
    userId: string
    fullName: string
}

export default function SharingHistoryPage() {
    const [grants, setGrants] = React.useState<Grant[]>([])
    const [loading, setLoading] = React.useState(true)
    const [revoking, setRevoking] = React.useState<number | null>(null)
    const [therapistNames, setTherapistNames] = React.useState<Record<string, string>>({})

    const fetchGrants = React.useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/web3/access")
            const data = await res.json()
            if (res.ok) {
                setGrants(data.grants || [])

                // Fetch therapist names
                const therapistIds = [...new Set((data.grants || []).map((g: Grant) => g.therapistUserId))]
                const names: Record<string, string> = {}
                const listRes = await fetch("/api/therapist/list")
                const listData = await listRes.json()
                if (listRes.ok) {
                    for (const t of listData.therapists || []) {
                        names[t.userId] = t.fullName
                    }
                }
                setTherapistNames(names)
            }
        } catch (err) {
            console.error("Failed to fetch grants:", err)
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchGrants()
    }, [fetchGrants])

    const handleRevoke = async (grantId: number) => {
        setRevoking(grantId)
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
        } finally {
            setRevoking(null)
        }
    }

    const activeGrants = grants.filter(g => g.isActive)
    const revokedGrants = grants.filter(g => !g.isActive)

    return (
        <div className="flex-1 h-full overflow-y-auto w-full p-6 md:p-8 bg-background">
            <div className="max-w-4xl mx-auto w-full space-y-6">

                {/* Header */}
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            <Shield className="h-8 w-8 text-primary" />
                            Sharing History
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage all data you've shared with therapists. Revoke access at any time.
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchGrants} disabled={loading} className="gap-2">
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </header>

                {/* Info Banner */}
                <Card className="border-primary/20 bg-primary/5 shadow-none">
                    <CardContent className="p-4 flex items-start gap-3">
                        <Lock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Your Data, Your Control</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                All shared data is encrypted with your wallet key and uploaded to IPFS.
                                Revoking access marks the grant as inactive — the therapist can no longer view the data.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                        <span className="text-sm text-muted-foreground">Loading sharing history...</span>
                    </div>
                )}

                {/* Empty State */}
                {!loading && grants.length === 0 && (
                    <Card className="shadow-sm">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                <Shield className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-lg font-semibold mb-1">No Shared Data Yet</h3>
                            <p className="text-sm text-muted-foreground max-w-sm">
                                You haven't shared any data with therapists. You can share your chat sessions
                                from the Chat AI page or assessment results from the Assessment page.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Active Grants */}
                {!loading && activeGrants.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-green-500" />
                            Active Shares ({activeGrants.length})
                        </h2>
                        {activeGrants.map((grant) => (
                            <Card key={grant.grantId} className="shadow-sm border-green-500/20">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                                                {grant.dataType === 'assessment' ? (
                                                    <ClipboardList className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <MessageSquare className="h-5 w-5 text-green-600" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {grant.dataType === 'assessment' ? "Assessment Result" : `Chat Session #${grant.sessionId}`}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                    <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-600 border-green-500/20">
                                                        Active
                                                    </Badge>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        Shared with: {therapistNames[grant.therapistUserId] || "Therapist"}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        • {new Date(grant.grantedAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground font-mono mt-1">
                                                    CID: {grant.ipfsCid.slice(0, 20)}...
                                                </p>
                                            </div>
                                        </div>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="h-8 text-xs gap-1.5"
                                                    disabled={revoking === grant.grantId}
                                                >
                                                    {revoking === grant.grantId ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-3 w-3" />
                                                    )}
                                                    Revoke
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Revoke Access?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will immediately revoke {therapistNames[grant.therapistUserId] || "the therapist"}'s
                                                        access to {grant.dataType === 'assessment' ? "this assessment result" : `Chat Session #${grant.sessionId}`}. They will no longer be able to view this data.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleRevoke(grant.grantId)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Yes, Revoke Access
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Revoked Grants */}
                {!loading && revokedGrants.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <ShieldOff className="h-4 w-4 text-muted-foreground" />
                            Revoked Shares ({revokedGrants.length})
                        </h2>
                        {revokedGrants.map((grant) => (
                            <Card key={grant.grantId} className="shadow-sm opacity-60">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center">
                                            {grant.dataType === 'assessment' ? (
                                                <ClipboardList className="h-5 w-5 text-muted-foreground" />
                                            ) : (
                                                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground line-through">
                                                {grant.dataType === 'assessment' ? "Assessment Result" : `Chat Session #${grant.sessionId}`}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                                    Revoked
                                                </Badge>
                                                <span className="text-[10px] text-muted-foreground">
                                                    Was shared with: {therapistNames[grant.therapistUserId] || "Therapist"}
                                                </span>
                                                {grant.revokedAt && (
                                                    <span className="text-[10px] text-muted-foreground">
                                                        • Revoked {new Date(grant.revokedAt).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

            </div>
        </div>
    )
}
