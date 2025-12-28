
import { NextResponse } from 'next/server';
import { db } from '@/config/db';
import { userProfiles } from '@/config/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth';

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

        const profiles = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));

        if (profiles.length === 0) {
            return NextResponse.json({}); // Return empty object if no profile found
        }

        return NextResponse.json(profiles[0]);
    } catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const userId = await getUserId();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        console.log("Received profile data for user:", userId, body);

        // Check if profile exists
        const existingProfile = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));

        if (existingProfile.length > 0) {
            // Update existing
            await db.update(userProfiles).set({
                ...body,
                updatedAt: new Date(),
            }).where(eq(userProfiles.userId, userId));
            console.log("Updated profile for user:", userId);
        } else {
            // Create new
            await db.insert(userProfiles).values({
                userId,
                ...body,
            });
            console.log("Created new profile for user:", userId);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Profile save error:', error);
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
