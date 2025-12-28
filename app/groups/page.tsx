"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Users, Search, MessageSquare, Shield, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { db } from "@/lib/firebase"
import { collection, getDocs, doc, setDoc, updateDoc, increment, serverTimestamp, getDoc } from "firebase/firestore"

interface Group {
    id: string
    name: string
    members: number
    topic: string
    description: string
    type: string
}

export default function GroupsPage() {
    const router = useRouter()
    const [groups, setGroups] = React.useState<Group[]>([])
    const [loading, setLoading] = React.useState(true)
    const [joining, setJoining] = React.useState<string | null>(null)
    // Track which groups the user has already joined
    const [joinedGroups, setJoinedGroups] = React.useState<Set<string>>(new Set())
    // Track membership check status per group
    const [checkingMembership, setCheckingMembership] = React.useState<string | null>(null)

    // Mock User Data (as per instructions)
    const USER_ID = "user_123"
    const USERNAME = "Demo User"

    // NOTE: Firestore is fetched once on the client, stored in state, and rendered deterministically.
    // This eliminates race conditions and ensures consistent UI.
    React.useEffect(() => {
        let isMounted = true;

        async function loadGroups() {
            console.log("📡 Fetching groups from Firestore...");

            try {
                const snapshot = await getDocs(collection(db, "groups"));

                const fetchedGroups: Group[] = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        name: data.name || "Unnamed Group",
                        topic: data.category || "General",
                        description: data.description || "No description available.",
                        members: data.membersCount || 0,
                        type: data.safeSpace ? "Moderated" : "Public"
                    };
                });

                console.log("✅ Groups fetched:", fetchedGroups.length, fetchedGroups);

                if (isMounted) {
                    setGroups(fetchedGroups);

                    // Check membership for all groups
                    const membershipChecks = await Promise.all(
                        fetchedGroups.map(async (group) => {
                            const memberRef = doc(db, "groups", group.id, "members", USER_ID);
                            const snap = await getDoc(memberRef);
                            return { groupId: group.id, isMember: snap.exists() };
                        })
                    );

                    const joined = new Set<string>();
                    membershipChecks.forEach(({ groupId, isMember }) => {
                        if (isMember) joined.add(groupId);
                    });

                    if (isMounted) {
                        setJoinedGroups(joined);
                        console.log("✅ Membership checked. Joined groups:", Array.from(joined));
                    }
                }
            } catch (err) {
                console.error("❌ Firestore fetch failed:", err);
                if (isMounted) {
                    setGroups([]);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        loadGroups();

        return () => {
            isMounted = false;
        };
    }, [])

    const handleJoinGroup = async (groupId: string, closeDialog: () => void) => {
        console.log("✅ Agree & Join clicked");
        console.log("📌 Group ID:", groupId);

        if (!groupId) {
            console.error("❌ Group ID is missing!");
            return;
        }

        setJoining(groupId);

        try {
            console.log("🚀 Starting join process...");

            // 1. Write to members subcollection
            const memberRef = doc(db, "groups", groupId, "members", USER_ID);
            console.log("📝 Writing membership record...");
            await setDoc(memberRef, {
                userId: USER_ID,
                username: USERNAME,
                joinedAt: serverTimestamp(),
                role: "member"
            });

            // 2. Increment membersCount
            console.log("📊 Updating member count...");
            const groupRef = doc(db, "groups", groupId);
            await updateDoc(groupRef, {
                membersCount: increment(1)
            });

            console.log("✅ Successfully joined group!");

            // Update state
            setJoinedGroups(prev => new Set([...prev, groupId]));
            setGroups(prev => prev.map(g =>
                g.id === groupId ? { ...g, members: g.members + 1 } : g
            ));

            // Close dialog and navigate to chat
            closeDialog();
            router.push(`/groups/${groupId}`);

        } catch (error: any) {
            console.error("❌ Failed to join group:", error);
        } finally {
            setJoining(null);
        }
    }

    const handleStartChat = (groupId: string, closeDialog: () => void) => {
        closeDialog();
        router.push(`/groups/${groupId}`);
    }

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Community Groups</h1>
                    <p className="text-muted-foreground mt-1">Connect with others who understand what you're going through.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Find a group..." className="pl-9 bg-background" />
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : groups.length === 0 ? (
                <div className="text-center py-12">
                    <h3 className="text-lg font-semibold">No active groups found</h3>
                    <p className="text-muted-foreground">Check back later for new communities.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map((group) => {
                        const isJoined = joinedGroups.has(group.id);

                        return (
                            <Card key={group.id} className="group hover:shadow-lg transition-all duration-300 border-border/60 bg-card/50 backdrop-blur-sm flex flex-col">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="secondary" className="bg-secondary/50 hover:bg-secondary/70">{group.topic}</Badge>
                                        {group.type === "Moderated" && (
                                            <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 flex gap-1 items-center">
                                                <Shield className="h-3 w-3" /> Safe Space
                                            </Badge>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-semibold leading-tight group-hover:text-primary transition-colors">{group.name}</h3>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p className="text-muted-foreground text-sm line-clamp-3">{group.description}</p>
                                    <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground font-medium">
                                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {group.members} Members</span>
                                        <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Active now</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0">
                                    {isJoined ? (
                                        // Already joined - show Open Chat button directly
                                        <Button
                                            className="w-full"
                                            variant="secondary"
                                            onClick={() => router.push(`/groups/${group.id}`)}
                                        >
                                            <Check className="mr-2 h-4 w-4" />
                                            Open Chat
                                        </Button>
                                    ) : (
                                        // Not joined - show Join Group dialog
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button className="w-full">Join Group</Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Join {group.name}?</DialogTitle>
                                                    <DialogDescription>
                                                        This is a {group.type.toLowerCase()} group. Please agree to the community rules before joining.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="p-4 bg-muted/30 rounded-lg text-sm space-y-2 border">
                                                    <p>1. Be kind and respectful.</p>
                                                    <p>2. No medical advice.</p>
                                                    <p>3. Maintain confidentiality.</p>
                                                </div>
                                                <DialogFooter>
                                                    <DialogClose asChild>
                                                        <Button variant="outline">Cancel</Button>
                                                    </DialogClose>
                                                    <DialogClose asChild>
                                                        <Button
                                                            className="w-full sm:w-auto"
                                                            onClick={() => handleJoinGroup(group.id, () => { })}
                                                            disabled={joining === group.id}
                                                        >
                                                            {joining === group.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                            Agree & Join
                                                        </Button>
                                                    </DialogClose>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    )
}
