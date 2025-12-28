"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PlayCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Video {
    id: string;
    title: string;
    thumbnail: string;
    channelTitle: string;
}

export function YoutubeFeed() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchVideos() {
            try {
                const res = await fetch("/api/youtube/feed");
                if (!res.ok) throw new Error("Failed to load content");

                const data = await res.json();
                setVideos(data.videos || []);
                setQuery(data.query || "");
            } catch (err) {
                console.error(err);
                setError("Could not load your personalized recommendations.");
            } finally {
                setLoading(false);
            }
        }
        fetchVideos();
    }, []);

    if (error) {
        return (
            <Alert variant="destructive" className="mb-6">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PlayCircle className="h-5 w-5 text-red-500" />
                    Recommended for You
                </CardTitle>
                <CardDescription>
                    Based on your interest in{" "}
                    <span className="font-semibold text-primary">
                        "{query || "relaxation"}"
                    </span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="h-40 w-full rounded-lg" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : videos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {videos.map((video) => (
                            <a
                                key={video.id}
                                href={`https://www.youtube.com/watch?v=${video.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block space-y-2"
                            >
                                <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted/50 transition-all group-hover:ring-2 group-hover:ring-primary">
                                    <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                                        <PlayCircle className="text-white h-12 w-12" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                        {video.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">{video.channelTitle}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-8">
                        No recommendations found. Keep updating your profile!
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
