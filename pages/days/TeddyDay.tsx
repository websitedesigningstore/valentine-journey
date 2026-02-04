import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { DayContent, DayType } from '../../types';
import { saveConfession } from '../../services/storage';
import WaitingPage from './WaitingPage';

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

const TeddyDay: React.FC<{ data: DayContent, isLocked?: boolean }> = ({ data, isLocked }) => {
  const { userId } = useParams<{ userId: string }>();

  if (isLocked) {
    return <WaitingPage
      partnerName=""
      customTitle="Teddy Day Coming Soon! 🧸"
      customMessage="Ek soft sa dost tumhara intezaar kar raha hai... ⏳"
    />;
  }

  const [selectedTeddy, setSelectedTeddy] = useState<string | null>(null);

  const [quizLog, setQuizLog] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);

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
    <div className="min-h-screen flex flex-col items-center justify-start pt-10 p-6 overflow-x-hidden relative bg-orange-50/50">
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
  );
};

export default TeddyDay;
