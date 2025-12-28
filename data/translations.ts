
export const translations = {
    en: {
        // Dashboard Header
        greeting: "Good Morning, Vedant!",
        greeting_subtitle: "Here's your wellness overview.",
        search_placeholder: "Search...",

        // Quick Actions
        qa_title: "Quick Actions",
        qa_ai_companion: "Start AI Companion",
        qa_assessment: "Take Assessment",
        qa_join_group: "Join Group",
        qa_book_therapist: "Book Therapist",

        // Mood Chart
        mood_title: "Mood Tracker",
        mood_subtitle: "Your emotional journey over the last 7 days",

        // Streak Card
        streak_title: "Current Streak",
        streak_subtitle: "Daily Check-in",
        streak_keep_it_up: "Keep it up!",

        // Upcoming Appointments
        appt_title: "Upcoming Appointments",
        appt_subtitle: "Manage your sessions and events",
        appt_loading: "Loading...",
        appt_unknown_doctor: "Unknown Doctor",
        appt_upcoming: "Upcoming",
        appt_no_upcoming: "No upcoming sessions",
        appt_book_start: "Book a session to get started.",
        appt_wellness_circle: "Wellness Circle",
        appt_group_meditation: "Group Meditation",
        appt_completed: "Completed",
        appt_view_schedule: "View Full Schedule",

        // Progress Indicators
        progress_mental: "Mental Wellness",
        progress_meditation: "Meditation Goal",

        // Sidebar / Navigation (If needed later)
        nav_dashboard: "Dashboard",
        nav_appointments: "Appointments",
        nav_journal: "Journal",

        // Common
        loading: "Loading...",
    },
    hi: {
        // Dashboard Header
        greeting: "शुभ प्रभात, वेदांत!",
        greeting_subtitle: "यहाँ आपकी स्वास्थ्य झलक है।",
        search_placeholder: "खोजें...",

        // Quick Actions
        qa_title: "त्वरित कार्य",
        qa_ai_companion: "AI साथी शुरू करें",
        qa_assessment: "मूल्यांकन लें",
        qa_join_group: "समूह में शामिल हों",
        qa_book_therapist: "थेरेपिस्ट बुक करें",

        // Mood Chart
        mood_title: "मूड ट्रैकर",
        mood_subtitle: "पिछले 7 दिनों की अपनी भावनात्मक यात्रा",

        // Streak Card
        streak_title: "वर्तमान स्ट्रीक",
        streak_subtitle: "दैनिक चेक-इन",
        streak_keep_it_up: "इसे जारी रखें!",

        // Upcoming Appointments
        appt_title: "आगामी अपॉइंटमेंट्स",
        appt_subtitle: "अपने सत्र और कार्यक्रम प्रबंधित करें",
        appt_loading: "लोड हो रहा है...",
        appt_unknown_doctor: "अज्ञात डॉक्टर",
        appt_upcoming: "आगामी",
        appt_no_upcoming: "कोई आगामी सत्र नहीं",
        appt_book_start: "शुरू करने के लिए एक सत्र बुक करें।",
        appt_wellness_circle: "वेलनेस सर्कल",
        appt_group_meditation: "समूह ध्यान",
        appt_completed: "पूर्ण",
        appt_view_schedule: "पूरा शेड्यूल देखें",

        // Progress Indicators
        progress_mental: "मानसिक कल्याण",
        progress_meditation: "ध्यान लक्ष्य",

        // Sidebar / Navigation
        nav_dashboard: "डैशबोर्ड",
        nav_appointments: "अपॉइंटमेंट्स",
        nav_journal: "जर्नल",

        // Common
        loading: "लोड हो रहा है...",
    }
};

export type Language = 'en' | 'hi';
export type TranslationKey = keyof typeof translations.en;
