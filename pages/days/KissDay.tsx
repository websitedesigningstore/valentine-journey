import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DayContent, DayType } from '../../types';
import { saveConfession } from '../../services/storage';
import LockedDayScreen from '../../components/LockedDayScreen';
import PreviewModeBanner from '../../components/PreviewModeBanner';
import { isDayUnlocked, getTimeUntilUnlock, formatTimeRemaining } from '../../utils/dateLock';
import DayPreloader from '../../components/DayPreloader';

import InteractiveQuiz from '../../components/InteractiveQuiz';

const KISS_QUIZ = [
  { q: "Kya main tumhe kiss kar sakta hu? 💋", options: ["Ha, Bilkul! 😘", "Sirf Forehead pe! 😇"] as [string, string] },
  { q: "Tumhe kaisi kiss pasand hai? 🙈", options: ["Soft & Slow 🌸", "Quick & Cute 😉"] as [string, string] }
];

const KissDay: React.FC<{ data: DayContent; partnerName: string; isActive: boolean }> = ({ data, partnerName, isActive }) => {
  const { userId } = useParams<{ userId: string }>();

  // Lock state
  const [isLocked, setIsLocked] = useState(!isDayUnlocked(DayType.KISS, isActive));
  const [timeRemaining, setTimeRemaining] = useState(getTimeUntilUnlock(DayType.KISS, isActive));
  const [isLoading, setIsLoading] = useState(true);

  const [kissCount, setKissCount] = useState(0);
  const [quizLog, setQuizLog] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [kisses, setKisses] = useState<{ id: number, x: number, y: number }[]>([]);

  // Check lock status periodically
  useEffect(() => {
    setIsLocked(!isDayUnlocked(DayType.KISS, isActive));
    setTimeRemaining(getTimeUntilUnlock(DayType.KISS, isActive));
    const interval = setInterval(() => {
      const unlocked = isDayUnlocked(DayType.KISS, isActive);
      setIsLocked(!unlocked);
      if (!unlocked) setTimeRemaining(getTimeUntilUnlock(DayType.KISS, isActive));
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  const addKiss = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const newKiss = { id: Date.now(), x: clientX, y: clientY };
    setKisses(prev => [...prev, newKiss]);
    setKissCount(prev => prev + 1);

    // Remove kiss icon after animation
    setTimeout(() => {
      setKisses(prev => prev.filter(k => k.id !== newKiss.id));
    }, 1000);
  };

  const handleFinish = async (answers?: string[]) => {
    setIsFinished(true);
    if (userId) {
      const finalLog = answers || quizLog;
      const log = `Kiss Day Activity Log: ${finalLog.join(', ')} | Sent ${kissCount} Kisses! (KISS DAY COMPLETED)`;
      await saveConfession(userId, log, DayType.KISS);
    }
  };

  // 1. Show Preloader First
  if (isLoading) {
    return <DayPreloader day={DayType.KISS} onFinish={() => setIsLoading(false)} />;
  }

  // 2. Show locked screen if day is locked
  if (isLocked) {
    return (
      <LockedDayScreen
        day={DayType.KISS}
        dayTitle="Kiss Day 💋"
        timeRemaining={timeRemaining}
        onUnlock={() => setIsLocked(false)}
      />
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start pt-10 p-6 overflow-hidden relative bg-red-50/50 touch-none"
      onClick={addKiss}
    >
      <h1 className="text-4xl font-hand font-bold text-red-600 mb-2 drop-shadow-sm z-20 pointer-events-none select-none">Kiss Day 💋</h1>
      <p className="text-gray-600 mb-8 z-20 text-center italic pointer-events-none select-none">"{data.message}"</p>

      {/* FLOATING KISSES CONTAINER */}
      {kisses.map(kiss => (
        <div
          key={kiss.id}
          className="fixed text-4xl pointer-events-none animate-ping-slow"
          style={{ left: kiss.x - 20, top: kiss.y - 20, opacity: 0.8 }}
        >
          💋
        </div>
      ))}

      {/* MAIN INTERACTION */}
      <div className="w-full max-w-sm flex flex-col items-center z-30" onClick={e => e.stopPropagation()}>

        {!isFinished ? (
          <>
            <div className="bg-white/80 backdrop-blur glass-card p-6 rounded-2xl w-full border border-red-200 text-center mb-8 shadow-xl">
              <div className="text-8xl mb-4 animate-bounce hover:scale-110 transition-transform cursor-pointer filter drop-shadow-md" onClick={(e) => addKiss(e as any)}>💋</div>
              <p className="font-bold text-red-800 text-lg">Screen pe tap karke dher saari Kisses bhejo! 👇</p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="bg-red-100 text-red-600 px-4 py-1 rounded-full font-bold shadow-inner">Count: {kissCount}</div>
              </div>
            </div>

            <InteractiveQuiz
              questions={KISS_QUIZ}
              title="Romantic Talks... 💬"
              themeColor="red"
              onComplete={(answers) => handleFinish(answers)}
            />
          </>
        ) : (
          /* GRAND FINALE CARD */
          <div className="w-full animate-zoom-in mt-4 text-center">
            <div className="bg-gradient-to-br from-red-600 to-rose-700 p-8 rounded-[2rem] shadow-2xl border-4 border-red-300/50 relative overflow-hidden text-white">

              {/* Sparkle effects */}
              <div className="absolute top-0 left-0 w-full h-full opacity-30">
                <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full animate-ping"></div>
                <div className="absolute bottom-10 right-10 w-3 h-3 bg-white rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
              </div>

              <h2 className="text-4xl font-hand font-bold mb-4 drop-shadow-lg">Woohooo! 🎉</h2>
              <p className="text-red-100 text-xl font-medium mb-6">
                {kissCount > 0 ? `Tumne ${kissCount} kisses bheje! 😘` : "Kisses bhejna bhul gaye? Koi nahi! 😉"}
              </p>

              <div className="bg-white/20 backdrop-blur p-4 rounded-xl border border-white/20 mb-6">
                <p className="text-white text-lg italic">
                  "Ab dil tham ke baitho... Kyunki kal ka din <br />**SABSE KHAAS** hai! ❤️"
                </p>
              </div>

              <div className="animate-bounce">
                <span className="text-6xl filter drop-shadow-lg">🌹💍✨</span>
              </div>

              <div className="mt-8">
                <div className="inline-block bg-white text-red-600 px-6 py-3 rounded-full font-bold tracking-widest uppercase shadow-lg transform hover:scale-105 transition-transform">
                  THE BIG DAY IS COMING ⏳
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KissDay;
