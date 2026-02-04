import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DayContent, DayType } from '../../types';
import { saveConfession } from '../../services/storage';
import LockedDayScreen from '../../components/LockedDayScreen';
import PreviewModeBanner from '../../components/PreviewModeBanner';
import { isDayUnlocked, getTimeUntilUnlock, formatTimeRemaining } from '../../utils/dateLock';
import DayPreloader from '../../components/DayPreloader';

import InteractiveQuiz from '../../components/InteractiveQuiz';

const TEDDY_QUIZ = [
  { q: "Am I your softest pillow? 🧸", options: ["Always! ☁️", "Sometimes... 😜"] as [string, string] },
  { q: "Can I get a warm hug? 🤗", options: ["Big Bear Hug! 🐻", "Tiny Hug! 🤏"] as [string, string] },
  { q: "Will you cuddle me tonight? 🌙", options: ["All Night! 💤", "Maybe... 🤔"] as [string, string] }
];

// ... (keep TEDDY_OPTIONS) 
// The diff block starts at line 7, replacing TEDDY_QA.

const TEDDY_OPTIONS = [
  { id: 'classic', emoji: '🧸', name: 'Classic Bear', desc: 'Warm & Fuzzy' },
  { id: 'white', emoji: '🐻‍❄️', name: 'Snowy Bear', desc: 'Soft & Pure' },
  { id: 'panda', emoji: '🐼', name: 'Panda Bear', desc: 'Lazy & Cute' },
  { id: 'koala', emoji: '🐨', name: 'Koala Bear', desc: 'Clingy Lover' }
];

const TeddyDay: React.FC<{ data: DayContent; partnerName: string; isActive: boolean }> = ({ data, partnerName, isActive }) => {
  const { userId } = useParams<{ userId: string }>();

  // Lock state
  const [isLocked, setIsLocked] = useState(!isDayUnlocked(DayType.TEDDY, isActive));
  const [timeRemaining, setTimeRemaining] = useState(getTimeUntilUnlock(DayType.TEDDY, isActive));
  const [isLoading, setIsLoading] = useState(true);

  const [selectedTeddy, setSelectedTeddy] = useState<string | null>(null);
  const [quizLog, setQuizLog] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  // Check lock status periodically
  useEffect(() => {
    // Initial Check
    setIsLocked(!isDayUnlocked(DayType.TEDDY, isActive));
    setTimeRemaining(getTimeUntilUnlock(DayType.TEDDY, isActive));

    const interval = setInterval(() => {
      const unlocked = isDayUnlocked(DayType.TEDDY, isActive);
      setIsLocked(!unlocked);
      if (!unlocked) {
        setTimeRemaining(getTimeUntilUnlock(DayType.TEDDY, isActive));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  const handleFinish = async (answers?: string[]) => {
    setIsFinished(true);
    if (userId) {
      const teddyName = TEDDY_OPTIONS.find(t => t.id === selectedTeddy)?.name || 'Unknown Bear';
      const finalLog = answers || quizLog;
      const log = `Teddy Day Activity Log: ${finalLog.join(', ')} | Selected Teddy: ${teddyName} (TEDDY DAY COMPLETED)`;
      await saveConfession(userId, log, DayType.TEDDY);
    }

    // Redirect to next day (Promise Day)
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
    return <DayPreloader day={DayType.TEDDY} onFinish={() => setIsLoading(false)} />;
  }

  // 2. Show locked screen if day is locked
  if (isLocked) {
    return (
      <LockedDayScreen
        day={DayType.TEDDY}
        dayTitle="Teddy Day 🧸"
        timeRemaining={timeRemaining}
        onUnlock={() => setIsLocked(false)}
      />
    );
  }

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-start pt-10 p-6 overflow-hidden relative bg-amber-50" >
        <h1 className="text-4xl font-hand font-bold text-orange-600 mb-2 drop-shadow-sm z-20">Teddy Day 🧸</h1>
        <p className="text-gray-600 mb-8 z-20 text-center italic">"{data.message}"</p>

        {/* STEP 1: SELECT A TEDDY */}
        {!selectedTeddy ? (
          <div className="w-full max-w-md animate-fade-in-up">
            <h3 className="text-center font-bold text-orange-800 mb-6 uppercase tracking-widest">Choose a Teddy for yourself! 👇</h3>
            <div className="grid grid-cols-2 gap-4">
              {TEDDY_OPTIONS.map((teddy) => (
                <button
                  key={teddy.id}
                  onClick={() => setSelectedTeddy(teddy.id)}
                  className="glass-card p-4 rounded-xl flex flex-col items-center justify-center hover:scale-105 transition-transform border border-orange-100 hover:bg-orange-100"
                >
                  <span className="text-6xl mb-2">{teddy.emoji}</span>
                  <span className="font-bold text-gray-800">{teddy.name}</span>
                  <span className="text-xs text-gray-500">{teddy.desc}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* STEP 2: Q&A Interaction */
          <div className="w-full max-w-md animate-fade-in flex flex-col items-center">

            <div className="text-center mb-8 animate-bounce">
              <span className="text-8xl">{TEDDY_OPTIONS.find(t => t.id === selectedTeddy)?.emoji}</span>
              <p className="mt-4 font-bold text-orange-700">You chose {TEDDY_OPTIONS.find(t => t.id === selectedTeddy)?.name}!</p>
            </div>

            {!isFinished && (
              <InteractiveQuiz
                questions={TEDDY_QUIZ}
                title="Cuteness Test... 🧸"
                themeColor="orange"
                onComplete={(answers) => handleFinish(answers)}
              />
            )}

            {isFinished && (
              <div className="text-center animate-pulse mt-8">
                <span className="text-4xl">🤝</span>
                <p className="text-orange-800 font-bold mt-2">Redirecting to Promises...</p>
              </div>
            )}
          </div>
        )}

      </div>
    </>
  );
};

export default TeddyDay;
