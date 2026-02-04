import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { DayContent, DayType } from '../../types';
import { saveConfession } from '../../services/storage';
import WaitingPage from './WaitingPage';

import InteractiveQuiz from '../../components/InteractiveQuiz';

const VALENTINE_RECAP_QUIZ = [
  { q: "Did you enjoy our Valentine's Week? 📅", options: ["Loved every bit! ❤️", "It was magical! ✨"] as [string, string] },
  { q: "Are you ready to be mine forever? 💍", options: ["Born ready! 😍", "Yes, a thousand times! 🌹"] as [string, string] }
];

const VALENTINE_QA = [
  { q: "Will you be my Valentine forever? 💍", a: "Yes, in this life and every life after. ❤️" },
  { q: "Kitna pyaar karte ho? 🌏", a: "Zameen se aasmaan tak, aur usse bhi aage. ✨" },
  { q: "Best memory kya hai? 📸", a: "Har wo pal jo tumhare saath bitaya. 🥰" },
  { q: "Koi aakhri khwaish? 🌠", a: "Bas tumhara haath mere haath me rahe, hamesha. 🤝" }
];

const ValentineDay: React.FC<{ data: DayContent, userId: string, isLocked?: boolean }> = ({ data, userId, isLocked }) => {
  if (isLocked) {
    return <WaitingPage
      partnerName=""
      customTitle="Happy Valentine's Day! ❤️"
      customMessage="Pyaar ka din aa gaya... Bas darwaza khulne hi wala hai! 🌹"
    />;
  }

  const [step, setStep] = useState<'quiz' | 'proposal' | 'success'>('quiz');

  // Proposal State
  const [selectedQ, setSelectedQ] = useState(VALENTINE_QA[0].q);
  const [answer, setAnswer] = useState('');
  const [customConfession, setCustomConfession] = useState('');
  const [quizLog, setQuizLog] = useState<string[]>([]);

  const handleQuizFinish = (answers: string[]) => {
    setQuizLog(answers);
    setStep('proposal');
  };

  const handleFinalSubmit = async () => {
    setStep('success');
    const finalMessage = customConfession.trim() || `Accepted Proposal: ${selectedQ} -> ${answer}`;

    // Combine logs
    const log = `Valentine Day Activity Log: ${quizLog.join(', ')} | Final Decision: ${finalMessage} (VALENTINE ACCEPTED FOREVER)`;
    await saveConfession(userId, log, DayType.VALENTINE);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-10 p-6 overflow-x-hidden relative bg-gradient-to-br from-rose-100 to-pink-200">

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
              title="One Last Check... 🕵️‍♀️"
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
              <h3 className="text-sm font-bold text-rose-900 mb-3 uppercase tracking-wider">The Final Question... 💍</h3>

              <div className="mb-6">
                <label className="block text-xs font-bold text-rose-700 mb-2">Write your heart out (Optional):</label>
                <textarea
                  value={customConfession}
                  onChange={(e) => setCustomConfession(e.target.value)}
                  placeholder="Yes, I will be yours..."
                  className="w-full p-4 rounded-xl border border-rose-200 bg-white/90 text-rose-800 placeholder-rose-300 focus:ring-2 focus:ring-rose-400 outline-none resize-none h-24"
                />
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-rose-200"></div>
                <span className="flex-shrink mx-4 text-rose-300 text-xs uppercase">OR SELECT ONE</span>
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
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 animate-zoom-in mb-6">
                  <p className="text-rose-700 font-hand font-bold text-lg leading-relaxed">"{answer}"</p>
                </div>
              )}

              <button
                onClick={handleFinalSubmit}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-4 rounded-xl font-bold text-xl shadow-xl hover:scale-105 transition active:scale-95"
              >
                I LOVE YOU! Be Mine Forever! ❤️
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center animate-zoom-in py-10">
            <h2 className="text-4xl font-hand font-bold text-rose-700 mb-4">Forever & Always! ❤️</h2>
            <p className="text-gray-700">Thank you for making my life beautiful.</p>
            <div className="text-8xl mt-6 animate-ping-slow">💑</div>
            <p className="mt-8 text-sm text-rose-400">See you in reality...</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default ValentineDay;
