
import { NextResponse } from 'next/server';
import { db } from '@/config/db';
import { appointments } from '@/config/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(req: Request) {
    try {
        // Mock userId for now
        const userId = "test_user_123";

        const result = await db.select().from(appointments)
            .where(eq(appointments.userId, userId))
            .orderBy(desc(appointments.createdAt));

        return NextResponse.json({ success: true, appointments: result });
    } catch (error) {
        console.error('Fetch appointments error:', error);
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}


export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { doctorId, doctorSnapshot, appointmentDate, appointmentTime, sessionType, price } = body;

        // Mock userId for now
        const userId = "test_user_123";

        const result = await db.insert(appointments).values({
            userId,
            doctorId,
            doctorSnapshot,
            appointmentDate, // Expecting YYYY-MM-DD string
            appointmentTime,
            sessionType,
            price
        }).returning();

        return NextResponse.json({ success: true, appointment: result[0] });
    } catch (error) {
        console.error('Booking error:', error);
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
