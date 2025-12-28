
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
    doctorId: varchar('doctor_id', { length: 50 }).notNull(), // Stores ID like "d1", "d4"
    doctorSnapshot: json('doctor_snapshot').notNull(), // Snapshot of doctor details at booking
    appointmentDate: date('appointment_date').notNull(),
    appointmentTime: varchar('appointment_time', { length: 50 }).notNull(),
    sessionType: varchar('session_type', { length: 50 }).default('Video Consultation').notNull(),
    price: integer('price').notNull(), // Stored in lowest currency unit or raw number
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

// 4️⃣ AI Chat Sessions
export const aiChatSessions = pgTable('ai_chat_sessions', {
    sessionId: serial('session_id').primaryKey(),
    userId: varchar('user_id', { length: 255 }).notNull(),
    language: varchar('language', { length: 10 }).default('en').notNull(),
    startedAt: timestamp('started_at').defaultNow().notNull(),
    endedAt: timestamp('ended_at'),
    summary: text('summary'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 5️⃣ AI Chat Messages
export const aiChatMessages = pgTable('ai_chat_messages', {
    messageId: serial('message_id').primaryKey(),
    sessionId: integer('session_id').references(() => aiChatSessions.sessionId).notNull(),
    sender: varchar('sender', { length: 20 }).notNull(), // 'user' | 'ai'
    messageText: text('message_text').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 6️⃣ AI Chat Insights
export const aiChatInsights = pgTable('ai_chat_insights', {
    insightId: serial('insight_id').primaryKey(),
    sessionId: integer('session_id').references(() => aiChatSessions.sessionId).notNull(),
    currentTopic: varchar('current_topic', { length: 255 }),
    emotionalTone: json('emotional_tone'), // e.g. { "Calmness": 75, "Anxiety": 10 }
    suggestionText: text('suggestion_text'),
    language: varchar('language', { length: 10 }).default('en'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
