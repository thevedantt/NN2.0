"use client";

import { useLanguage } from "@/context/LanguageContext";
import { AlertCircle } from "lucide-react";

export function Disclaimer() {
    const { language } = useLanguage();

    const text = {
        en: (
            <>
                <p>PHQ-9 and GAD-7 are self-assessment tools for awareness only and do not provide a medical diagnosis.</p>
                <p>NeuroNet is not responsible for decisions made based on these results; please consult a qualified professional if needed.</p>
            </>
        ),
        hi: (
            <>
                <p>PHQ-9 और GAD-7 केवल आत्म-मूल्यांकन के लिए हैं और किसी बीमारी का निदान नहीं करते।</p>
                <p>NeuroNet केवल इन परिणामों पर लिए गए निर्णयों की जिम्मेदारी नहीं लेता; आवश्यकता होने पर विशेषज्ञ से सलाह लें।</p>
            </>
        )
    };

    return (
        <div className="mt-8 p-4 bg-muted/50 border border-border/50 rounded-lg flex gap-3 text-xs md:text-sm text-muted-foreground">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-muted-foreground" />
            <div className="space-y-1">
                {text[language as 'en' | 'hi'] || text.en}
            </div>
        </div>
    );
}
