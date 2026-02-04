import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ScratchCard from '../../components/ScratchCard';
import FloatingHearts from '../../components/FloatingHearts';
import LockedDayScreen from '../../components/LockedDayScreen';
import PreviewModeBanner from '../../components/PreviewModeBanner';
import { DayContent, DayType } from '../../types';
import { saveConfession } from '../../services/storage';
import { isDayUnlocked, getTimeUntilUnlock, isUserPreviewMode } from '../../utils/dateLock';
import DayPreloader from '../../components/DayPreloader';

const QUIZ_QUESTIONS = [
  "Kya tumhe roses pasand hain? 🌹",
  "Agar main tumhe rose dekar propose karu, to kya tum logi? 🥺",
  "Kya hamara pyaar is gulab ki tarah hamesha mehakta rahega? ✨",
  "Kya main tumhara pehla aur aakhri rose hoon? ❤️"
];

const RoseDay: React.FC<{ data: DayContent; partnerName: string }> = ({ data, partnerName }) => {
  const { userId } = useParams<{ userId: string }>();

  // Lock state
  const [isLocked, setIsLocked] = useState(!isDayUnlocked(DayType.ROSE));
  const [timeRemaining, setTimeRemaining] = useState(getTimeUntilUnlock(DayType.ROSE));

  // States: 'scratch' -> 'reveal_message' -> 'ask_permission' -> 'offering' -> 'accepted' -> 'quiz' -> 'finished'
  const [stage, setStage] = useState<'scratch' | 'reveal_message' | 'ask_permission' | 'offering' | 'accepted' | 'quiz' | 'finished'>('scratch');
  const [noCount, setNoCount] = useState(0);
  const [clickLog, setClickLog] = useState<string[]>([]);

  // Quiz State
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Check lock status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const unlocked = isDayUnlocked(DayType.ROSE);
      setIsLocked(!unlocked);
      if (!unlocked) {
        setTimeRemaining(getTimeUntilUnlock(DayType.ROSE));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const [isLoading, setIsLoading] = useState(true);

  const logClick = (action: string) => {
    setClickLog(prev => [...prev, `${action} (${new Date().toLocaleTimeString()})`]);
  };

  const handleScratchComplete = () => {
    // Reveal message but wait for user to click Next
    setStage('reveal_message');
  };

  const handleNextAfterScratch = () => {
    setStage('ask_permission');
  };

  const handlePermissionGranted = () => {
    logClick("Permission Granted");
    setNoCount(0); // Reset for next stage
    setStage('offering');
  };

  const handleNoRose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Stop bubbling
    setNoCount(prev => prev + 1);
    logClick(`Tried to say NO to Rose (Attempt ${noCount + 1})`);
  };

  const handleAcceptRose = () => {
    logClick("Accepted Rose");
    setStage('accepted');
    setTimeout(() => setStage('quiz'), 2500);
  };

  const handleQuizAnswer = (answer: string) => {
    logClick(`Q${currentQIndex + 1}: ${answer}`);
    if (currentQIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      handleQuizFinish();
    }
  };

  const handleQuizFinish = async () => {
    setStage('finished');
    if (userId) {
      const interactionSummary = `Rose Day Completed! Log: ${clickLog.join(', ')}`;
      await saveConfession(userId, interactionSummary, DayType.ROSE);
    }

    // Redirect logic
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
    }, 4000);
  };

  // 1. Show Preloader First
  if (isLoading) {
    return <DayPreloader day={DayType.ROSE} onFinish={() => setIsLoading(false)} />;
  }

  // 2. Show Locked Screen if locked
  if (isLocked) {
    return (
      <LockedDayScreen
        day={DayType.ROSE}
        dayTitle="Rose Day 🌹"
        timeRemaining={timeRemaining}
        onUnlock={() => setIsLocked(false)}
      />
    );
  }



  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-rose-50">
        <FloatingHearts />

        {/* HEADER RESTORED */}
        {(stage === 'scratch' || stage === 'reveal_message' || stage === 'ask_permission') && (
          <div className="text-center mb-6 z-10 animate-fade-in-up absolute top-10">
            <h1 className="text-5xl font-hand font-bold text-rose-600 animate-bounce-slow drop-shadow-sm">Rose Day 🌹</h1>
            <p className="text-gray-500 text-sm mt-2 font-medium">Kuch khaas tumhare liye... ✨</p>
          </div>
        )}

        {/* STAGE 1: SCRATCH CARD */}
        {(stage === 'scratch' || stage === 'reveal_message') && (
          <div className="flex flex-col items-center justify-center animate-fade-in-up mt-10 z-10 transition-all duration-500">
            <p className="mb-8 text-2xl text-rose-600 font-bold font-hand animate-pulse drop-shadow-sm">
              {stage === 'scratch' ? "✨ Scratch the Heart! ✨" : "✨ Message Revealed! ✨"}
            </p>

            <div className="relative w-[360px] h-[360px] flex items-center justify-center filter drop-shadow-2xl hover:scale-105 transition-transform duration-500">
              <div className="w-full h-full bg-white shadow-2xl relative flex items-center justify-center" style={{
                clipPath: "path('M180 324 C180 324 24 216 24 120 C24 54 72 12 132 12 C168 12 180 48 180 48 C180 48 192 12 228 12 C288 12 336 54 336 120 C336 216 180 324 180 324Z')"
              }}>
                <ScratchCard width={360} height={360} onReveal={handleScratchComplete}>
                  <div className="w-full h-full flex items-center justify-center bg-rose-100 px-14 py-10 text-center flex-col">
                    <span className="text-5xl mb-4 animate-bounce">🌹</span>
                    <p className="text-xl font-hand text-rose-700 font-bold leading-relaxed drop-shadow-sm break-words w-full">
                      "{data.message || "Happy Rose Day!"}"
                    </p>
                  </div>
                </ScratchCard>
              </div>
            </div>

            {stage === 'reveal_message' && (
              <button
                onClick={handleNextAfterScratch}
                className="mt-8 bg-rose-500 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg animate-bounce hover:bg-rose-600 transition-colors z-20"
              >
                Ek baat puchni thi{partnerName ? ` ${partnerName}` : ''}... 👉👈
              </button>
            )}
          </div>
        )}

        {/* STAGE 2: ASK PERMISSION */}
        {stage === 'ask_permission' && (
          <div className="flex flex-col items-center animate-zoom-in max-w-sm w-full z-20 mt-10">
            <p className="mb-8 text-2xl text-rose-600 font-bold font-hand animate-pulse drop-shadow-sm">
              ✨ Permission Required! ✨
            </p>
            <div className="glass-card p-8 rounded-2xl shadow-xl border border-rose-200 text-center relative">
              <p className="text-2xl font-hand font-bold text-gray-800 mb-8 leading-relaxed">
                "Kya main tumhe ek pyara sa Rose de sakta hu? 🥺"
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handlePermissionGranted}
                  className="w-full bg-rose-500 text-white py-3 rounded-xl font-bold text-xl shadow-lg hover:scale-105 transition-transform"
                >
                  Haan, de do! 🌹
                </button>

                {noCount < 6 && (
                  <button
                    onMouseEnter={handleNoRose} // Desktop hover
                    onClick={handleNoRose}      // Mobile click
                    style={noCount > 0 ? {
                      position: 'absolute',
                      top: `${Math.random() * 200 - 50}px`,
                      left: `${Math.random() * 200 - 100}px`,
                      transition: 'all 0.3s ease-out'
                    } : {}}
                    className="w-full bg-white border-2 border-rose-200 text-rose-400 py-2 rounded-xl font-bold text-lg hover:bg-rose-50 transition-all z-10"
                  >
                    {noCount === 0 ? "Nahi 😒" :
                      noCount === 1 ? "Soch lo? 🤨" :
                        noCount === 2 ? "Pakka? 🥺" :
                          noCount === 3 ? "Dil tod diya 💔" :
                            noCount === 4 ? "Please haan kardo! 😭" : "Okay, I give up... 🏳️"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STAGE 3: OFFERING ROSE */}
        {stage === 'offering' && (
          <div className="flex flex-col items-center animate-zoom-in max-w-sm w-full relative z-20">
            <div className="text-9xl mb-8 animate-float drop-shadow-2xl filter brightness-110">🌹</div>
            <p className="text-xl font-hand text-gray-700 mb-8 text-center italic">
              "Sirf tumhare liye... Kyunki tum is rose se bhi zyada beautiful ho."
            </p>

            <div className="flex flex-col gap-4 w-full relative h-40 items-center">
              {/* YES BUTTON */}
              <button
                onClick={handleAcceptRose}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl hover:scale-105 transition-transform z-20"
              >
                Accept Rose 🤲❤️
              </button>

              {/* RUNAWAY NO BUTTON */}
              {noCount < 6 && (
                <button
                  onMouseEnter={handleNoRose} // Desktop hover
                  onClick={handleNoRose}      // Mobile click
                  style={noCount > 0 ? {
                    position: 'absolute',
                    top: `${Math.random() * 200 - 50}px`,
                    left: `${Math.random() * 200 - 100}px`,
                    transition: 'all 0.3s ease-out'
                  } : {}}
                  className="bg-gray-200 text-gray-600 px-6 py-3 rounded-xl font-bold text-sm shadow hover:bg-gray-300 transition-all z-30"
                >
                  {noCount === 0 ? "Nahi chahiye 😒" :
                    noCount === 1 ? "Soch lo? 🤨" :
                      noCount === 2 ? "Pakka? 🥺" :
                        noCount === 3 ? "Dil tod diya 💔" :
                          noCount === 4 ? "Please lelo na! 😭" : "Okay, I give up... 🏳️"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* STAGE 4: ACCEPTED CELEBRATION */}
        {stage === 'accepted' && (
          <div className="flex flex-col items-center animate-bounce justify-center z-20">
            <div className="text-8xl mb-4">🥰💐</div>
            <h2 className="text-4xl font-bold text-rose-700 font-hand text-center">Yay! Rose Accepted!</h2>
            <p className="text-gray-700 mt-4 text-xl font-bold">Dil khush kar diya! ❤️</p>
          </div>
        )}

        {/* STAGE 5: SEQUENTIAL QUIZ */}
        {stage === 'quiz' && (
          <div className="w-full max-w-md flex flex-col gap-6 animate-fade-in-up z-20">
            <div className="glass-card p-6 rounded-2xl border border-rose-200 shadow-xl bg-white/90 text-center relative overflow-hidden">
              {/* Progress Bar */}
              <div className="absolute top-0 left-0 h-2 bg-rose-500 transition-all duration-300" style={{ width: `${((currentQIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}></div>

              {/* KEEPING THE HEADER AS REQUESTED */}
              <h3 className="text-sm font-bold text-rose-800 mb-6 uppercase tracking-wider mt-4">Thodi si baatein... 💬</h3>

              <h2 className="text-2xl font-hand font-bold text-gray-800 mb-8 leading-snug min-h-[80px] flex items-center justify-center">
                {QUIZ_QUESTIONS[currentQIndex]}
              </h2>

              <div className="flex gap-4">
                <button
                  onClick={() => handleQuizAnswer("YES")}
                  className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white py-4 rounded-xl font-bold text-xl shadow-lg hover:scale-105 transition-transform active:scale-95"
                >
                  YES ❤️
                </button>
                <button
                  onClick={() => handleQuizAnswer("NO")}
                  className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-xl font-bold text-xl shadow hover:bg-gray-200 transition-colors active:scale-95"
                >
                  NO 💔
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 6: FINISHED */}
        {stage === 'finished' && (
          <div className="animate-zoom-in z-20 flex flex-col items-center justify-center mt-20 text-center px-6">
            <div className="text-7xl mb-6 animate-pulse">👩‍❤️‍👨</div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Thank you! ❤️</h1>
            <p className="text-xl text-rose-600 font-hand font-bold mb-6">
              "Tumne mera Rose accept kiya, mera din ban gaya!"
            </p>

            <div className="flex gap-4 justify-center mt-4">
              <span className="text-4xl animate-bounce delay-100">🌹</span>
              <span className="text-4xl animate-bounce delay-200">✨</span>
              <span className="text-4xl animate-bounce delay-300">💍</span>
            </div>

            <p className="text-sm text-gray-400 mt-8 animate-pulse">
              Redirecting to Propose Day...
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default RoseDay;
