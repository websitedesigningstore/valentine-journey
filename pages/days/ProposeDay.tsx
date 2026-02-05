import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import LockedDayScreen from '../../components/LockedDayScreen';
import DayPreloader from '../../components/DayPreloader';
import InteractiveQuiz from '../../components/InteractiveQuiz';
import { DayContent, DayType } from '../../types';
import { saveConfession } from '../../services/storage';
import { isDayUnlocked, getTimeUntilUnlock } from '../../utils/dateLock';

const PROPOSE_QUIZ = [
  { q: "Promise karo, hamesha saath rahoge? 🤝", options: ["Ha, Hamesha! ❤️", "Puri Koshish! 😅"] as [string, string] },
  { q: "Meri life ko adventure banaoge? 🎢", options: ["Bilkul! 🌍", "Shayad... 🏠"] as [string, string] },
  { q: "Sabse zyada pyaar karte ho mujhse? 🥺", options: ["Had se zyada! ♾️", "Bohat sara! 💕"] as [string, string] },
  { q: "Big Question ke liye taiyaar ho? 💍", options: ["Hamesha Ready! 😎", "Thoda Nervous... 🙈"] as [string, string] }
];

const ProposeDay: React.FC<{ data: DayContent; partnerName?: string; isActive: boolean }> = ({ data, partnerName, isActive }) => {
  const { userId } = useParams<{ userId: string }>();

  // Unique Log ID for this specific session
  const logId = useRef(Date.now().toString());

  // Lock state
  const [isLocked, setIsLocked] = useState(!isDayUnlocked(DayType.PROPOSE, isActive));
  const [timeRemaining, setTimeRemaining] = useState(getTimeUntilUnlock(DayType.PROPOSE, isActive));
  const [isLoading, setIsLoading] = useState(true);

  // Interaction State
  const [response, setResponse] = useState<'yes' | 'no' | null>(null);
  const [noCount, setNoCount] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [promiseMade, setPromiseMade] = useState(false);
  const [rejections, setRejections] = useState<string[]>([]);

  // Quiz State
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizLog, setQuizLog] = useState<string[]>([]);

  const fullText = data.message || "Kya tum mere Valentine banoge? 💍";

  // Check lock status periodically
  useEffect(() => {
    setIsLocked(!isDayUnlocked(DayType.PROPOSE, isActive));
    setTimeRemaining(getTimeUntilUnlock(DayType.PROPOSE, isActive));

    const interval = setInterval(() => {
      const unlocked = isDayUnlocked(DayType.PROPOSE, isActive);
      setIsLocked(!unlocked);
      if (!unlocked) {
        setTimeRemaining(getTimeUntilUnlock(DayType.PROPOSE, isActive));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

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

  // Handlers
  const logRejection = async (count: number) => {
    const reaction = ["No?", "Are you sure?", "Soch lo!", "Pakka?", "Dil toot jayega 💔", "Last chance!", "Akal thikane hai? 😂"][Math.min(count, 6)];
    const newRejection = `❌ Triggered No: Attempt ${count + 1} (${reaction})`;

    // Update local state first
    const updatedRejections = [...rejections, newRejection];
    setRejections(updatedRejections);

    // Save to DB immediately
    if (userId) {
      const log = `Propose Day Activity Log: ${quizLog.join(', ')} | ${updatedRejections.join(' | ')}`;
      await saveConfession(userId, log, DayType.PROPOSE, logId.current);
    }
  };

  const handleNo = (e: React.MouseEvent) => {
    e.preventDefault();
    setNoCount(prev => {
      const newCount = prev + 1;
      logRejection(prev);
      return newCount;
    });
  };

  const handleYes = async () => {
    setResponse('yes');
    if (userId) {
      const rejectionPart = rejections.length > 0 ? ` | ${rejections.join(' | ')}` : '';
      const log = `Propose Day Activity Log: ${quizLog.join(', ')}${rejectionPart} | Final: SHE SAID YES! 💍❤️`;
      await saveConfession(userId, log, DayType.PROPOSE, logId.current);
    }
  };

  const handleFinalPromise = async () => {
    setPromiseMade(true);
    if (userId) {
      const rejectionPart = rejections.length > 0 ? ` | ${rejections.join(' | ')}` : '';
      const log = `Propose Day Activity Log: ${quizLog.join(', ')}${rejectionPart} | Final: SHE SAID YES! 💍❤️ | Promise: Will stay happy forever 🤝`;
      await saveConfession(userId, log, DayType.PROPOSE, logId.current);
    }
  };

  const handleQuizFinish = (answers: string[]) => {
    setQuizLog(answers);
    setQuizComplete(true);
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

  // 1. Show Preloader First
  if (isLoading) {
    return <DayPreloader day={DayType.PROPOSE} onFinish={() => setIsLoading(false)} />;
  }

  // 2. Show locked screen if day is locked
  if (isLocked) {
    return (
      <LockedDayScreen
        day={DayType.PROPOSE}
        dayTitle="Propose Day 💍"
        timeRemaining={timeRemaining}
        onUnlock={() => setIsLocked(false)}
      />
    );
  }

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-start pt-10 p-6 overflow-hidden relative bg-gradient-to-br from-pink-100 to-purple-200">

        {response === 'yes' ? (
          <div className="animate-fade-in-up z-10 flex flex-col items-center justify-center mt-20">
            <div className="text-8xl mb-6 animate-ping">💖</div>
            <h1 className="text-5xl mb-4 animate-bounce">💍 ❤️</h1>
            <h2 className="text-3xl font-hand text-rose-600 font-bold mb-4 drop-shadow-md">She Said YES! 💍❤️</h2>

            {!promiseMade ? (
              <div className="glass-card p-6 rounded-xl mt-4 max-w-sm text-center animate-fade-in">
                <p className="text-gray-700 text-lg mb-6">"Promise karo, tum hamesha khush rahoge?"</p>
                <button
                  onClick={handleFinalPromise}
                  className="bg-rose-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform animate-pulse"
                >
                  I Promise! 🤝❤️
                </button>
              </div>
            ) : (
              <div className="glass-card p-6 rounded-xl mt-4 max-w-sm text-center animate-zoom-in">
                <p className="text-xl font-hand font-bold text-rose-600 mb-2">Promise Locked! 🔒✨</p>
                <p className="text-sm text-gray-400">(Chocolate Day ka intezaar hai... abhi aur surprises baaki hain! 🍫)</p>
              </div>
            )}
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
                title="Poochne se pehle..."
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
                    onMouseEnter={handleNo}
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
    </>
  );
};

export default ProposeDay;
