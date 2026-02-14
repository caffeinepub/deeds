import { useState, useEffect } from 'react';

const STORAGE_KEY = 'deeds-usage-tracking';
const SESSION_START_KEY = 'deeds-session-start';

interface UsageData {
  date: string;
  totalMs: number;
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function getStoredUsage(): UsageData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function saveUsage(data: UsageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save usage data:', error);
  }
}

function getSessionStart(): number {
  try {
    const stored = sessionStorage.getItem(SESSION_START_KEY);
    if (stored) {
      return parseInt(stored, 10);
    }
  } catch {
    // ignore
  }
  const now = Date.now();
  try {
    sessionStorage.setItem(SESSION_START_KEY, now.toString());
  } catch {
    // ignore
  }
  return now;
}

export function useDeedsUsage() {
  const [sessionStart] = useState(() => getSessionStart());
  const [sessionDuration, setSessionDuration] = useState(0);
  const [dailyUsage, setDailyUsage] = useState(0);

  // Update session duration every second
  useEffect(() => {
    const updateSession = () => {
      const elapsed = Date.now() - sessionStart;
      setSessionDuration(elapsed);
    };

    updateSession();
    const interval = setInterval(updateSession, 1000);
    return () => clearInterval(interval);
  }, [sessionStart]);

  // Load and update daily usage
  useEffect(() => {
    const today = getTodayKey();
    const stored = getStoredUsage();

    if (!stored || stored.date !== today) {
      // New day, reset
      setDailyUsage(0);
      saveUsage({ date: today, totalMs: 0 });
    } else {
      setDailyUsage(stored.totalMs);
    }

    // Update daily usage periodically (every 10 seconds)
    const updateInterval = setInterval(() => {
      const currentSession = Date.now() - sessionStart;
      const newTotal = (stored?.date === today ? stored.totalMs : 0) + currentSession;
      setDailyUsage(newTotal);
      saveUsage({ date: today, totalMs: newTotal });
    }, 10000);

    return () => clearInterval(updateInterval);
  }, [sessionStart]);

  return {
    sessionDuration,
    dailyUsage,
  };
}
