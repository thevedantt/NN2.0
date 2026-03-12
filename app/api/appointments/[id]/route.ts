import { NextResponse } from 'next/server';
import { db } from '@/config/db';
import { appointments } from '@/config/schema';
import { eq } from 'drizzle-orm';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const body = await req.json();
        const { meetLink, status } = body;

        const appointmentId = parseInt(params.id);

        if (isNaN(appointmentId)) {
            return NextResponse.json({ error: "Invalid appointment ID" }, { status: 400 });
        }

        const updates: any = {};
        if (meetLink !== undefined) updates.meetLink = meetLink;
        if (status !== undefined) updates.status = status;

        const result = await db.update(appointments)
            .set(updates)
            .where(eq(appointments.appointmentId, appointmentId))
            .returning();

        return NextResponse.json({ success: true, appointment: result[0] });
    } catch (error) {
        console.error('Update appointment error:', error);
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
}
