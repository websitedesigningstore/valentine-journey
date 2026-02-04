import React, { useState } from 'react';

export interface Question {
    q: string;
    options?: [string, string]; // Limit to 2 for simplicity
}

interface InteractiveQuizProps {
    questions: Question[];
    title?: string;
    onComplete: (answers: string[]) => void;
    themeColor?: 'rose' | 'amber' | 'blue' | 'pink' | 'red' | 'orange' | 'purple';
}

const THEMES = {
    rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-800', bar: 'bg-rose-500', btn: 'from-rose-500 to-rose-600' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', bar: 'bg-amber-500', btn: 'from-amber-500 to-amber-600' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', bar: 'bg-blue-500', btn: 'from-blue-500 to-blue-600' },
    pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-800', bar: 'bg-pink-500', btn: 'from-pink-500 to-pink-600' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', bar: 'bg-red-600', btn: 'from-red-600 to-red-700' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', bar: 'bg-orange-500', btn: 'from-orange-500 to-orange-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', bar: 'bg-purple-500', btn: 'from-purple-500 to-purple-600' },
};

const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({ questions, title = "Quick Quiz!", onComplete, themeColor = 'rose' }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);

    const theme = THEMES[themeColor] || THEMES.rose;

    const handleAnswer = (ans: string) => {
        const newAnswers = [...answers, `Q${currentIndex + 1}: ${ans}`];
        setAnswers(newAnswers);
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onComplete(newAnswers);
        }
    };

    const currentQ = questions[currentIndex];
    const options = currentQ.options || ["YES ❤️", "NO 💔"];
    const width = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className={`glass-card p-6 rounded-2xl border ${theme.border} shadow-xl bg-white/90 text-center relative overflow-hidden w-full max-w-md mx-auto animate-fade-in-up`}>
            {/* Progress Bar */}
            <div className={`absolute top-0 left-0 h-2 ${theme.bar} transition-all duration-300`} style={{ width: `${width}%` }}></div>

            <h3 className={`text-sm font-bold ${theme.text} mb-6 uppercase tracking-wider mt-4`}>{title}</h3>

            <h2 className="text-2xl font-hand font-bold text-gray-800 mb-8 leading-snug min-h-[80px] flex items-center justify-center">
                {currentQ.q}
            </h2>

            <div className="flex gap-4">
                <button
                    onClick={() => handleAnswer(options[0])}
                    className={`flex-1 bg-gradient-to-r ${theme.btn} text-white py-4 rounded-xl font-bold text-xl shadow-lg hover:scale-105 transition-transform active:scale-95`}
                >
                    {options[0]}
                </button>
                <button
                    onClick={() => handleAnswer(options[1])}
                    className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-xl font-bold text-xl shadow hover:bg-gray-200 transition-colors active:scale-95"
                >
                    {options[1]}
                </button>
            </div>
        </div>
    );
};

export default InteractiveQuiz;
