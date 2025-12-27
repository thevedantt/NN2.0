"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Doctor } from '@/data/doctors';

type BookingStep = 'view' | 'confirm' | 'success';

interface AppointmentContextType {
    selectedDoctor: Doctor | null;
    setSelectedDoctor: (doctor: Doctor | null) => void;
    selectedDate: Date | undefined;
    setSelectedDate: (date: Date | undefined) => void;
    selectedTime: string | null;
    setSelectedTime: (time: string | null) => void;
    bookingStep: BookingStep;
    setBookingStep: (step: BookingStep) => void;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export function AppointmentProvider({ children }: { children: ReactNode }) {
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [bookingStep, setBookingStep] = useState<BookingStep>('view');

    return (
        <AppointmentContext.Provider value={{
            selectedDoctor,
            setSelectedDoctor,
            selectedDate,
            setSelectedDate,
            selectedTime,
            setSelectedTime,
            bookingStep,
            setBookingStep
        }}>
            {children}
        </AppointmentContext.Provider>
    );
}

export function useAppointment() {
    const context = useContext(AppointmentContext);
    if (context === undefined) {
        throw new Error('useAppointment must be used within an AppointmentProvider');
    }
    return context;
}
