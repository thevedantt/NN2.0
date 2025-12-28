
import { NextResponse } from 'next/server';
import { db } from '@/config/db';
import { doctors, appointments } from '@/config/schema';
import { sql, eq } from 'drizzle-orm';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { doctor, userId = "user_123", date, time } = body; // default mock user

        console.log('📝 Received Booking Request:', body);

        if (!doctor || !doctor.name) {
            return NextResponse.json({ error: 'Invalid doctor data' }, { status: 400 });
        }

        // 1️⃣ Find or Create Doctor (Upsert Logic)
        // We search by name within the JSON blob.
        // Note: In a real app, we'd use a robust ID or specific column.
        const existingDoctors = await db.select().from(doctors)
            .where(sql`doctor_data->>'name' = ${doctor.name}`)
            .limit(1);

        let finalDoctorId: number;

        if (existingDoctors.length > 0) {
            finalDoctorId = existingDoctors[0].doctorId;
            console.log('✅ Found existing doctor ID:', finalDoctorId);
        } else {
            console.log('➕ Registering new doctor in DB:', doctor.name);
            const newDoc = await db.insert(doctors).values({
                doctorData: doctor,
                isActive: true,
            }).returning({ doctorId: doctors.doctorId });
            finalDoctorId = newDoc[0].doctorId;
            console.log('✅ Created new doctor ID:', finalDoctorId);
        }

        // 2️⃣ Create Appointment
        const newAppointment = await db.insert(appointments).values({
            userId: userId,
            doctorId: String(finalDoctorId),
            doctorSnapshot: doctor,
            appointmentDate: new Date().toISOString().split('T')[0], // Mock date if missing: today
            appointmentTime: time || "10:00 AM", // Mock time if missing
            sessionType: 'Video Consultation',
            price: 1500, // Default price
            status: 'scheduled',
        }).returning({ appointmentId: appointments.appointmentId });

        console.log('🎉 Appointment Created:', newAppointment[0]);

        return NextResponse.json({
            success: true,
            appointmentId: newAppointment[0].appointmentId,
            doctorId: finalDoctorId
        });

    } catch (error: any) {
        console.error('❌ Booking Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
