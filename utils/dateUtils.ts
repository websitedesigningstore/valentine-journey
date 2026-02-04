import { DayType } from '../types';

// Helper to allow testing different dates via URL param ?simDate=2024-02-07
export const getSimulatedDate = (): Date => {
  // 1. Try standard query params (before hash)
  const params = new URLSearchParams(window.location.search);
  const simDate = params.get('simDate');
  if (simDate) return new Date(simDate);

  // 2. Try hash query params (after hash, common in HashRouter)
  // Example: http://site.com/#/v/123?simDate=2024-02-07
  if (window.location.hash.includes('?')) {
    const hashParts = window.location.hash.split('?');
    if (hashParts.length > 1) {
      const hashParams = new URLSearchParams(hashParts[1]);
      const hashSimDate = hashParams.get('simDate');
      if (hashSimDate) return new Date(hashSimDate);
    }
  }

  return new Date();
};

export const getCurrentDayType = (): DayType => {
  const now = getSimulatedDate();
  const month = now.getMonth(); // 0-indexed, Feb is 1
  const date = now.getDate();

  // STRICT VALENTINE WEEK LOGIC

  // If not February, handle pre/post logic
  if (month !== 1) {
    if (month < 1) return DayType.WAITING; // January or before
    return DayType.FINISHED; // March or after
  }

  // Before Feb 7 -> WAITING
  if (date < 7) return DayType.WAITING;

  // Valentine Week Days
  switch (date) {
    case 7: return DayType.ROSE;
    case 8: return DayType.PROPOSE;
    case 9: return DayType.CHOCOLATE;
    case 10: return DayType.TEDDY;
    case 11: return DayType.PROMISE;
    case 12: return DayType.HUG;
    case 13: return DayType.KISS;
    case 14: return DayType.VALENTINE;
    default: return DayType.FINISHED;
  }
};

export const getNextDay = (current: DayType): DayType => {
  switch (current) {
    case DayType.WAITING: return DayType.ROSE;
    case DayType.ROSE: return DayType.PROPOSE;
    case DayType.PROPOSE: return DayType.CHOCOLATE;
    case DayType.CHOCOLATE: return DayType.TEDDY;
    case DayType.TEDDY: return DayType.PROMISE;
    case DayType.PROMISE: return DayType.HUG;
    case DayType.HUG: return DayType.KISS;
    case DayType.KISS: return DayType.VALENTINE;
    default: return DayType.FINISHED;
  }
};

export const getDaysLeft = (): number => {
  const now = getSimulatedDate();
  const target = new Date(now.getFullYear(), 1, 7); // Count down to Feb 7
  if (now.getDate() >= 7 && now.getMonth() === 1) {
    return 0; // Already started
  }
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 3600 * 24));
};
