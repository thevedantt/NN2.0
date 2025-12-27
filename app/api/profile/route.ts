
import { NextResponse } from 'next/server';
import { db } from '@/config/db';
import { userProfiles } from '@/config/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // TODO: Replace with actual auth user ID when auth is implemented
        // For now using a hardcoded ID for testing
        const userId = "test_user_123";

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
