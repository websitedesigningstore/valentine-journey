import { User } from '../types';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

export const setSession = (user: User): void => {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('sessionTimestamp', Date.now().toString());
};

export const updateSessionActivity = (): void => {
    localStorage.setItem('sessionTimestamp', Date.now().toString());
};

export const isSessionValid = (): boolean => {
    const timestamp = localStorage.getItem('sessionTimestamp');
    if (!timestamp) return false;

    const elapsed = Date.now() - parseInt(timestamp);
    return elapsed < SESSION_TIMEOUT;
};

export const clearSession = (): void => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('sessionTimestamp');
};

export const getSessionUser = (): User | null => {
    if (!isSessionValid()) {
        clearSession();
        return null;
    }

    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return null;

    return JSON.parse(userStr);
};
