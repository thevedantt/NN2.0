
import { pgTable, serial, text, timestamp, json, boolean, varchar, integer, date } from 'drizzle-orm/pg-core';

// 1️⃣ Doctors Table
export const doctors = pgTable('doctors', {
    doctorId: serial('doctor_id').primaryKey(),
    doctorData: json('doctor_data').notNull(), // Stores name, image, specialization, etc.
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2️⃣ Appointments Table
export const appointments = pgTable('appointments', {
    appointmentId: serial('appointment_id').primaryKey(),
    userId: varchar('user_id', { length: 255 }).notNull(), // References User (External Auth ID)
    doctorId: integer('doctor_id').references(() => doctors.doctorId).notNull(),
    doctorSnapshot: json('doctor_snapshot').notNull(), // Snapshot of doctor details at booking
    appointmentDate: date('appointment_date').notNull(),
    appointmentTime: varchar('appointment_time', { length: 50 }).notNull(),
    status: varchar('status', { length: 20 }).default('scheduled').notNull(), // scheduled, completed, cancelled, rescheduled
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});

// 3️⃣ User Profiles Table
export const userProfiles = pgTable('user_profiles', {
    profileId: serial('profile_id').primaryKey(),
    userId: varchar('user_id', { length: 255 }).notNull().unique(), // References User (External Auth ID)
    gender: varchar('gender', { length: 50 }),
    preferredLanguage: varchar('preferred_language', { length: 50 }),
    primaryConcern: varchar('primary_concern', { length: 100 }),
    therapyPreference: varchar('therapy_preference', { length: 50 }),
    previousExperience: varchar('previous_experience', { length: 50 }),
    sleepPattern: varchar('sleep_pattern', { length: 50 }),
    supportSystem: varchar('support_system', { length: 50 }),
    stressLevel: varchar('stress_level', { length: 50 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});
