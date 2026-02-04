import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DayContent, DayType } from '../../types';
import { saveConfession } from '../../services/storage';
import LockedDayScreen from '../../components/LockedDayScreen';
import PreviewModeBanner from '../../components/PreviewModeBanner';
import { isDayUnlocked, getTimeUntilUnlock, formatTimeRemaining } from '../../utils/dateLock';
import DayPreloader from '../../components/DayPreloader';

import InteractiveQuiz from '../../components/InteractiveQuiz';

const HUG_QUIZ = [
  { q: "Kya tumhe tight hugs pasand hain? 🫂", options: ["Bahut jyada! ❤️", "Saans ruk jati hai! 😂"] as [string, string] },
  { q: "Kya main huggable hu? 🧸", options: ["Bilkul! ☁️", "Sochna padega... 🌵"] as [string, string] }
];

const HUG_TYPES = [
  { id: 'tight', label: 'Tight Hug 🫂', desc: "Jisme saans atak jaye!" },
  { id: 'warm', label: 'Warm Hug ☀️', desc: "Sukoon wala..." },
  { id: 'bear', label: 'Bear Hug 🐻', desc: "Haddiya todne wala!" },
  { id: 'long', label: 'Long Hug ⏳', desc: "Bas chhodna mat..." }
];

const HugDay: React.FC<{ data: DayContent; partnerName: string; isActive: boolean }> = ({ data, partnerName, isActive }) => {
  const { userId } = useParams<{ userId: string }>();

  // Lock state
  const [isLocked, setIsLocked] = useState(!isDayUnlocked(DayType.HUG, isActive));
  const [timeRemaining, setTimeRemaining] = useState(getTimeUntilUnlock(DayType.HUG, isActive));
  const [isLoading, setIsLoading] = useState(true);

  /* STATE MANAGEMENT */
  const [stage, setStage] = useState<'type_select' | 'hugging' | 'feeling' | 'quiz' | 'finale'>('type_select');
  const [selectedHug, setSelectedHug] = useState<string | null>(null);

  // Hugging Logic
  const [fill, setFill] = useState(0);
  const [isHugging, setIsHugging] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [quizLog, setQuizLog] = useState<string[]>([]);

  // Check lock status periodically
  useEffect(() => {
    setIsLocked(!isDayUnlocked(DayType.HUG, isActive));
    setTimeRemaining(getTimeUntilUnlock(DayType.HUG, isActive));
    const interval = setInterval(() => {
      const unlocked = isDayUnlocked(DayType.HUG, isActive);
      setIsLocked(!unlocked);
      if (!unlocked) setTimeRemaining(getTimeUntilUnlock(DayType.HUG, isActive));
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  // LONG PRESS LOGIC
  const startHug = () => {
    setIsHugging(true);
    intervalRef.current = setInterval(() => {
      setFill((prev) => {
        if (prev >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          handleHugComplete();
          return 100;
        }
        return prev + 3;
      });
    }, 40);
  };

  const stopHug = () => {
    setIsHugging(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleHugComplete = () => {
    setIsHugging(false);
    setTimeout(() => setStage('feeling'), 500);
  };

  const handleFinish = async (answers?: string[]) => {
    if (userId) {
      const finalLog = answers || quizLog;
      const log = `Hug Day Activity Log: ${finalLog.join(', ')} | Selected Hug: ${selectedHug} (HUG DAY COMPLETED)`;
      await saveConfession(userId, log, DayType.HUG);
    }
    setStage('finale');
  };

  // 1. Show Preloader First
  if (isLoading) {
    return <DayPreloader day={DayType.HUG} onFinish={() => setIsLoading(false)} />;
  }

  // 2. Show locked screen if day is locked
  if (isLocked) {
    return (
      <LockedDayScreen
        day={DayType.HUG}
        dayTitle="Hug Day 🤗"
        timeRemaining={timeRemaining}
        onUnlock={() => setIsLocked(false)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-10 p-6 overflow-x-hidden relative bg-pink-50">
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute text-5xl animate-float" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDelay: `${i}s` }}>🤗</div>
        ))}
      </div>

      <h1 className="text-4xl font-hand font-bold text-pink-600 mb-2 drop-shadow-sm z-20">Hug Day 🤗</h1>

      {/* STAGE 1: HUG TYPE SELECTION */}
      {
        stage === 'type_select' && (
          <div className="w-full max-w-md animate-fade-in-up z-20">
            <p className="text-gray-600 mb-8 text-center italic">"{data.message}"</p>
            <h3 className="text-center font-bold text-pink-800 mb-6 uppercase tracking-widest">Kaisa Hug Chahiye? 👇</h3>

            <div className="grid grid-cols-2 gap-4">
              {HUG_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => { setSelectedHug(type.label); setStage('hugging'); }}
                  className="glass-card p-4 rounded-xl hover:scale-105 transition-transform border border-pink-100 bg-white/60 active:bg-pink-100"
                >
                  <div className="text-lg font-bold text-pink-700">{type.label}</div>
                  <div className="text-xs text-gray-500">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )
      }

      {/* STAGE 2: INTERACTIVE HUGGING */}
      {
        stage === 'hugging' && (
          <div className="w-full max-w-xs flex flex-col items-center mb-8 relative animate-zoom-in z-20">
            <h3 className="text-pink-800 font-bold mb-4">Kas ke pakad lo! 🫂</h3>
            <div className="relative w-56 h-56 flex items-center justify-center mb-6">
              {/* Base Heart */}
              <svg viewBox="0 0 24 24" className="w-full h-full text-pink-100 fill-current absolute drop-shadow-sm">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              {/* Filling Heart */}
              <div className="absolute inset-0 flex items-end justify-center overflow-hidden" style={{ clipPath: `inset(${100 - fill}% 0 0 0)` }}>
                <svg viewBox="0 0 24 24" className="w-56 h-56 text-pink-500 fill-current">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <div className="absolute text-2xl font-bold text-white drop-shadow-lg pointer-events-none">
                {fill}%
              </div>
            </div>

            <button
              onMouseDown={startHug}
              onMouseUp={stopHug}
              onMouseLeave={stopHug}
              onTouchStart={(e) => { e.preventDefault(); startHug(); }}
              onTouchEnd={stopHug}
              className={`w-full py-4 rounded-xl font-bold shadow-xl transition-all active:scale-95 touch-none select-none ${isHugging ? 'bg-pink-600 scale-95 ring-4 ring-pink-200' : 'bg-gradient-to-r from-pink-500 to-rose-500'} text-white text-xl`}
            >
              {isHugging ? 'Sending Hug... 💖' : 'Hold to Hug me! 👆'}
            </button>
          </div>
        )
      }

      {/* STAGE 3: FEELING CHECK */}
      {
        stage === 'feeling' && (
          <div className="w-full max-w-sm animate-fade-in text-center z-20">
            <span className="text-6xl mb-4 block">😌</span>
            <h3 className="text-2xl font-bold text-pink-800 mb-6">Kaisa laga Virtual Hug?</h3>
            <div className="flex flex-col gap-3">
              <button onClick={() => setStage('quiz')} className="bg-white border-2 border-pink-200 text-pink-700 py-3 rounded-xl font-bold hover:bg-pink-50">
                Bahut Sukoon mila! 🌸
              </button>
              <button onClick={() => setStage('quiz')} className="bg-white border-2 border-pink-200 text-pink-700 py-3 rounded-xl font-bold hover:bg-pink-50">
                Ek aur chahiye! 🫂
              </button>
            </div>
          </div>
        )
      }

      {/* STAGE 4: QUIZ */}
      {
        stage === 'quiz' && (
          <InteractiveQuiz
            questions={HUG_QUIZ}
            title="Hug Talks... 💬"
            themeColor="pink"
            onComplete={handleFinish}
          />
        )
      }

      {/* STAGE 5: FINALE (KISS DAY WAITING) */}
      {
        stage === 'finale' && (
          <div className="w-full max-w-sm animate-zoom-in mt-10 text-center mx-auto">
            <div className="bg-white/40 backdrop-blur-lg p-8 rounded-[3rem] shadow-2xl border border-white/60 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-pink-50/50 to-transparent"></div>

              <span className="text-7xl block mb-4 animate-bounce-slow">🤗❤️</span>

              <h2 className="text-3xl font-hand font-bold text-pink-800 mb-2 drop-shadow-sm">Thank You!</h2>

              <p className="text-gray-700 mb-6 text-lg font-medium leading-relaxed">
                "Itne pyaare hug ke liye... <br />
                **Dil se Thank You!** ✨"
              </p>

              <div className="w-full h-px bg-pink-200/50 my-6"></div>

              <h3 className="text-xl font-bold text-pink-900 mb-2">Kal ke liye... 🤫</h3>
              <p className="text-gray-600 mb-8 text-md italic">
                "Main kal ke liye **Bahut Excited** hu! <br />
                Bas thoda sa intezaar... kuch bahut special aane wala hai! 🙈"
              </p>

              <div className="inline-block bg-white/60 px-6 py-2 rounded-full text-sm font-bold text-pink-800 tracking-widest uppercase border border-pink-200 shadow-sm animate-pulse">
                SURPRISE LOADING... ⏳
              </div>
            </div>
          </div>
        )
      }

    </div >
  );
};

export default HugDay;
