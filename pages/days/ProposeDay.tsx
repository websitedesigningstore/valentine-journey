import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DayContent, DayType } from '../../types';
import { saveConfession } from '../../services/storage';

const PROPOSE_QUIZ = [
  { q: "Do you promise to stay with me forever? 🤝", options: ["I Promise! ❤️", "I'll Try! 😅"] as [string, string] },
  { q: "Will you make my life an adventure? 🎢", options: ["Always! 🌍", "Maybe... 🏠"] as [string, string] },
  { q: "Do you love me more than anything? 🥺", options: ["Yes, Infinite! ♾️", "Lots! 💕"] as [string, string] },
  { q: "Are you ready for the big question? 💍", options: ["Born Ready! 😎", "Nervous... 🙈"] as [string, string] }
];

import WaitingPage from './WaitingPage';
import InteractiveQuiz from '../../components/InteractiveQuiz';

const ProposeDay: React.FC<{ data: DayContent, isLocked?: boolean }> = ({ data, isLocked }) => {
  const { userId } = useParams<{ userId: string }>();

  if (isLocked) {
    return <WaitingPage
      partnerName=""
      customTitle="Propose Day is Coming! 💍"
      customMessage="Dil thaam ke baithiye... bas kuch pal aur! ✨"
    />;
  }
  const [response, setResponse] = useState<'yes' | 'no' | null>(null);
  const [noCount, setNoCount] = useState(0);
  const [typedText, setTypedText] = useState('');

  // Quiz State
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizLog, setQuizLog] = useState<string[]>([]);

  const fullText = data.message || "Will you be my Valentine?";

  // Typewriter effect
  useEffect(() => {
    if (quizComplete && !response) { // Only type when showing proposal
      let i = 0;
      const interval = setInterval(() => {
        setTypedText(fullText.slice(0, i + 1));
        i++;
        if (i > fullText.length) clearInterval(interval);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [fullText, quizComplete, response]);

  const handleNo = (e: React.MouseEvent) => {
    e.preventDefault();
    setNoCount(prev => prev + 1);
  };

  const handleYes = async () => {
    setResponse('yes');
    if (userId) {
      const log = `Propose Day Activity Log: ${quizLog.join(', ')} | Final: SHE SAID YES! 💍❤️`;
      await saveConfession(userId, log, DayType.PROPOSE);
    }
  };

  const getNoButtonStyles = () => {
    if (noCount === 0) return {};
    const randomX = Math.random() * 200 - 100;
    const randomY = Math.random() * 200 - 100;
    return {
      transform: `translate(${randomX}px, ${randomY}px) scale(${Math.max(0.7, 1 - noCount * 0.1)})`,
      transition: 'all 0.2s ease',
      position: 'absolute' as 'absolute'
    };
  };

  const getNoText = () => {
    const texts = ["No?", "Are you sure?", "Soch lo!", "Pakka?", "Dil toot jayega 💔", "Last chance!", "Akal thikane hai? 😂"];
    return texts[Math.min(noCount, texts.length - 1)];
  };

  const handleQuizFinish = (answers: string[]) => {
    setQuizLog(answers);
    setQuizComplete(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-16 p-4 pb-10 overflow-x-hidden">

      {response === 'yes' ? (
        <div className="animate-fade-in-up z-10 flex flex-col items-center justify-center mt-20">
          <div className="text-8xl mb-6 animate-ping">💖</div>
          <h1 className="text-5xl mb-4 animate-bounce">💍 ❤️</h1>
          <h2 className="text-3xl font-hand text-rose-600 font-bold mb-4 drop-shadow-md">She Said YES!</h2>
          <div className="glass-card p-6 rounded-xl mt-4 max-w-sm text-center">
            <p className="text-gray-700 text-lg">"Promise to keep you happy forever!"</p>
            <p className="text-sm text-gray-400 mt-4">(Waiting for Chocolate Day... Next Surprise Loading! 🍫)</p>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md flex flex-col gap-6">

          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-4xl font-hand font-bold text-rose-600 animate-pulse">Propose Day 💍</h1>
            <p className="text-gray-600 text-sm mt-2">Dil ki baat, aaj tumhare saath...</p>
          </div>

          {!quizComplete ? (
            <InteractiveQuiz
              questions={PROPOSE_QUIZ}
              title="Before I ask you..."
              themeColor="rose"
              onComplete={handleQuizFinish}
            />
          ) : (
            /* The Big Proposal Card */
            <div className="glass-card p-8 rounded-2xl shadow-xl border border-rose-300 relative bg-white/60 animate-zoom-in">
              <div className="text-6xl mb-6 text-center animate-bounce">💍</div>

              <div className="min-h-[4rem] flex items-center justify-center mb-8 text-center">
                <p className="text-3xl font-hand text-rose-600 font-bold leading-relaxed drop-shadow-sm">
                  {typedText}<span className="animate-blink">|</span>
                </p>
              </div>

              <div className="flex flex-col gap-4 relative h-32">
                <button
                  onClick={handleYes}
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-4 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all z-20"
                >
                  YES! ❤️
                </button>

                {/* Runaway No Button */}
                <button
                  onMouseEnter={() => { if (noCount === 0 || noCount > 0) setNoCount(prev => prev + 1); }}
                  onClick={handleNo}
                  style={noCount > 0 ? getNoButtonStyles() : undefined}
                  className={`w-full bg-gray-200 text-gray-500 py-3 rounded-xl font-medium hover:bg-gray-300 transition-all z-10 ${noCount > 0 ? 'absolute top-16 left-0' : ''}`}
                >
                  {getNoText()}
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );


};

export default ProposeDay;
