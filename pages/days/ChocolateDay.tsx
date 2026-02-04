import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import LockedDayScreen from '../../components/LockedDayScreen';
import { DayContent, DayType } from '../../types';
import { saveConfession } from '../../services/storage';
import { isDayUnlocked, getTimeUntilUnlock } from '../../utils/dateLock';
import DayPreloader from '../../components/DayPreloader';
import ScratchCard from '../../components/ScratchCard';
import InteractiveQuiz from '../../components/InteractiveQuiz';

const CHOCOLATE_QUIZ = [
  { q: "Sabse lucky insaan kaun hai? 🍀", options: ["Jo tumhe pa gaya! ❤️", "Jo chocolate khata hai... 🍫"] as [string, string] },
  { q: "Life ki bitterness kaise khatam hui? 🍬", options: ["Tumhare aane se ✨", "Cheeni khane se... 🍚"] as [string, string] },
  { q: "Ye chocolate kiske liye? 🥺", options: ["Sirf mere liye! 🍫", "Sabke liye..."] as [string, string] }
];

const CHOCOLATES = [
  { id: 'silk', name: 'Silk', emoji: '🍫', msg: "Kyunki tumhara pyaar Silk se bhi smooth hai... ❤️" },
  { id: 'kitkat', name: 'KitKat', emoji: '🥖', msg: "Tumhare saath har pal 'crunchy' aur special hai! ✨" },
  { id: 'ferrero', name: 'Ferrero', emoji: '🌰', msg: "Tum meri life ke 'Golden' person ho, sabse anmol! 👑" }
];

