import React, { useEffect, useState } from 'react';
import { DayType } from '../types';
import TypewriterText from './TypewriterText';

const PRELOAD_DATA: Record<DayType, { text: string; icon: string; color: string }> = {
    [DayType.ROSE]: {
        text: "Ek khoobsurat shuruwat loading... ✨", // A beautiful beginning loading...
        icon: "✨",
        color: "bg-rose-50 text-rose-600"
    },
    [DayType.PROPOSE]: {
        text: "Dil tham ke baithiye, kuch khaas aa raha hai... 🤫", // Hold your heart, something special is coming...
        icon: "🤫",
        color: "bg-pink-50 text-pink-600"
    },
    [DayType.CHOCOLATE]: {
        text: "Zindagi me thodi mithas ghulne wali hai... 🍫", // Some sweetness is about to dissolve in life...
        icon: "🍫",
        color: "bg-amber-50 text-amber-800"
    },
    [DayType.TEDDY]: {
        text: "Duniya ki sabse cute cheez... bas thodi der me! 🙈", // World's cutest thing... just in a while!
        icon: "🙈",
        color: "bg-orange-50 text-orange-600"
    },
    [DayType.PROMISE]: {
        text: "Ek anokha wada, jo hamesha yaad rahega... 🤞", // A unique promise...
        icon: "🤝",
        color: "bg-blue-50 text-blue-600"
    },
    [DayType.HUG]: {
        text: "Sukoon ka ehsaas... loading... 🍃", // Feeling of peace... loading...
        icon: "🍃",
        color: "bg-pink-50 text-pink-600"
    },
    [DayType.KISS]: {
        text: "Nazdikiyaan badh rahi hain... ❤️", // Closeness is increasing...
        icon: "❤️",
        color: "bg-red-50 text-red-600"
    },
    [DayType.VALENTINE]: {
        text: "Wo pal jiska intezaar tha... 😍", // The moment you were waiting for...
        icon: "💘",
        color: "bg-rose-100 text-rose-700"
    },
    [DayType.WAITING]: {
        text: "Sabar ka phal meetha hota hai...",
        icon: "⏳",
        color: "bg-gray-50 text-gray-600"
    },
    [DayType.FINISHED]: {
        text: "Yaadein save ho rahi hain...",
        icon: "💾",
        color: "bg-purple-50 text-purple-600"
    }
};

interface DayPreloaderProps {
    day: DayType;
    onFinish?: () => void;
}

const DayPreloader: React.FC<DayPreloaderProps> = ({ day, onFinish }) => {
    const [visible, setVisible] = useState(true);
    const [fading, setFading] = useState(false);

    const onFinishRef = React.useRef(onFinish);

    useEffect(() => {
        onFinishRef.current = onFinish;
    }, [onFinish]);

    useEffect(() => {
        // Start fade out after 4.5 seconds (so total is 5s)
        const timer1 = setTimeout(() => {
            setFading(true);
        }, 4500);

        // Remove from DOM after 5 seconds
        const timer2 = setTimeout(() => {
            setVisible(false);
            if (onFinishRef.current) {
                onFinishRef.current();
            }
        }, 5000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    if (!visible) return null;

    const config = PRELOAD_DATA[day] || PRELOAD_DATA[DayType.WAITING];

    return (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'} ${config.color}`}>
            <div className="text-8xl animate-bounce mb-6 filter drop-shadow-md">
                {config.icon}
            </div>
            <p className="text-xl md:text-2xl font-hand font-bold text-center px-6 leading-relaxed flex items-center justify-center min-h-[3rem]">
                "<TypewriterText text={config.text} speed={75} />"
            </p>

            {/* Loading Dots */}
            <div className="flex gap-2 mt-8">
                <div className="w-3 h-3 rounded-full bg-current opacity-75 animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-3 h-3 rounded-full bg-current opacity-75 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 rounded-full bg-current opacity-75 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
        </div>
    );
};

export default DayPreloader;
