import React, { useState, useEffect } from 'react';
import { getSimulatedDate } from '../../utils/dateUtils';

const WaitingPage: React.FC<{ partnerName: string, isPreviewMode?: boolean, customTitle?: string, customMessage?: string }> = ({ partnerName, isPreviewMode, customTitle, customMessage }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Check both standard query params and hash query params
    const searchParams = new URLSearchParams(window.location.search);
    let isDemo = searchParams.get('demo') === 'true';

    // If not found in standard search, check hash
    if (!isDemo && window.location.hash.includes('?')) {
      const hashParts = window.location.hash.split('?');
      if (hashParts.length > 1) {
        const hashParams = new URLSearchParams(hashParts[1]);
        isDemo = hashParams.get('demo') === 'true';
      }
    }

    // Force demo if preview mode is active from config
    if (isPreviewMode) {
      isDemo = true;
    }

    // Check for nextDay param
    let isNextDay = searchParams.get('nextDay') === 'true';
    if (!isNextDay && window.location.hash.includes('?')) {
      const hashParts = window.location.hash.split('?');
      if (hashParts.length > 1) {
        const hashParams = new URLSearchParams(hashParts[1]);
        isNextDay = hashParams.get('nextDay') === 'true';
      }
    }

    // For demo, ensure we start with a short timer regardless of real date
    let target: Date;
    if (isDemo) {
      target = new Date(Date.now() + 10000); // 10 seconds from now
    } else {
      const now = getSimulatedDate();
      const currentYear = now.getFullYear();
      if (isNextDay) {
        // Dynamic next day target: 
        // If simDate is Feb 7, we want timer to end on Feb 8.
        // So target = now (which is simDate) + 1 day, set to midnight.

        // But wait, 'now' includes time. getSimulatedDate returns *current real time* but shifted date?
        // Actually getSimulatedDate returns `new Date(simDate)`. simDate usually has no time (defaults 00:00).
        // If we are VIEWING Rose Day, simDate is Feb 7.
        // So 'now' is Feb 7. Target should be Feb 8 00:00.

        const nextDay = new Date(now);
        nextDay.setDate(now.getDate() + 1);
        nextDay.setHours(0, 0, 0, 0);
        target = nextDay;
      } else {
        // Default: Target Feb 7 (Start of week)
        target = new Date(currentYear, 1, 7, 0, 0, 0);
      }
    }

    const calculateTimeLeft = () => {
      const now = new Date(); // Use real time for countdown progression
      const difference = target.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        // Timer finished
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });

        // If it was a 'nextDay' wait (or real timer), we should reload to let PartnerRoute 
        // calculate the new day.
        if (isNextDay) {
          const baseUrl = window.location.href.split('?')[0].split('#')[0];
          // We need to UPDATE simDate to the Target Date (Next Day)
          // Read current simDate
          const params = new URLSearchParams(window.location.search);
          let currentSim = params.get('simDate');
          if (!currentSim && window.location.hash.includes('?')) {
            const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
            currentSim = hashParams.get('simDate');
          }

          let nextSimDate = '';
          if (currentSim) {
            const d = new Date(currentSim);
            d.setDate(d.getDate() + 1);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            nextSimDate = `${yyyy}-${mm}-${dd}`;
          }

          // Reload with new simDate and WITHOUT nextDay param
          let newUrl = `${baseUrl}#/v/${window.location.hash.split('/')[2].split('?')[0]}`; // Reconstruct path
          // Actually referencing userId might be tricky if not passed.
          // Easier: Just use window.location.hash logic but replacing query
          // window.location.hash might be #/v/123?foo=bar
          const hashPath = window.location.hash.split('?')[0];

          if (nextSimDate) {
            window.location.href = `${baseUrl}${hashPath}?simDate=${nextSimDate}`;
          } else {
            // Fallback if no simDate found (Real time but forcing reload)
            window.location.href = `${baseUrl}${hashPath}`;
          }
          window.location.reload();
        } else if (!isDemo) {
          // For standard flow, just reload to check if day started
          window.location.reload();
        }
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-transparent">
      <div className="animate-float mb-8 text-8xl drop-shadow-lg">⏳</div>

      <h1 className="text-4xl md:text-5xl font-hand font-bold text-rose-700 mb-6 drop-shadow-sm">
        {customTitle || "Sabar ka fal... ❤️"}
      </h1>

      <div className="glass-card p-8 rounded-2xl max-w-lg w-full shadow-2xl border border-white/40 mb-8 backdrop-blur-sm">
        <p className="text-xl text-gray-800 mb-6 font-medium leading-relaxed">
          "{customMessage || "Tumhare liye kuch khaas tayaar ho raha hai... bas thoda sa intezaar!"}"
        </p>

        <div className="grid grid-cols-4 gap-4 text-rose-600">
          <div className="flex flex-col">
            <span className="text-3xl font-bold">{timeLeft.days}</span>
            <span className="text-xs uppercase tracking-wide">Days</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold">{timeLeft.hours}</span>
            <span className="text-xs uppercase tracking-wide">Hours</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold">{timeLeft.minutes}</span>
            <span className="text-xs uppercase tracking-wide">Mins</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold">{timeLeft.seconds}</span>
            <span className="text-xs uppercase tracking-wide">Secs</span>
          </div>
        </div>
      </div>

      <p className="text-rose-500 animate-pulse font-semibold mb-4">
        Coming Soon for you{partnerName ? `, ${partnerName}` : ''}...
      </p>

      {/* Demo Only: Link to start rose day */}
      {timeLeft.seconds === 0 && timeLeft.minutes === 0 && timeLeft.hours === 0 && timeLeft.days === 0 && (
        <button
          onClick={() => {
            // Handle HashRouter URL update
            let newUrl = window.location.href;
            // Remove existing query params to avoid stacking
            if (newUrl.includes('?')) {
              newUrl = newUrl.split('?')[0];
            }
            // Determine next date based on current simDate
            // If simDate is Feb 7, go to Feb 8. If none, go to Feb 7.
            const params = new URLSearchParams(window.location.search);
            let currentSim = params.get('simDate');
            if (!currentSim && window.location.hash.includes('?')) {
              const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
              currentSim = hashParams.get('simDate');
            }

            let nextDate = `${new Date().getFullYear()}-02-07`; // Use current year
            if (currentSim) {
              const dateObj = new Date(currentSim);
              dateObj.setDate(dateObj.getDate() + 1); // Next day
              const yyyy = dateObj.getFullYear();
              const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
              const dd = String(dateObj.getDate()).padStart(2, '0');
              nextDate = `${yyyy}-${mm}-${dd}`;
            }

            // Append simDate
            window.location.href = `${newUrl}?simDate=${nextDate}`;
            window.location.reload();
          }}
          className="bg-rose-500 text-white px-6 py-2 rounded-full font-bold animate-bounce shadow-lg"
        >
          Enter Next Day (Propose Day) ➡️
        </button>
      )}
    </div>
  );
};

export default WaitingPage;
