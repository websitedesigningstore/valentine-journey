import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { DayContent, DayType } from '../../types';
import { saveConfession } from '../../services/storage';
import WaitingPage from './WaitingPage';
import ScratchCard from '../../components/ScratchCard';
import InteractiveQuiz from '../../components/InteractiveQuiz';

const CHOCOLATE_QUIZ = [
  { q: "Do I look sweet today? 🍬", options: ["Sweeter than sugar! 🍯", "Just Okay... 🙄"] as [string, string] },
  { q: "Am I sweeter than chocolate? 🍫", options: ["Much Sweeter! ❤️", "Equal! 🤝"] as [string, string] },
  { q: "Will you share your last piece? 🥺", options: ["Of course! 🫂", "Mine! 😈"] as [string, string] }
];

// ... (keep ScratchCard import if needed, but it's likely already imported above or I need to preserve it.
// The diff block starts at line 8, so imports at top are safe if I'm careful.
// Wait, REPLACE CONTENT replaces lines. Line 8 is const CHOCOLATE_QA. 
// Imports are at lines 1-6. I should add InteractiveQuiz import.

// Use multiple replaces or one big one? 
// I'll replace CHOCOLATE_QA and add import in one chunk if they are close. 
// They are not. Import is line 6. QA is line 8. Close enough.




const ChocolateDay: React.FC<{ data: DayContent, isLocked?: boolean }> = ({ data, isLocked }) => {
  const { userId } = useParams<{ userId: string }>();

  // Locked State (Before Day Arrives)
  if (isLocked) {
    return <WaitingPage
      partnerName=""
      customTitle="Chocolate Day Waiting... 🍫"
      customMessage="Kuch meetha aa raha hai... Sabar ka fal chocolate hota hai! 😋"
    />;
  }

  const [sweetness, setSweetness] = useState(50);
  const [unwrapState, setUnwrapState] = useState<'wrapped' | 'animating' | 'unwrapped'>('wrapped');
  const [isRevealed, setIsRevealed] = useState(false);

  const [quizLog, setQuizLog] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const handleUnwrap = () => {
    if (unwrapState !== 'wrapped') return;
    setUnwrapState('animating');
    setTimeout(() => {
      setUnwrapState('unwrapped');
    }, 1000);
  };

  const handleFinish = async (answers?: string[]) => {
    setIsFinished(true);
    if (userId) {
      const finalLog = answers || quizLog;
      const log = `Chocolate Day Activity Log: ${finalLog.join(', ')} | Sweetness: ${sweetness}% (CHOCOLATE DAY COMPLETED)`;
      await saveConfession(userId, log, DayType.CHOCOLATE);
    }

    // Redirect to next day (Teddy Day)
    setTimeout(() => {
      // Get current URL params to preserve simDate
      const params = new URLSearchParams(window.location.search);
      const isDemo = params.get('demo') === 'true';
      let simDateParam = params.get('simDate');
      if (!simDateParam && window.location.hash.includes('?')) {
        const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
        simDateParam = hashParams.get('simDate');
      }

      const baseUrl = window.location.href.split('?')[0].split('#')[0];
      let queryString = `?demo=${isDemo}&nextDay=true`;
      if (simDateParam) {
        queryString += `&simDate=${simDateParam}`;
      }

      window.location.href = `${baseUrl}#/v/${userId}${queryString}`;
      window.location.reload();
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-10 p-6 overflow-x-hidden relative">
      <h1 className="text-4xl font-hand font-bold text-amber-800 mb-6 drop-shadow-sm z-20 animate-bounce-slow">Chocolate Day 🍫</h1>

      <div className="relative w-full max-w-sm flex flex-col items-center">




        <ScratchCard
          width={320}
          height={420}
          image="https://www.transparenttextures.com/patterns/aluminum.png"
          onReveal={() => {
            setIsRevealed(true);
            setUnwrapState('unwrapped');
          }}
        >
          {/* The Secret Content to Reveal */}
          <div className="w-full h-full glass-card p-6 flex flex-col items-center justify-center bg-white/90">
            <div className="text-7xl mb-4 drop-shadow-md">🍫</div>
            <p className="text-xl text-gray-800 font-hand leading-relaxed text-center">"{data.message}"</p>

            <div className="mt-6 w-full bg-amber-50 p-4 rounded-xl border border-amber-100">
              <label className="block text-sm font-bold text-amber-900 mb-2 text-center">Kitni sweet ho tum? 🍬</label>
              <input
                type="range"
                min="0"
                max="100"
                value={sweetness}
                onChange={(e) => setSweetness(parseInt(e.target.value))}
                className="w-full h-3 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="text-center mt-2 text-xl font-bold text-amber-700 font-hand">
                {sweetness === 100 ? "Infinity! 🍯✨" : `${sweetness}% Sweet`}
              </div>
            </div>
          </div>
        </ScratchCard>

        {/* Instruction Overlay (Disappears on interaction usually, but here handled by ScratchCard top layer) */}
        {!isRevealed && (
          <div className="absolute -bottom-10 left-0 right-0 text-center animate-bounce text-amber-800 font-bold">
            👆 Scratch to Reveal!
          </div>
        )}
      </div>



      {unwrapState === 'unwrapped' && !isFinished && (
        <div className="w-full animate-fade-in-up mb-8">
          <InteractiveQuiz
            questions={CHOCOLATE_QUIZ}
            title="Sweet Talk Time... 🍬"
            themeColor="amber"
            onComplete={(answers) => handleFinish(answers)}
          />
        </div>
      )}

      {isFinished && (
        <div className="text-center animate-bounce">
          <span className="text-4xl">🧸</span>
          <p className="text-amber-800 font-bold mt-2">Waiting for Teddy...</p>
        </div>
      )}

    </div>
  );
};

export default ChocolateDay;