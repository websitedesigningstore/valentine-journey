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
  { q: "Do you like tight hugs? 🫂", options: ["Love them! ❤️", "Choking hazard! 😂"] as [string, string] },
  { q: "Am I huggable? 🧸", options: ["Very! ☁️", "Not really... 🌵"] as [string, string] }
];

const HugDay: React.FC<{ data: DayContent; partnerName: string; isActive: boolean }> = ({ data, partnerName, isActive }) => {
  const { userId } = useParams<{ userId: string }>();

  // Lock state
  const [isLocked, setIsLocked] = useState(!isDayUnlocked(DayType.HUG, isActive));
  const [timeRemaining, setTimeRemaining] = useState(getTimeUntilUnlock(DayType.HUG, isActive));
  const [isLoading, setIsLoading] = useState(true);

  const [fill, setFill] = useState(0);
  const [isHugging, setIsHugging] = useState(false);
  const [hugComplete, setHugComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [quizLog, setQuizLog] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  // Check lock status periodically
  useEffect(() => {
    // Initial Check
    setIsLocked(!isDayUnlocked(DayType.HUG, isActive));
    setTimeRemaining(getTimeUntilUnlock(DayType.HUG, isActive));

    const interval = setInterval(() => {
      const unlocked = isDayUnlocked(DayType.HUG, isActive);
      setIsLocked(!unlocked);
      if (!unlocked) {
        setTimeRemaining(getTimeUntilUnlock(DayType.HUG, isActive));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  // LONG PRESS LOGIC
  const startHug = () => {
    if (hugComplete || isFinished) return;
    setIsHugging(true);
    intervalRef.current = setInterval(() => {
      setFill((prev) => {
        if (prev >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setHugComplete(true);
          return 100;
        }
        return prev + 2; // Speed of fill
      });
    }, 50);
  };

  const stopHug = () => {
    if (hugComplete || isFinished) return;
    setIsHugging(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleFinish = async (answers?: string[]) => {
    setIsFinished(true);
    if (userId) {
      const finalLog = answers || quizLog;
      const log = `Hug Day Activity Log: ${finalLog.join(', ')} | Sent a Virtual Hug! (HUG DAY COMPLETED)`;
      await saveConfession(userId, log, DayType.HUG);
    }

    // Redirect to next day (Kiss Day)
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

  // Mobile Touch Support
  const handleTouchStart = (e: React.TouchEvent) => { e.preventDefault(); startHug(); };
  const handleTouchEnd = () => stopHug();

  // intervalRef cleanup is inside the component logic, but let's ensure one useEffect handles unmount
  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

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
    <>
      <div className="min-h-screen flex flex-col items-center justify-start pt-10 p-6 overflow-x-hidden relative bg-pink-50/50" >
        <h1 className="text-4xl font-hand font-bold text-pink-600 mb-2 drop-shadow-sm z-20">Hug Day 🤗</h1>
        <p className="text-gray-600 mb-8 z-20 text-center italic">"{data.message}"</p>

        {/* INTERACTION: HUG METER */}
        <div className="w-full max-w-xs flex flex-col items-center mb-8 relative">
          <div className="relative w-48 h-48 flex items-center justify-center mb-4">
            {/* Background Heart */}
            <svg viewBox="0 0 24 24" className="w-full h-full text-gray-200 fill-current absolute">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>

            {/* Foreground Heart (Clipped by height) */}
            <div className="absolute inset-0 flex items-end justify-center overflow-hidden" style={{ clipPath: `inset(${100 - fill}% 0 0 0)` }}>
              <svg viewBox="0 0 24 24" className="w-48 h-48 text-pink-500 fill-current">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>

            {/* Pulse Effect when complete */}
            {hugComplete && <div className="absolute inset-0 animate-ping rounded-full bg-pink-400 opacity-20"></div>}
          </div>

          {!hugComplete ? (
            <button
              onMouseDown={startHug}
              onMouseUp={stopHug}
              onMouseLeave={stopHug}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className={`w-full py-4 rounded-xl font-bold shadow-lg transition-transform active:scale-95 touch-none select-none ${isHugging ? 'bg-pink-600 scale-95' : 'bg-pink-500'} text-white`}
            >
              {isHugging ? 'Sending Warmth... 🔥' : 'Hold to Hug Me 🫂'}
            </button>
          ) : (
            <div className="text-center animate-bounce">
              <p className="text-pink-600 font-bold text-xl">Hug Received! ❤️</p>
            </div>
          )}
        </div>

        {/* Q&A SECTION */}
        {hugComplete && !isFinished && (
          <InteractiveQuiz
            questions={HUG_QUIZ}
            title="Hug Talks... 💬"
            themeColor="pink"
            onComplete={(answers) => handleFinish(answers)}
          />
        )}

        {isFinished && (
          <div className="text-center animate-pulse mt-6">
            <span className="text-4xl">💋</span>
            <p className="text-pink-800 font-bold mt-2">Loading Kisses...</p>
          </div>
        )}

      </div>
    </>
  );
};

export default HugDay;
