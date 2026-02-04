import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DayContent, DayType } from '../../types';
import { saveConfession } from '../../services/storage';
import LockedDayScreen from '../../components/LockedDayScreen';
import PreviewModeBanner from '../../components/PreviewModeBanner';
import { isDayUnlocked, getTimeUntilUnlock, formatTimeRemaining } from '../../utils/dateLock';
import DayPreloader from '../../components/DayPreloader';

import InteractiveQuiz from '../../components/InteractiveQuiz';

const VALENTINE_RECAP_QUIZ = [
  { q: "Kaisa laga hamara ye Valentine Week? 📅", options: ["Bahut Pyaara tha! ❤️", "Bilkul Magical! ✨"] as [string, string] },
  { q: "Kya tum hamesha ke liye banoge mere? 💍", options: ["Har Janam ke liye! 😍", "Sau baar haan! 🌹"] as [string, string] }
];

const VALENTINE_QA = [
  { q: "Kya tum hamesha mere Valentine rahoge? 💍", a: "Haan, is janam me\naur har janam me. ❤️" },
  { q: "Kitna pyaar karte ho? 🌏", a: "Zameen se aasmaan tak,\naur usse bhi aage. ✨" },
  { q: "Best memory kya hai? 📸", a: "Har wo pal\njo tumhare saath bitaya. 🥰" },
  { q: "Akhri khwaish kya hai? 🌠", a: "Bas tumhara haath\nmere haath me rahe, hamesha. 🤝" }
];

