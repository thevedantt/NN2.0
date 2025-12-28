import { NextResponse } from 'next/server';
import { db } from '@/config/db';
import { userProfiles } from '@/config/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Helper to get authenticated user ID
// Helper to get authenticated user ID
async function getUserId() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        console.log("[YouTube Feed API] Auth failed: No token found in cookies.");
        return null; // No token
    }

    const payload = await verifyAccessToken(token);

    if (!payload) {
        console.log("[YouTube Feed API] Auth failed: Token verification failed.");
        return null;
    }

    return payload.sub as string;
}

// Helper to fetch from YouTube
async function fetchFromYouTube(query: string, maxResults: number) {
    if (!YOUTUBE_API_KEY) return [];

    try {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(query)}&type=video&videoEmbeddable=true&key=${YOUTUBE_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) {
            console.error("YouTube API Error for query:", query, data);
            return [];
        }

        return data.items.map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.medium.url,
            channelTitle: item.snippet.channelTitle
        }));
    } catch (error) {
        console.error("YouTube Fetch Error:", error);
        return [];
    }
}

export async function GET(req: Request) {
    try {
        const userId = await getUserId();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch User Profile
        const profiles = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
        const profile = profiles[0];

        // Defaults
        let comedyQuery = "standup comedy";
        let musicQuery = "relaxing music";

        // Personalized Queries
        if (profile) {
            const entertainment = profile.entertainment as Record<string, any> | null;
            const music = profile.musicDetails as Record<string, any> | null;

            // 1. Comedy
            const favComedian = entertainment?.favoriteComedian;
            if (favComedian) {
                comedyQuery = `${favComedian} standup comedy`;
            }

            // 2. Music (Comfort Artist)
            const comfortArtist = entertainment?.comfortArtist || music?.artist;
            if (comfortArtist) {
                musicQuery = `${comfortArtist} most popular song`;
            }
        }

        // 3. Spiritual (Random Selection)
        const spiritualQueries = ["Hanuman Chalisa", "Gayatri Mantra", "Peaceful Bhajan", "Calm Mediation Types"];
        const spiritualQuery = spiritualQueries[Math.floor(Math.random() * spiritualQueries.length)];

        console.log(`[YouTube API] Queries - Comedy: "${comedyQuery}", Music: "${musicQuery}", Spiritual: "${spiritualQuery}"`);

        if (!YOUTUBE_API_KEY) {
            console.error("Missing YOUTUBE_API_KEY env var");
            // Return mocks or empty if no key, but better to error so frontend handles it
            // Actually, for dev without key, let's return a specific error
            return NextResponse.json({ error: "Configuration Error: No YouTube API Key" }, { status: 500 });
        }

        const [comedyVideos, musicVideos, spiritualVideos] = await Promise.all([
            fetchFromYouTube(comedyQuery, 2),
            fetchFromYouTube(musicQuery, 1),
            fetchFromYouTube(spiritualQuery, 1)
        ]);

        return NextResponse.json({
            categories: {
                comedy: comedyVideos,
                music: musicVideos,
                spiritual: spiritualVideos
            }
        });

    } catch (error) {
        console.error('YouTube Feed Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
