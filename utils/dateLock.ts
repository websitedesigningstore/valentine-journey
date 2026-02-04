import { DayType } from '../types';

// Valentine's Week 2026 dates - only for actual Valentine days
const DAY_DATES: Partial<Record<DayType, Date>> = {
    [DayType.ROSE]: new Date(2026, 1, 7, 0, 0, 0), // Feb 7, 12:00 AM
    [DayType.PROPOSE]: new Date(2026, 1, 8, 0, 0, 0), // Feb 8, 12:00 AM
    [DayType.CHOCOLATE]: new Date(2026, 1, 9, 0, 0, 0), // Feb 9, 12:00 AM
    [DayType.TEDDY]: new Date(2026, 1, 10, 0, 0, 0), // Feb 10, 12:00 AM
    [DayType.PROMISE]: new Date(2026, 1, 11, 0, 0, 0), // Feb 11, 12:00 AM
    [DayType.HUG]: new Date(2026, 1, 12, 0, 0, 0), // Feb 12, 12:00 AM
    [DayType.KISS]: new Date(2026, 1, 13, 0, 0, 0), // Feb 13, 12:00 AM
    [DayType.VALENTINE]: new Date(2026, 1, 14, 0, 0, 0), // Feb 14, 12:00 AM
};

const DEMO_COUNTDOWN_SECONDS = 10; // 10 seconds for demo mode

/**
 * Get the unlock date for a specific day
 */
export const getDayUnlockDate = (day: DayType): Date | undefined => {
    return DAY_DATES[day];
};

/**
 * Check if a day is unlocked
 * @param day The day to check
 * @param isActive If true, checks REAL dates (Live). If false, checks DEMO timer (Preview).
 */
export const isDayUnlocked = (day: DayType, isActive: boolean = true): boolean => {
    // WAITING and FINISHED are always unlocked
    if (day === DayType.WAITING || day === DayType.FINISHED) {
        return true;
    }

    if (!isActive) {
        // Demo mode: check if 10 seconds have passed since demo start
        const demoStartTime = localStorage.getItem('demo_start_time');
        if (!demoStartTime) {
            // First time in demo mode, set start time
            localStorage.setItem('demo_start_time', Date.now().toString());
            return false;
        }
        const elapsedSeconds = (Date.now() - parseInt(demoStartTime)) / 1000;
        return elapsedSeconds >= DEMO_COUNTDOWN_SECONDS;
    } else {
        // Live mode: check actual date
        const unlockDate = getDayUnlockDate(day);
        if (!unlockDate) return true; // If no date set, unlock by default
        const now = new Date();
        return now >= unlockDate;
    }
};

/**
 * Get time remaining until unlock (in milliseconds)
 * @param day The day to check
 * @param isActive If true, calculates based on REAL dates. If false, based on DEMO timer.
 */
export const getTimeUntilUnlock = (day: DayType, isActive: boolean = true): number => {
    // WAITING and FINISHED have no countdown
    if (day === DayType.WAITING || day === DayType.FINISHED) {
        return 0;
    }

    if (!isActive) {
        // Demo mode: calculate remaining time from 10 seconds
        const demoStartTime = localStorage.getItem('demo_start_time');
        if (!demoStartTime) {
            // Set start time if not set
            localStorage.setItem('demo_start_time', Date.now().toString());
            return DEMO_COUNTDOWN_SECONDS * 1000;
        }
        const elapsedMs = Date.now() - parseInt(demoStartTime);
        const remainingMs = (DEMO_COUNTDOWN_SECONDS * 1000) - elapsedMs;
        return Math.max(0, remainingMs);
    } else {
        // Live mode: calculate time until midnight
        const unlockDate = getDayUnlockDate(day);
        if (!unlockDate) return 0;
        const now = new Date();
        const remainingMs = unlockDate.getTime() - now.getTime();
        return Math.max(0, remainingMs);
    }
};

/**
 * Format time remaining as object with days, hours, minutes, seconds
 */
export const formatTimeRemaining = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);

    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    return { days, hours, minutes, seconds };
};
