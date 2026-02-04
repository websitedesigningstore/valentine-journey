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
  { q: "Main tumhara sabse softest pillow hu na? 🧸", options: ["Hamesha! ☁️", "Kabhi kabhi... 😜"] as [string, string] },
  { q: "Kya mujhe ek warm hug milega? 🤗", options: ["Bahut bada Bear Hug! 🐻", "Chhota sa Hug! 🤏"] as [string, string] },
  { q: "Aaj raat cuddle karoge? 🌙", options: ["Puri raat! 💤", "Sochna padega... 🤔"] as [string, string] }
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
  const [showWish, setShowWish] = useState(false);
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

    // No redirect, show waiting message
  };

  // ... (render)

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
    <div className="min-h-screen flex flex-col items-center justify-start pt-10 p-6 overflow-x-hidden relative bg-amber-50">
      {/* Background Floating Teddies */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute text-3xl opacity-20 animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              transform: `rotate(${Math.random() * 20 - 10}deg)`
            }}
          >
            {i % 2 === 0 ? '🧸' : '❤️'}
          </div>
        ))}
      </div>

      <h1 className="text-4xl font-hand font-bold text-orange-600 mb-2 drop-shadow-sm z-20">Teddy Day 🧸</h1>

      {/* STEP 1: SELECT A TEDDY */}
      {!selectedTeddy ? (
        <div className="w-full max-w-md animate-fade-in-up z-20">
          <p className="text-gray-600 mb-8 text-center italic">"{data.message}"</p>
          <h3 className="text-center font-bold text-orange-800 mb-6 uppercase tracking-widest">Mere liye ek Teddy choose karo! 👇</h3>
          <div className="grid grid-cols-2 gap-4">
            {TEDDY_OPTIONS.map((teddy) => (
              <button
                key={teddy.id}
                onClick={() => {
                  setSelectedTeddy(teddy.id);
                  setShowWish(true);
                }}
                className="glass-card p-4 rounded-xl flex flex-col items-center justify-center hover:scale-105 transition-transform border border-orange-100 hover:bg-orange-100 bg-white/60"
              >
                <span className="text-6xl mb-2 filter drop-shadow-sm">{teddy.emoji}</span>
                <span className="font-bold text-gray-800">{teddy.name}</span>
                <span className="text-xs text-gray-500">{teddy.desc}</span>
              </button>
            ))}
          </div>
        </div>
      ) : showWish ? (
        /* STEP 2: BIG WISH REVEAL */
        <div className="w-full max-w-sm animate-zoom-in mt-10 text-center z-20">
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2rem] shadow-2xl border-2 border-orange-200 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-transparent to-rose-50 opacity-50"></div>

            <div className="relative z-10">
              <span className="text-8xl block mb-4 animate-bounce-slow drop-shadow-lg">
                {TEDDY_OPTIONS.find(t => t.id === selectedTeddy)?.emoji}
              </span>

              <h2 className="text-4xl font-hand font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500 mb-2">
                Happy Teddy Day! 🧸
              </h2>

              <p className="text-gray-700 text-lg font-medium leading-relaxed mb-8">
                "Tumne choose kiya <b>{TEDDY_OPTIONS.find(t => t.id === selectedTeddy)?.name}</b>!<br />
                Hope ye cute sa teddy tumhare face par ek badi si smile laye! 😊❤️"
              </p>

              <button
                onClick={() => setShowWish(false)}
                className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold py-3 rounded-xl shadow-lg hover:scale-105 transition-transform"
              >
                Cuteness Test ki taraf ➡️
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* STEP 3: QUIZ & FINALE */
        <div className="w-full max-w-md animate-fade-in flex flex-col items-center z-20">

          {!isFinished && (
            <InteractiveQuiz
              questions={TEDDY_QUIZ}
              title="Cuteness Test... 🧸"
              themeColor="orange"
              onComplete={(answers) => handleFinish(answers)}
            />
          )}

          {isFinished && (
            <div className="w-full max-w-sm animate-zoom-in mt-10 text-center">
              <div className="bg-gradient-to-br from-orange-100 to-amber-100 p-8 rounded-[2rem] shadow-2xl border-4 border-white/50 relative overflow-hidden">

                <div className="absolute -top-10 -left-10 w-32 h-32 bg-orange-300 rounded-full blur-3xl opacity-30"></div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-300 rounded-full blur-3xl opacity-30"></div>

                <span className="text-7xl block mb-4 animate-bounce-slow filter drop-shadow-md">🤝</span>

                <h2 className="text-3xl font-hand font-bold text-orange-900 mb-2">Promise Day is Coming...</h2>
                <p className="text-gray-700 mb-6 text-lg leading-relaxed font-medium">
                  "Cuddles ho gaye, ab baari hai kuch *pakke vaadon* ki... <br />
                  <span className="text-orange-600 font-bold">Kal milte hain! ❤️</span>"
                </p>

                <div className="inline-block bg-white/50 px-4 py-2 rounded-full text-xs font-bold text-orange-800 tracking-wider">
                  KAL MILTE HAIN 🤝
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeddyDay;

