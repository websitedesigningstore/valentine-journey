import React, { useState, useEffect } from 'react';
import { formatTimeRemaining } from '../utils/dateLock';

interface CountdownTimerProps {
    timeRemaining: number; // in milliseconds
    onComplete?: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ timeRemaining: initialTime, onComplete }) => {
    const [timeRemaining, setTimeRemaining] = useState(initialTime);

    useEffect(() => {
        setTimeRemaining(initialTime);
    }, [initialTime]);

    useEffect(() => {
        if (timeRemaining <= 0) {
            if (onComplete) {
                onComplete();
            }
            return;
        }

        const interval = setInterval(() => {
            setTimeRemaining(prev => {
                const newTime = prev - 1000;
                if (newTime <= 0) {
                    clearInterval(interval);
                    if (onComplete) {
                        onComplete();
                    }
                    return 0;
                }
                return newTime;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timeRemaining, onComplete]);

    const { days, hours, minutes, seconds } = formatTimeRemaining(timeRemaining);

    return (
        <div className="flex flex-col items-center justify-center space-y-6">
            <div className="flex gap-4 items-center justify-center flex-wrap">
                {days > 0 && (
                    <div className="flex flex-col items-center bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg min-w-[80px]">
                        <span className="text-4xl font-bold text-rose-600">{days}</span>
                        <span className="text-sm text-gray-600 font-medium">Days</span>
                    </div>
                )}

                <div className="flex flex-col items-center bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg min-w-[80px]">
                    <span className="text-4xl font-bold text-rose-600">{String(hours).padStart(2, '0')}</span>
                    <span className="text-sm text-gray-600 font-medium">Hours</span>
                </div>

                <div className="flex flex-col items-center bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg min-w-[80px]">
                    <span className="text-4xl font-bold text-rose-600">{String(minutes).padStart(2, '0')}</span>
                    <span className="text-sm text-gray-600 font-medium">Minutes</span>
                </div>

                <div className="flex flex-col items-center bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg min-w-[80px]">
                    <span className="text-4xl font-bold text-rose-600">{String(seconds).padStart(2, '0')}</span>
                    <span className="text-sm text-gray-600 font-medium">Seconds</span>
                </div>
            </div>
        </div>
    );
};

export default CountdownTimer;
