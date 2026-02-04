import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DayContent, DayType } from '../../types';
import { saveConfession } from '../../services/storage';
import LockedDayScreen from '../../components/LockedDayScreen';
import PreviewModeBanner from '../../components/PreviewModeBanner';
import { isDayUnlocked, getTimeUntilUnlock, formatTimeRemaining } from '../../utils/dateLock';
import DayPreloader from '../../components/DayPreloader';

import InteractiveQuiz from '../../components/InteractiveQuiz';

const PROMISE_QUIZ = [
  { q: "Will you keep my secrets? 🤐", options: ["Always! 🔒", "Depends... 😜"] as [string, string] },
  { q: "Promise to never leave? 🤝", options: ["Forever! ❤️", "I'll try! 😅"] as [string, string] }
];

const PROMISES_LIST = [
  "I will always respect you. ✊",
  "I will listen to you patiently. 👂",
  "I will share my last slice of pizza. 🍕",
  "I will never sleep angry with you. 😴",
  "I will love you more every day. 📈"
];

// ... (PROMISES_LIST stays)

const PromiseDay: React.FC<{ data: DayContent; partnerName: string; isActive: boolean }> = ({ data, partnerName, isActive }) => {
  const { userId } = useParams<{ userId: string }>();

  // Lock state
  const [isLocked, setIsLocked] = useState(!isDayUnlocked(DayType.PROMISE, isActive));
  const [timeRemaining, setTimeRemaining] = useState(getTimeUntilUnlock(DayType.PROMISE, isActive));
  const [isLoading, setIsLoading] = useState(true);

  const [checkedPromises, setCheckedPromises] = useState<number[]>([]);
  const [quizLog, setQuizLog] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  // Check lock status periodically
  useEffect(() => {
    // Initial check
    setIsLocked(!isDayUnlocked(DayType.PROMISE, isActive));
    setTimeRemaining(getTimeUntilUnlock(DayType.PROMISE, isActive));

    const interval = setInterval(() => {
      const unlocked = isDayUnlocked(DayType.PROMISE, isActive);
      setIsLocked(!unlocked);
      if (!unlocked) {
        setTimeRemaining(getTimeUntilUnlock(DayType.PROMISE, isActive));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  const togglePromise = (index: number) => {
    if (checkedPromises.includes(index)) {
      setCheckedPromises(prev => prev.filter(i => i !== index));
    } else {
      setCheckedPromises(prev => [...prev, index]);
    }
  };

  const handleFinish = async (answers?: string[]) => {
    if (checkedPromises.length === 0) {
      alert("Ek promise to select karo buddhu! 😤");
      return;
    }
    setIsFinished(true);
    if (userId) {
      const promisesMade = checkedPromises.map(i => PROMISES_LIST[i]).join(', ');
      const finalLog = answers || quizLog;
      const log = `Promise Day Activity Log: ${finalLog.join(', ')} | Promises Made: ${promisesMade} (PROMISE DAY COMPLETED)`;
      await saveConfession(userId, log, DayType.PROMISE);
    }

    // Redirect
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
    <>
      <div className="min-h-screen flex flex-col items-center justify-start pt-10 p-6 overflow-x-hidden relative bg-blue-50/50" >
        <h1 className="text-4xl font-hand font-bold text-blue-800 mb-2 drop-shadow-sm z-20">Promise Day 🤝</h1>
        <p className="text-gray-600 mb-8 z-20 text-center italic">"{data.message}"</p>

        <div className="w-full max-w-md animate-fade-in-up">
          {/* PROMISE LIST */}
          <div className="glass-card p-6 rounded-2xl mb-8 border border-blue-200">
            <h3 className="text-center font-bold text-blue-900 mb-4 uppercase tracking-widest">Select Promises to Keep 👇</h3>
            <div className="space-y-3">
              {PROMISES_LIST.map((p, i) => (
                <div key={i}
                  onClick={() => togglePromise(i)}
                  className={`p-3 rounded-lg border flex items-center gap-3 cursor-pointer transition-all ${checkedPromises.includes(i) ? 'bg-blue-100 border-blue-400' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${checkedPromises.includes(i) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                    {checkedPromises.includes(i) && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className="text-gray-700 font-medium text-sm">{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Q&A SECTION */}
          {!isFinished && (
            <InteractiveQuiz
              questions={PROMISE_QUIZ}
              title="Promise Verification 👮‍♂️"
              themeColor="blue"
              onComplete={(answers) => handleFinish(answers)}
            />
          )}

          {isFinished && (
            <div className="text-center animate-pulse mt-6">
              <span className="text-4xl">🤗</span>
              <p className="text-blue-800 font-bold mt-2">Sending Hugs...</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PromiseDay;
