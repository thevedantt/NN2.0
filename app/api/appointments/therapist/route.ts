import { NextResponse } from 'next/server';
import { db } from '@/config/db';
import { appointments, users } from '@/config/schema';
import { eq, desc } from 'drizzle-orm';
import { verifyAccessToken } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const payload = await verifyAccessToken(token);

        if (!payload || !payload.sub) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
        }

        const currentTherapistId = payload.sub as string;

        const result = await db.select({
            appointment: appointments,
            patientEmail: users.email,
            patientWallet: users.walletAddress,
        })
        .from(appointments)
        .leftJoin(users, eq(users.id, appointments.userId))
        .where(eq(appointments.doctorId, currentTherapistId))
        .orderBy(desc(appointments.appointmentDate), desc(appointments.appointmentTime));

        return NextResponse.json({ success: true, appointments: result });
    } catch (error) {
        console.error('Fetch therapist appointments error:', error);
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
