import { NextResponse } from 'next/server';
import { db } from '@/config/db';
import { therapistProfiles } from '@/config/schema';

export async function GET() {
    try {
        const therapists = await db.select().from(therapistProfiles);
        return NextResponse.json(therapists);
    } catch (error) {
        console.error("Fetch Doctors Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
