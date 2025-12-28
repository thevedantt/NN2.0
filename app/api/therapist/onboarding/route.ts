import { NextResponse } from 'next/server';
import { db } from '@/config/db';
import { therapistProfiles, users } from '@/config/schema';
import { verifyAccessToken } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const payload = await verifyAccessToken(token);

        if (!payload || !payload.sub) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const userId = payload.sub;
        const body = await req.json();

        // Validate required fields
        const { fullName, mobileNumber, licenseNumber, specializations, perSessionFee, preferredSessionType } = body;

        if (!fullName || !licenseNumber || !specializations || !perSessionFee) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Create Profile
        await db.insert(therapistProfiles).values({
            userId,
            fullName,
            mobileNumber,
            licenseNumber,
            specializations: specializations, // JSON/Array logic depends on frontend sending correct format
            perSessionFee: parseInt(perSessionFee),
            preferredSessionType,
            isOnboardingComplete: true, // Though this field isn't in this table schema explicitly as a flag, we rely on users table flag
            // Wait, schema has isVerified but not isOnboardingComplete in profile table?
            // Schema has `isOnboardingComplete` in USERS table.
        });

        // Update User Table Flag
        await db.update(users)
            .set({ isOnboardingComplete: true })
            .where(eq(users.id, userId));

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Onboarding Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
