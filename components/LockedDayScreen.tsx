import React from 'react';
import CountdownTimer from './CountdownTimer';
import FloatingHearts from './FloatingHearts';
import { DayType } from '../types';

interface LockedDayScreenProps {
    day: DayType;
    dayTitle: string;
    timeRemaining: number;
    onUnlock?: () => void;
}

const DAY_MESSAGES: Partial<Record<DayType, string>> = {
    [DayType.ROSE]: "Patience makes the heart grow fonder... 🌹",
    [DayType.PROPOSE]: "Good things come to those who wait... 💍",
    [DayType.CHOCOLATE]: "Sweet surprises are worth the wait... 🍫",
    [DayType.TEDDY]: "Cuddles are coming soon... 🧸",
    [DayType.PROMISE]: "A promise is being prepared... 🤝",
    [DayType.HUG]: "Warm hugs await you... 🤗",
    [DayType.KISS]: "Something special is almost here... 💋",
    [DayType.VALENTINE]: "The grand finale approaches... 💖"
};

const LockedDayScreen: React.FC<LockedDayScreenProps> = ({ day, dayTitle, timeRemaining, onUnlock }) => {
    const message = DAY_MESSAGES[day] || "Something special is waiting...";

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
            <FloatingHearts />

            <div className="relative z-10 w-full max-w-2xl bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/50">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4 animate-bounce-slow">🔒</div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent mb-4">
                        {dayTitle}
                    </h1>
                    <p className="text-gray-600 text-lg font-medium mb-2">
                        This special day unlocks in:
                    </p>
                </div>

                {/* Countdown Timer */}
                <div className="mb-8">
                    <CountdownTimer timeRemaining={timeRemaining} onComplete={onUnlock} />
                </div>

                {/* Message */}
                <div className="text-center">
                    <p className="text-gray-500 italic text-lg">
                        {message}
                    </p>
                </div>

                {/* Decorative Elements */}
                <div className="mt-8 flex justify-center gap-4 text-4xl opacity-50">
                    <span className="animate-pulse">💕</span>
                    <span className="animate-pulse delay-100">✨</span>
                    <span className="animate-pulse delay-200">💖</span>
                    <span className="animate-pulse delay-300">✨</span>
                    <span className="animate-pulse delay-400">💕</span>
                </div>
            </div>

            {/* Bottom hint */}
            <div className="absolute bottom-4 text-center text-gray-500 text-sm">
                <p>The wait will be worth it... 💫</p>
            </div>
        </div>
    );
};

export default LockedDayScreen;
