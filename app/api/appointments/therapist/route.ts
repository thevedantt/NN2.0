import { NextResponse } from 'next/server';
import { db } from '@/config/db';
import { appointments, users, userProfiles } from '@/config/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(req: Request) {
    try {
        // In a real app, extract therapistId from the session/token.
        // For the MVP, we assume the therapist is viewing their own dashboard.
        // We need to fetch the therapist's user ID from a mock or parameter if needed,
        // but for now, we'll fetch all appointments to ensure the demo works if the ID matching is loose,
        // or filter by the exact mocked doctorId if they used the booking flow.

        // Actually, let's fetch ALL appointments for the demo therapist (we can sort by closest time)
        // because the patient might be booking with different mock doctors.
        // In a true app: .where(eq(appointments.doctorId, currentTherapistId))
        
        const result = await db.select({
            appointment: appointments,
            patientWallet: users.walletAddress,
            // Assuming patient profile data is in userProfiles, but we might just use the raw userId for display
        })
        .from(appointments)
        .leftJoin(users, eq(users.id, appointments.userId))
        .orderBy(desc(appointments.createdAt));

        return NextResponse.json({ success: true, appointments: result });
    } catch (error) {
        console.error('Fetch therapist appointments error:', error);
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
