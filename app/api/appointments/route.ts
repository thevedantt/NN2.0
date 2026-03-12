
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/config/db';
import { appointments } from '@/config/schema';
import { eq, desc } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth';

async function getUserId(req: NextRequest): Promise<string | null> {
    // 1. Try Authorization header (localStorage token — used by booking page)
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const payload = await verifyAccessToken(token);
        if (payload?.sub) return payload.sub as string;
    }

    // 2. Fall back to httpOnly cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    const payload = await verifyAccessToken(token);
    return payload ? (payload.sub as string) : null;
}

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserId(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await db.select().from(appointments)
            .where(eq(appointments.userId, userId))
            .orderBy(desc(appointments.createdAt));

        return NextResponse.json({ success: true, appointments: result });
    } catch (error) {
        console.error('Fetch appointments error:', error);
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserId(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { doctorId, doctorSnapshot, appointmentDate, appointmentTime, sessionType, price } = body;

        const result = await db.insert(appointments).values({
            userId,
            doctorId,
            doctorSnapshot,
            appointmentDate,
            appointmentTime,
            sessionType,
            price
        }).returning();

        return NextResponse.json({ success: true, appointment: result[0] });
    } catch (error: any) {
        console.error('Booking error:', error);
        // Expose Neon/PostgreSQL error details (code, detail, hint) for diagnostics
        return NextResponse.json({
            success: false,
            error: error.message,
            code: error.code,
            detail: error.detail,
            hint: error.hint,
        }, { status: 500 });
    }
}