const ChocolateDay: React.FC<{ data: DayContent; partnerName: string; isActive: boolean }> = ({ data, isActive }) => {
  const { userId } = useParams<{ userId: string }>();

  // Lock state
  const [isLocked, setIsLocked] = useState(!isDayUnlocked(DayType.CHOCOLATE, isActive));
  const [timeRemaining, setTimeRemaining] = useState(getTimeUntilUnlock(DayType.CHOCOLATE, isActive));
  const [isLoading, setIsLoading] = useState(true);

  // Flow State
  // 'scratch' -> 'reveal_wish' -> 'chocolate_box' -> 'quiz' -> 'finale'
  const [stage, setStage] = useState<'scratch' | 'reveal_wish' | 'chocolate_box' | 'quiz' | 'finale'>('scratch');
  const [selectedChoco, setSelectedChoco] = useState<string | null>(null);

  useEffect(() => {
    // Initial Check
    setIsLocked(!isDayUnlocked(DayType.CHOCOLATE, isActive));
    setTimeRemaining(getTimeUntilUnlock(DayType.CHOCOLATE, isActive));

    const interval = setInterval(() => {
      const unlocked = isDayUnlocked(DayType.CHOCOLATE, isActive);
      setIsLocked(!unlocked);
      if (!unlocked) setTimeRemaining(getTimeUntilUnlock(DayType.CHOCOLATE, isActive));
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#5D4037', '#8D6E63', '#D7CCC8', '#ef4444'] // Chocolate & Red
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#5D4037', '#8D6E63', '#D7CCC8', '#ef4444']
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  };

  const handleReveal = () => {
    setStage('reveal_wish');
    triggerConfetti();
  };

  const handleChocoPick = (chocoId: string) => {
    setSelectedChoco(chocoId);
  };

  const handleFinishQuiz = async (answers: string[]) => {
    if (userId) {
      const log = `Chocolate Day: Picked ${selectedChoco} | Quiz: ${answers.join(', ')}`;
      await saveConfession(userId, log, DayType.CHOCOLATE);
    }
    setStage('finale');
  };

  // 1. Show Preloader First
  if (isLoading) return <DayPreloader day={DayType.CHOCOLATE} onFinish={() => setIsLoading(false)} />;

  // 2. Show locked screen if day is locked
  if (isLocked) {
    return (
      <LockedDayScreen
        day={DayType.CHOCOLATE}
        dayTitle="Chocolate Day 🍫"
        timeRemaining={timeRemaining}
        onUnlock={() => setIsLocked(false)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-10 p-6 overflow-x-hidden relative bg-[#3E2723]">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/40 via-transparent to-transparent opacity-50"></div>

      {/* Background Floating Chocolates */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl opacity-10 animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          >
            🍫
          </div>
        ))}
      </div>

      {/* HEADER */}
      <h1 className="text-4xl font-hand font-bold text-amber-50 mb-2 drop-shadow-md z-20 animate-fade-in-down">
        Chocolate Day 🍫
      </h1>

      {/* STAGE 1: SCRATCH CARD */}
      {stage === 'scratch' && (
        <div className="relative w-full max-w-sm flex flex-col items-center animate-fade-in-up mt-8">
          <ScratchCard
            width={320}
            height={320}
            image="https://www.transparenttextures.com/patterns/aluminum.png"
            onReveal={handleReveal}
          >
            <div className="w-full h-full glass-card p-6 flex flex-col items-center justify-center bg-white/95">
              <span className="text-6xl animate-bounce">🎁</span>
              <p className="font-hand font-bold text-xl text-amber-900 mt-4">Scratch Me!</p>
            </div>
          </ScratchCard>
          <p className="text-amber-200 mt-4 animate-pulse">👆 Ander kuch meetha hai...</p>
        </div>
      )}

      {/* STAGE 2: REVEAL WISH */}
      {stage === 'reveal_wish' && (
        <div className="w-full max-w-sm animate-zoom-in text-center mt-10">
          <div className="bg-white/95 p-8 rounded-3xl shadow-2xl border-4 border-amber-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-rose-400 to-amber-400 animate-gradient-x"></div>

            <h2 className="text-3xl font-bold text-rose-600 font-hand mb-4 drop-shadow-sm">Happy Chocolate Day!</h2>
            <div className="text-6xl mb-4 animate-bounce-slow">🍫❤️</div>

            <p className="text-xl text-gray-700 font-medium leading-relaxed mb-6">
              "Tum chocolate se bhi zyada sweet ho! Sach me! 😍"
            </p>

            <button
              onClick={() => setStage('chocolate_box')}
              className="w-full bg-gradient-to-r from-amber-600 to-rose-600 text-white font-bold py-3 rounded-xl shadow-lg hover:scale-105 transition-transform"
            >
              Ha, Pata Hai! 😎
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: VIRTUAL CHOCOLATE BOX */}
      {stage === 'chocolate_box' && (
        <div className="w-full max-w-sm animate-slide-up mt-6">
          <h3 className="text-2xl font-hand font-bold text-amber-100 text-center mb-6">Mere liye ek choose karo 👇</h3>

          {!selectedChoco ? (
            <div className="grid grid-cols-1 gap-4">
              {CHOCOLATES.map(choco => (
                <button
                  key={choco.id}
                  onClick={() => handleChocoPick(choco.id)}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-amber-400/30 p-4 rounded-xl flex items-center gap-4 transition-all hover:scale-102 group"
                >
                  <span className="text-4xl filter drop-shadow-lg group-hover:rotate-12 transition-transform">{choco.emoji}</span>
                  <span className="text-xl font-bold text-amber-100">{choco.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-white/95 p-6 rounded-2xl shadow-xl text-center animate-flip-in-x">
              <span className="text-5xl block mb-2">{CHOCOLATES.find(c => c.id === selectedChoco)?.emoji}</span>
              <p className="text-lg font-bold text-rose-600 mb-6">
                "{CHOCOLATES.find(c => c.id === selectedChoco)?.msg}"
              </p>
              <button
                onClick={() => setStage('quiz')}
                className="bg-rose-500 text-white px-8 py-2 rounded-full font-bold shadow-md hover:bg-rose-600 transition"
              >
                Thoda aur pyaar... 🍬
              </button>
            </div>
          )}
        </div>
      )}

      {/* STAGE 4: QUIZ */}
      {stage === 'quiz' && (
        <div className="w-full max-w-md animate-fade-in-up mt-4">
          <InteractiveQuiz
            questions={CHOCOLATE_QUIZ}
            title="Kuch Meethi Baatein... 🍬"
            themeColor="amber"
            onComplete={handleFinishQuiz}
          />
        </div>
      )}

      {/* STAGE 5: FINALE (WAITING) */}
      {stage === 'finale' && (
        <div className="w-full max-w-sm animate-zoom-in mt-10 text-center">
          <div className="bg-gradient-to-br from-amber-100 to-rose-100 p-8 rounded-[2rem] shadow-2xl border-4 border-white/50 relative overflow-hidden">

            {/* Decorative Elements */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-rose-300 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-300 rounded-full blur-3xl opacity-30"></div>

            <span className="text-7xl block mb-4 animate-bounce-slow filter drop-shadow-md">🧸</span>

            <h2 className="text-3xl font-hand font-bold text-amber-900 mb-2">Teddy Day is Coming...</h2>
            <p className="text-gray-700 mb-6 text-lg leading-relaxed font-medium">
              "Kal taiyaar rehna... <br />
              ek bade se <span className="text-rose-600 font-bold">Hug</span> aur <span className="text-amber-700 font-bold">Cute Surprise</span> ke liye! 🤗"
            </p>

            <div className="inline-block bg-white/50 px-4 py-2 rounded-full text-xs font-bold text-amber-800 tracking-wider">
              KAL MILTE HAIN ❤️
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ChocolateDay;