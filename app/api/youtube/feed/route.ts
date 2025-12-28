import { NextResponse } from 'next/server';
import { db } from '@/config/db';
import { userProfiles } from '@/config/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Helper to get authenticated user ID
async function getUserId() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return null;

    const payload = await verifyAccessToken(token);
    return payload ? (payload.sub as string) : null;
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

        if (!profile) {
            return NextResponse.json({ videos: [], message: "No profile found" });
        }

        // --- QUERY CONSTRUCTION LOGIC ---

        let searchQuery = "";
        const socialPrefs = profile.socialPreferences as Record<string, string> | null;
        const entertainment = profile.entertainment as Record<string, any> | null;

        const youtubePref = socialPrefs?.['youtube'];
        const favComedian = entertainment?.favoriteComedian;

        if (youtubePref && favComedian) {
            // Combine both for highly personalized result
            // e.g. "Anubhav Singh Bassi Standup comedies videos"
            searchQuery = `${favComedian} ${youtubePref}`;
        } else if (favComedian) {
            // Fallback: Comedian + context
            searchQuery = `${favComedian} standup comedy`;
        } else if (youtubePref) {
            // Fallback: Just the preference
            searchQuery = youtubePref;
        } else {
            // General Fallback if nothing specific
            searchQuery = "motivational videos";
        }

        console.log(`[YouTube API] Generated Query for User ${userId}: "${searchQuery}"`);

        // Call YouTube Data API
        if (!YOUTUBE_API_KEY) {
            console.error("Missing YOUTUBE_API_KEY env var");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const ytUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=${encodeURIComponent(searchQuery)}&type=video&key=${YOUTUBE_API_KEY}`;

        const ytRes = await fetch(ytUrl);
        const ytData = await ytRes.json();

        if (!ytRes.ok) {
            console.error("YouTube API Error:", ytData);
            return NextResponse.json({ error: "Failed to fetch videos" }, { status: ytRes.status });
        }

        // Transform results for frontend
        const videos = ytData.items.map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.medium.url,
            channelTitle: item.snippet.channelTitle
        }));

        return NextResponse.json({
            query: searchQuery,
            videos
        });

    } catch (error) {
        console.error('YouTube Feed Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
