
import 'dotenv/config';
import { db } from '../config/db';
import { users, therapistProfiles } from '../config/schema';
import { hashPassword } from '../lib/auth'; // Ensure this path is correct relative to script execution or adjust
// import { v4 as uuidv4 } from 'uuid'; // Unused 
// Wait, lib/auth imports 'bcryptjs' which might not be compatible if I run this as a standalone script without nextjs env context properly if strictly tied to next.
// But db config uses process.env.DATABASE_URL. I need to make sure dotenv is loaded.

import { config } from 'dotenv';
config({ path: '.env' });

async function seed() {
    console.log('Seeding doctors...');

    const passwordHash = await import('bcryptjs').then(b => b.hash('password123', 10));

    const doctors = [
        {
            name: "Dr. Sanya Mishra",
            email: "sanya.m@neuranet.com",
            specialization: ["Anxiety", "Depression"],
            fee: 1500,
            image: "/avatars/doctor-1.png"
        },
        {
            name: "Dr. Jayesh Verma",
            email: "jayesh.v@neuranet.com",
            specialization: ["Trauma", "PTSD"],
            fee: 2000,
            image: "/avatars/doctor-2.png"
        },
        {
            name: "Dr. Esha Chopra",
            email: "esha.c@neuranet.com",
            specialization: ["Relationships", "Family Therapy"],
            fee: 1800,
            image: "/avatars/doctor-3.png"
        },
        {
            name: "Dr. Manish Reddy",
            email: "manish.r@neuranet.com",
            specialization: ["Stress Management", "Career Counseling"],
            fee: 1200,
            image: "/avatars/doctor-4.png"
        }
    ];

    for (const doc of doctors) {
        // 1. Create User
        // We use returning() to get the ID.
        const newUser = await db.insert(users).values({
            email: doc.email,
            passwordHash: passwordHash, // default password
            role: 'therapist',
            isOnboardingComplete: true
        }).returning({ id: users.id });

        const userId = newUser[0].id;

        // 2. Create Profile
        await db.insert(therapistProfiles).values({
            userId: userId,
            fullName: doc.name,
            mobileNumber: "1234567890",
            licenseNumber: "LIC-" + Math.floor(Math.random() * 10000),
            specializations: doc.specialization,
            perSessionFee: doc.fee,
            preferredSessionType: "Both",
            isVerified: true
        });

        console.log(`Created ${doc.name}`);
    }

    console.log('Seeding complete.');
    process.exit(0);
}

seed().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