const ValentineDay: React.FC<{ data: DayContent; userId: string; isActive: boolean }> = ({ data, userId, isActive }) => {
  // Lock state
  const [isLocked, setIsLocked] = useState(!isDayUnlocked(DayType.VALENTINE, isActive));
  const [timeRemaining, setTimeRemaining] = useState(getTimeUntilUnlock(DayType.VALENTINE, isActive));
  const [isLoading, setIsLoading] = useState(true);

  const [step, setStep] = useState<'quiz' | 'proposal' | 'success'>('quiz');
  const [showCinematic, setShowCinematic] = useState(false);

  // Proposal State
  const [selectedQ, setSelectedQ] = useState(VALENTINE_QA[0].q);
  const [answer, setAnswer] = useState(VALENTINE_QA[0].a);
  const [customConfession, setCustomConfession] = useState('');
  const [quizLog, setQuizLog] = useState<string[]>([]);

  // Check lock status periodically
  useEffect(() => {
    setIsLocked(!isDayUnlocked(DayType.VALENTINE, isActive));
    setTimeRemaining(getTimeUntilUnlock(DayType.VALENTINE, isActive));
    const interval = setInterval(() => {
      const unlocked = isDayUnlocked(DayType.VALENTINE, isActive);
      setIsLocked(!unlocked);
      if (!unlocked) setTimeRemaining(getTimeUntilUnlock(DayType.VALENTINE, isActive));
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  const handleQuizFinish = (answers: string[]) => {
    setQuizLog(answers);
    setShowCinematic(true);
    setStep('proposal');

    // Auto dismiss cinematic after 22 seconds (Wait for slow animation + 10s hold)
    setTimeout(() => {
      setShowCinematic(false);
    }, 22000);
  };

  const handleFinalSubmit = async (decisionType: string = 'Accepted') => {
    setStep('success');
    const finalMessage = customConfession.trim() || `Accepted Proposal: ${selectedQ} -> ${answer}`;
    const log = `Valentine Day Activity Log: ${quizLog.join(', ')} | Final Decision: ${finalMessage} (${decisionType})`;
    await saveConfession(userId, log, DayType.VALENTINE);
  };

  // 1. Show Preloader First
  if (isLoading) {
    return <DayPreloader day={DayType.VALENTINE} onFinish={() => setIsLoading(false)} />;
  }

  // 2. Show locked screen if day is locked
  if (isLocked) {
    return (
      <LockedDayScreen
        day={DayType.VALENTINE}
        dayTitle="Valentine's Day ❤️"
        timeRemaining={timeRemaining}
        onUnlock={() => setIsLocked(false)}
      />
    );
  }

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-start pt-10 p-6 overflow-x-hidden relative bg-gradient-to-br from-rose-100 to-pink-200" >

        {/* CINEMATIC INTRO OVERLAY */}
        {/* CINEMATIC INTRO OVERLAY */}
        {/* CINEMATIC INTRO OVERLAY */}
        {showCinematic && (
          <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-white overflow-hidden pointer-events-none">
            {/* Intro Line - Top */}
            <p className="text-3xl font-hand italic text-rose-200 opacity-0 animate-fade-in-slow mb-12 absolute top-20" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
              "You are my forever Valentine..."
            </p>

            <div className="flex flex-col items-center justify-center space-y-6 font-black tracking-widest perspective-text mt-32" style={{ perspective: '500px' }}>

              {/* ROW 1: I (Last to drop - Top) */}
              <div className="flex space-x-4 text-8xl text-red-600">
                {['I'].map((char, i) => (
                  <span key={i} className="opacity-0 animate-drop-in-slow inline-block transform" style={{
                    animationDelay: '6.0s',
                    textShadow: `
                        1px 1px 0 #500724, 
                        2px 2px 0 #500724, 
                        3px 3px 0 #500724, 
                        4px 4px 0 #500724, 
                        5px 5px 0 #500724, 
                        6px 6px 0 #500724, 
                        7px 7px 0 #500724, 
                        8px 8px 0 #500724, 
                        9px 9px 0 #500724, 
                        10px 10px 0 #500724, 
                        11px 11px 0 #500724, 
                        12px 12px 0 #500724, 
                        0 20px 30px rgba(0,0,0,0.9)
                      `,
                    transform: 'rotateX(15deg)'
                  }}>
                    {char}
                  </span>
                ))}
              </div>

              {/* ROW 2: LOVE (Second to drop - Middle) */}
              <div className="flex space-x-4 text-7xl text-red-500">
                {['L', 'O', 'V', 'E'].map((char, i) => (
                  <span key={i} className="opacity-0 animate-drop-in-slow inline-block transform" style={{
                    animationDelay: `${3.5 + (i * 0.5)}s`,
                    textShadow: `
                        1px 1px 0 #500724, 
                        2px 2px 0 #500724, 
                        3px 3px 0 #500724, 
                        4px 4px 0 #500724, 
                        5px 5px 0 #500724, 
                        6px 6px 0 #500724, 
                        7px 7px 0 #500724, 
                        8px 8px 0 #500724, 
                        9px 9px 0 #500724, 
                        10px 10px 0 #500724, 
                        11px 11px 0 #500724, 
                        12px 12px 0 #500724, 
                        0 20px 30px rgba(0,0,0,0.9)
                      `,
                    transform: 'rotateX(15deg)'
                  }}>
                    {char}
                  </span>
                ))}
              </div>

              {/* ROW 3: YOU (First to drop - Bottom) */}
              <div className="flex space-x-4 text-7xl text-red-400">
                {['Y', 'O', 'U'].map((char, i) => (
                  <span key={i} className="opacity-0 animate-drop-in-slow inline-block transform" style={{
                    animationDelay: `${1.0 + (i * 0.5)}s`,
                    textShadow: `
                        1px 1px 0 #500724, 
                        2px 2px 0 #500724, 
                        3px 3px 0 #500724, 
                        4px 4px 0 #500724, 
                        5px 5px 0 #500724, 
                        6px 6px 0 #500724, 
                        7px 7px 0 #500724, 
                        8px 8px 0 #500724, 
                        9px 9px 0 #500724, 
                        10px 10px 0 #500724, 
                        11px 11px 0 #500724, 
                        12px 12px 0 #500724, 
                        0 20px 30px rgba(0,0,0,0.9)
                      `,
                    transform: 'rotateX(15deg)'
                  }}>
                    {char}
                  </span>
                ))}
              </div>

              {/* New Heartfelt Message */}
              <div className="pt-10 opacity-0 animate-fade-in-slow" style={{ animationDelay: '8.5s', animationFillMode: 'forwards' }}>
                <p className="text-xl font-hand italic text-gray-300">"Meri har khushi tumse hai... ✨"</p>
              </div>

              {/* Heart Pulse */}
              <div className="pt-4">
                <span className="text-8xl opacity-0 animate-zoom-in inline-block drop-shadow-[0_0_20px_rgba(255,0,0,1)] animate-pulse" style={{ animationDelay: '9.0s', animationFillMode: 'forwards' }}>
                  ❤️
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Confetti */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute animate-float text-4xl opacity-50" style={{
              left: `${Math.random() * 100}%`,
              top: '-10%',
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`
            }}>
              {['❤️', '🌹', '✨', '💖'][Math.floor(Math.random() * 4)]}
            </div>
          ))}
        </div>

        <div className="z-20 w-full max-w-md flex flex-col items-center">
          <h1 className="text-5xl font-hand font-bold text-rose-600 mb-4 drop-shadow-md animate-bounce-slow text-center">Happy Valentine's Day! 💖</h1>

          {step === 'quiz' && (
            <div className="w-full animate-fade-in-up">
              <InteractiveQuiz
                questions={VALENTINE_RECAP_QUIZ}
                title="Bas ek aakhri sawaal... 🕵️‍♀️"
                themeColor="rose"
                onComplete={handleQuizFinish}
              />
            </div>
          )}

          {step === 'proposal' && (
            <div className="w-full animate-fade-in-up">
              {/* MAIN LETTER/CARD */}
              <div className="w-full glass-card p-8 rounded-2xl shadow-2xl border border-rose-300 bg-white/60 mb-8">
                <div className="text-center">
                  <div className="text-7xl mb-6 animate-pulse">🥰</div>
                  <p className="text-xl font-hand text-gray-800 leading-loose font-bold italic">
                    "{data.message}"
                  </p>
                  <p className="mt-4 text-sm text-rose-500 font-bold uppercase tracking-widest">- Forever Yours</p>
                </div>
              </div>

              {/* Q&A FINAL */}
              <div className="glass-card p-6 rounded-2xl w-full border border-rose-200 shadow-lg bg-white/80">
                <h3 className="text-sm font-bold text-rose-900 mb-3 uppercase tracking-wider">Aakhri Faisla... 💍</h3>

                <div className="mb-6">
                  <label className="block text-xs font-bold text-rose-700 mb-2">Apne dil ki baat likho (Optional):</label>
                  <textarea
                    value={customConfession}
                    onChange={(e) => setCustomConfession(e.target.value)}
                    placeholder="Haan, main hamesha tumhara rahunga..."
                    className="w-full p-4 rounded-xl border border-rose-200 bg-white/90 text-rose-800 placeholder-rose-300 focus:ring-2 focus:ring-rose-400 outline-none resize-none h-24"
                  />
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-rose-200"></div>
                  <span className="flex-shrink mx-4 text-rose-300 text-xs uppercase">YA SELECT KARO</span>
                  <div className="flex-grow border-t border-rose-200"></div>
                </div>

                <select
                  value={selectedQ}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedQ(val);
                    const found = VALENTINE_QA.find(item => item.q === val);
                    if (found) setAnswer(found.a);
                  }}
                  className="w-full p-3 rounded-xl border border-rose-200 bg-white text-rose-900 font-medium outline-none focus:ring-2 focus:ring-rose-400 appearance-none cursor-pointer mb-4"
                >
                  {VALENTINE_QA.map((qa, i) => (
                    <option key={i} value={qa.q}>{qa.q}</option>
                  ))}
                </select>

                {answer && !customConfession && (
                  <div className="relative group my-6 animate-zoom-in">
                    <div className="absolute -inset-1 bg-gradient-to-r from-rose-400 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative bg-white/90 backdrop-blur-xl p-6 rounded-xl border border-rose-100 text-center shadow-xl">
                      <span className="text-4xl absolute -top-4 -left-2 filter drop-shadow-md">❝</span>
                      <p className="text-rose-800 font-hand font-bold text-2xl leading-relaxed whitespace-pre-line">
                        {answer}
                      </p>
                      <span className="text-4xl absolute -bottom-8 -right-2 filter drop-shadow-md transform rotate-180 opacity-50">❝</span>
                    </div>
                  </div>
                )}

                <div className="space-y-4 mt-8">
                  <button
                    onClick={() => handleFinalSubmit('Accepted Immediately')}
                    className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-4 rounded-full font-bold text-xl shadow-xl hover:scale-105 transition active:scale-95 animate-pulse"
                  >
                    Haan! I Love You Too! ❤️
                  </button>

                  <button
                    onClick={() => handleFinalSubmit('Played Hard to Get')}
                    className="w-full bg-white text-rose-500 border-2 border-rose-200 py-3 rounded-full font-bold text-lg shadow-sm hover:bg-rose-50 transition active:scale-95"
                  >
                    Hmm... Sochungi 🤔
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center animate-zoom-in py-10">
              <h2 className="text-4xl font-hand font-bold text-rose-700 mb-4">Hamesha aur Har Pal! ❤️</h2>
              <p className="text-gray-700">Meri zindagi beautiful banane ke liye Thank You.</p>
              <div className="text-8xl mt-6 animate-ping-slow">💑</div>
              <p className="mt-8 text-sm text-rose-400">Jaldi milte hain... ✨</p>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default ValentineDay;
