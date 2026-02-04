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
  { q: "May I kiss you? 💋", options: ["Yes! 😘", "On forehead! 😇"] as [string, string] },
  { q: "Your favorite kiss spot? 🙈", options: ["Lips! 👄", "Cheek! 😊"] as [string, string] }
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
    // Initial
    setIsLocked(!isDayUnlocked(DayType.KISS, isActive));
    setTimeRemaining(getTimeUntilUnlock(DayType.KISS, isActive));

    const interval = setInterval(() => {
      const unlocked = isDayUnlocked(DayType.KISS, isActive);
      setIsLocked(!unlocked);
      if (!unlocked) {
        setTimeRemaining(getTimeUntilUnlock(DayType.KISS, isActive));
      }
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

    // Redirect to next day (Valentine Day)
    setTimeout(() => {
      const userPref = localStorage.getItem('user_mode_preference') || 'live';

      const baseUrl = window.location.href.split('?')[0].split('#')[0];
      let queryString = `?mode=${userPref}&nextDay=true`;

      const params = new URLSearchParams(window.location.hash.split('?')[1] || window.location.search);
      const simDateParam = params.get('simDate');
      if (simDateParam) {
        queryString += `&simDate=${simDateParam}`;
      }

      window.location.href = `${baseUrl}#/v/${userId}${queryString}`;
      window.location.reload();
    }, 2000);
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
    <>
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
          <div className="bg-white/80 backdrop-blur glass-card p-6 rounded-2xl w-full border border-red-200 text-center mb-8">
            <div className="text-8xl mb-4 animate-bounce hover:scale-110 transition-transform cursor-pointer" onClick={(e) => addKiss(e as any)}>💋</div>
            <p className="font-bold text-red-800">Tap anywhere to send kisses!</p>
            <p className="text-4xl font-bold text-red-600 mt-2">{kissCount}</p>
          </div>

          {/* Q&A SECTION */}
          {!isFinished && (
            <InteractiveQuiz
              questions={KISS_QUIZ}
              title="Romantic Talks... 💬"
              themeColor="red"
              onComplete={(answers) => handleFinish(answers)}
            />
          )}

          {isFinished && (
            <div className="text-center animate-pulse mt-6">
              <span className="text-4xl">❤️</span>
              <p className="text-red-800 font-bold mt-2">Entering Valentine's Day...</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default KissDay;
