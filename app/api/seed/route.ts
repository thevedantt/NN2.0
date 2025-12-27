
import { NextResponse } from 'next/server';
import { db } from '@/config/db';
import { doctors } from '@/config/schema';
import { DOCTORS } from '@/data/doctors';

export async function POST() {
    try {
        console.log('🌱 Seeding doctors...');

        // Clear existing (optional, usually good for idempotent seeds if not referenced)
        // await db.delete(doctors); 

        const insertedDoctors = [];

        for (const doc of DOCTORS) {
            // Check if exists to avoid duplicates or FK issues if re-running
            // Simplified: Just insert new ones
            const result = await db.insert(doctors).values({
                doctorData: doc,
                isActive: true,
            }).returning({ doctorId: doctors.doctorId });

            insertedDoctors.push({ name: doc.name, newId: result[0].doctorId, oldId: doc.id });
        }

        return NextResponse.json({ success: true, insertedDoctors });
    } catch (error) {
        console.error('Seeding error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
