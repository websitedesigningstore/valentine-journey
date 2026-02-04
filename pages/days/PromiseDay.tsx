import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DayContent, DayType } from '../../types';
import { saveConfession } from '../../services/storage';
import LockedDayScreen from '../../components/LockedDayScreen';
import PreviewModeBanner from '../../components/PreviewModeBanner';
import { isDayUnlocked, getTimeUntilUnlock, formatTimeRemaining } from '../../utils/dateLock';
import DayPreloader from '../../components/DayPreloader';

import InteractiveQuiz from '../../components/InteractiveQuiz';
import TypewriterText from '../../components/TypewriterText';

const PROMISE_QUIZ = [
  { q: "Mere secrets hamesha rakhoge na? 🤐", options: ["Hamesha! 🔒", "Sochne do... 😜"] as [string, string] },
  { q: "Kabhi chhod ke to nahi jaoge? 🤝", options: ["Kabhi nahi! ❤️", "Puri koshish rahegi! 😅"] as [string, string] }
];

const PROMISES_LIST = [
  "Tumhari respect hamesha rahegi. ✊",
  "Tumhari har baat suni jayegi. 👂",
  "Last pizza slice tumhare naam. 🍕",
  "Gussa hoke nahi sona hai. 😴",
  "Pyar har din badhta rahega. 📈"
];

// ... (PROMISES_LIST stays)

const PromiseDay: React.FC<{ data: DayContent; partnerName: string; isActive: boolean }> = ({ data, partnerName, isActive }) => {
  const { userId } = useParams<{ userId: string }>();

  // Lock state
  const [isLocked, setIsLocked] = useState(!isDayUnlocked(DayType.PROMISE, isActive));
  const [timeRemaining, setTimeRemaining] = useState(getTimeUntilUnlock(DayType.PROMISE, isActive));
  const [isLoading, setIsLoading] = useState(true);

  /* STATE */
  const [stage, setStage] = useState<'quiz' | 'my_promises' | 'finale'>('quiz');
  const [quizLog, setQuizLog] = useState<string[]>([]);

  // ... (lock checks stay)

  const handleQuizComplete = (answers: string[]) => {
    setQuizLog(answers);
    setStage('my_promises');
  };

  const handleFinish = async () => {
    if (userId) {
      const log = `Promise Day Activity Log: ${quizLog.join(', ')} | Viewed My Promises (PROMISE DAY COMPLETED)`;
      await saveConfession(userId, log, DayType.PROMISE);
    }
    setStage('finale');
  };

  // 1. Show Preloader First
  if (isLoading) {
    return <DayPreloader day={DayType.PROMISE} onFinish={() => setIsLoading(false)} />;
  }

  // 2. Show locked screen if day is locked
  if (isLocked) {
    return (
      <LockedDayScreen
        day={DayType.PROMISE}
        dayTitle="Promise Day 🤝"
        timeRemaining={timeRemaining}
        onUnlock={() => setIsLocked(false)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-10 p-6 overflow-x-hidden relative bg-blue-50">
      {/* Background Floating Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="absolute text-4xl animate-pulse" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDelay: `${i}s` }}>🤝</div>
        ))}
      </div>

      <h1 className="text-4xl font-hand font-bold text-blue-600 mb-2 drop-shadow-sm z-20">Promise Day 🤝</h1>
      <p className="text-gray-600 mb-8 z-20 text-center italic">"{data.message}"</p>

      <div className="w-full max-w-md animate-fade-in-up z-20">

        {/* STAGE 1: TAKE PROMISES (Quiz) */}
        {stage === 'quiz' && (
          <div className="flex flex-col gap-6">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-blue-800">Pehle kuch waade tumse... 👇</h3>
            </div>
            <InteractiveQuiz
              questions={PROMISE_QUIZ}
              title="Pakka wala Promise? 👮‍♂️"
              themeColor="blue"
              onComplete={handleQuizComplete}
            />
          </div>
        )}

        {/* STAGE 2: MY PROMISES (Reciprocity) */}
        {stage === 'my_promises' && (
          <div className="animate-zoom-in">
            <div className="glass-card p-6 rounded-2xl border-2 border-blue-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-cyan-400"></div>

              <h3 className="text-center font-bold text-2xl text-blue-800 mb-6 font-hand">Ab Meri Baari... ✋</h3>

              <div className="space-y-4 mb-8">
                {PROMISES_LIST.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/60 p-3 rounded-lg shadow-sm">
                    <span className="text-xl">✨</span>
                    <span className="text-gray-700 font-medium text-sm">
                      {stage === 'my_promises' && <TypewriterText text={p} speed={30} delay={i * 800} cursor={false} />}
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-center p-4 bg-blue-50/80 rounded-xl mb-6 border border-blue-100 italic text-blue-700">
                "Ye sirf lines nahi hain, ye mera dil se kiya hua vaada hai. I promise to keep you happy! ❤️"
              </div>

              <button
                onClick={handleFinish}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 rounded-xl shadow-lg hover:scale-105 transition-transform"
              >
                I Accept Your Promises! 🤝
              </button>
            </div>
          </div>
        )}

        {/* STAGE 3: FINALE (Waiting for Hug Day) */}
        {stage === 'finale' && (
          <div className="w-full max-w-sm animate-zoom-in mt-10 text-center mx-auto">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-8 rounded-[2rem] shadow-2xl border-4 border-white/50 relative overflow-hidden">

              <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-300 rounded-full blur-3xl opacity-30"></div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-300 rounded-full blur-3xl opacity-30"></div>

              <span className="text-7xl block mb-4 animate-bounce-slow filter drop-shadow-md">🤗</span>

              <h2 className="text-3xl font-hand font-bold text-blue-900 mb-2">Thank You! ❤️</h2>
              <p className="text-gray-700 mb-4 text-lg leading-relaxed font-medium">
                "Inn sabhi promises ke liye, aur abhi tak mera saath dene ke liye... <br />
                **Dil se Thank You!** 🌹<br />
                You mean everything to me."
              </p>

              <div className="w-full h-px bg-blue-200 my-4"></div>

              <h3 className="text-xl font-bold text-blue-800 mb-2">Next: Hug Day 🧸</h3>
              <p className="text-gray-600 mb-6 text-md italic">
                "Vaade toh ho gaye... ab bas ek *Jaadu ki Jhappi* ka intezaar hai!"
              </p>

              <div className="inline-block bg-white/50 px-4 py-2 rounded-full text-xs font-bold text-blue-800 tracking-wider">
                KAL MILTE HAIN 🤗
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PromiseDay;
