import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ValentineConfig, DayType } from '../types';
import { getUserConfig, getUser } from '../services/storage';
import { getCurrentDayType, getNextDay } from '../utils/dateUtils';
import MusicPlayer from '../components/MusicPlayer';
import FloatingHearts from '../components/FloatingHearts';

// Lazy load day components
import WaitingPage from './days/WaitingPage';
import RoseDay from './days/RoseDay';
import ProposeDay from './days/ProposeDay';
import ChocolateDay from './days/ChocolateDay';
import TeddyDay from './days/TeddyDay';
import PromiseDay from './days/PromiseDay';
import HugDay from './days/HugDay';
import KissDay from './days/KissDay';
import ValentineDay from './days/ValentineDay';
import FinishedPage from './days/FinishedPage';

const PartnerRoute: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [config, setConfig] = useState<ValentineConfig | null>(null);
  const [partnerName, setPartnerName] = useState<string>('');
  const [currentDay, setCurrentDay] = useState<DayType>(DayType.WAITING);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      try {
        const [data, user] = await Promise.all([
          getUserConfig(userId),
          getUser(userId)
        ]);
        setConfig(data);
        if (user) setPartnerName(user.partnerName);

        const params = new URLSearchParams(window.location.search);
        let forceWaiting = params.get('nextDay') === 'true';
        let directDay = params.get('day'); // Check for direct day link

        // Check hash params too (Bit messy with HashRouter + Search params mixing)
        if (window.location.hash.includes('?')) {
          const hashParts = window.location.hash.split('?');
          if (hashParts.length > 1) {
            const hashParams = new URLSearchParams(hashParts[1]);
            if (!forceWaiting) forceWaiting = hashParams.get('nextDay') === 'true';
            if (!directDay) directDay = hashParams.get('day');
          }
        }

        if (directDay && Object.values(DayType).includes(directDay as DayType)) {
          // DIRECT DEEP LINK FOUND
          setCurrentDay(directDay as DayType);
          setIsLocked(false);
        } else if (forceWaiting) {
          const today = getCurrentDayType();
          const nextDay = getNextDay(today);
          setCurrentDay(nextDay);
          setIsLocked(true);
        } else {
          const today = getCurrentDayType();
          setCurrentDay(today);
          setIsLocked(false);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  if (loading) return <div className="h-screen flex items-center justify-center text-rose-500 animate-pulse">Loading Magic...</div>;
  if (!config) return <div className="h-screen flex items-center justify-center text-gray-500">Link Invalid or Expired</div>;

  const renderDay = () => {
    switch (currentDay) {
      case DayType.WAITING: return <WaitingPage partnerName={config.days[DayType.WAITING].message} isPreviewMode={!config.isActive} />;
      case DayType.ROSE: return <RoseDay data={config.days[DayType.ROSE]} partnerName={partnerName} isActive={config.isActive ?? false} />;
      case DayType.PROPOSE: return <ProposeDay data={config.days[DayType.PROPOSE]} partnerName={partnerName} isActive={config.isActive ?? false} />;
      case DayType.CHOCOLATE: return <ChocolateDay data={config.days[DayType.CHOCOLATE]} partnerName={partnerName} isActive={config.isActive ?? false} />;
      case DayType.TEDDY: return <TeddyDay data={config.days[DayType.TEDDY]} partnerName={partnerName} isActive={config.isActive ?? false} />;
      case DayType.PROMISE: return <PromiseDay data={config.days[DayType.PROMISE]} partnerName={partnerName} isActive={config.isActive ?? false} />;
      case DayType.HUG: return <HugDay data={config.days[DayType.HUG]} partnerName={partnerName} isActive={config.isActive ?? false} />;
      case DayType.KISS: return <KissDay data={config.days[DayType.KISS]} partnerName={partnerName} isActive={config.isActive ?? false} />;
      case DayType.VALENTINE: return <ValentineDay data={config.days[DayType.VALENTINE]} userId={userId!} isActive={config.isActive ?? false} />;
      case DayType.FINISHED: return <FinishedPage />;
      default: return <WaitingPage partnerName="" isPreviewMode={!config.isActive} />;
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <MusicPlayer />
      <FloatingHearts />
      <div className="relative z-10 h-full">
        {renderDay()}
      </div>
    </div>
  );
};

export default PartnerRoute;
