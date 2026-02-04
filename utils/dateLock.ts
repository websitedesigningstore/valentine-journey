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
 * Check if admin has forced a mode globally
 */
const getAdminForcedMode = (): 'demo' | 'live' | null => {
    const adminMode = localStorage.getItem('admin_forced_mode');
    if (adminMode === 'demo' || adminMode === 'live') {
        return adminMode;
    }
    return null;
};

/**
 * Get user's mode preference from URL or localStorage
 * Supports both regular query params and hash-based routing
 */
const getUserModePreference = (): 'demo' | 'live' => {
    // Check URL parameters - both regular and hash-based
    // For hash routing like: /#/v/userId?mode=demo
    const hash = window.location.hash;
    if (hash.includes('?')) {
        const hashParams = new URLSearchParams(hash.split('?')[1]);
        const hashMode = hashParams.get('mode');
        if (hashMode === 'demo' || hashMode === 'live') {
            // Store in localStorage for persistence
            localStorage.setItem('user_mode_preference', hashMode);
            return hashMode;
        }

        // Check old demo parameter for backward compatibility
        if (hashParams.get('demo') === 'true') {
            localStorage.setItem('user_mode_preference', 'demo');
            return 'demo';
        }
    }

    // Also check regular query params (for non-hash URLs)
    const params = new URLSearchParams(window.location.search);
    const urlMode = params.get('mode');
    if (urlMode === 'demo' || urlMode === 'live') {
        localStorage.setItem('user_mode_preference', urlMode);
        return urlMode;
    }

    // Check old demo parameter
    if (params.get('demo') === 'true') {
        localStorage.setItem('user_mode_preference', 'demo');
        return 'demo';
    }

    // Check localStorage
    const storedMode = localStorage.getItem('user_mode_preference');
    if (storedMode === 'demo' || storedMode === 'live') {
        return storedMode;
    }

    // Default to live mode
    return 'live';
};

/**
 * Check if demo mode is enabled (considering admin override)
 */
export const isDemoMode = (): boolean => {
    // Admin override takes precedence
    const adminMode = getAdminForcedMode();
    if (adminMode !== null) {
        return adminMode === 'demo';
    }

    // Otherwise use user preference
    return getUserModePreference() === 'demo';
};

/**
 * Set demo mode (admin override)
 */
export const setDemoMode = (enabled: boolean): void => {
    if (enabled) {
        localStorage.setItem('admin_forced_mode', 'demo');
        localStorage.setItem('demo_start_time', Date.now().toString());
    } else {
        localStorage.setItem('admin_forced_mode', 'live');
        localStorage.removeItem('demo_start_time');
    }
};

/**
 * Clear admin override (let users choose)
 */
export const clearAdminOverride = (): void => {
    localStorage.removeItem('admin_forced_mode');
};

/**
 * Check if user is in preview mode (not admin forced)
 */
export const isUserPreviewMode = (): boolean => {
    const adminMode = getAdminForcedMode();
    if (adminMode !== null) {
        return false; // Admin has overridden
    }
    return getUserModePreference() === 'demo';
};

/**
 * Get the unlock date for a specific day
 */
export const getDayUnlockDate = (day: DayType): Date | undefined => {
    return DAY_DATES[day];
};

/**
 * Check if a day is unlocked
 */
export const isDayUnlocked = (day: DayType): boolean => {
    // WAITING and FINISHED are always unlocked
    if (day === DayType.WAITING || day === DayType.FINISHED) {
        return true;
    }

    const demoMode = isDemoMode();

    if (demoMode) {
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
 */
export const getTimeUntilUnlock = (day: DayType): number => {
    // WAITING and FINISHED have no countdown
    if (day === DayType.WAITING || day === DayType.FINISHED) {
        return 0;
    }

    const demoMode = isDemoMode();

    if (demoMode) {
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
