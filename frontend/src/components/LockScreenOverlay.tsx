import React, { useState, useEffect } from 'react';
import { useDeedsUsage } from '../hooks/useDeedsUsage';

const DAILY_LIMIT_MS = 19 * 60 * 60 * 1000;
const STORAGE_KEY = 'lockScreenDismissed';

function getTodayString(): string {
  return new Date().toDateString();
}

function isDismissedToday(): boolean {
  try {
    const val = sessionStorage.getItem(STORAGE_KEY);
    return val === getTodayString();
  } catch {
    return false;
  }
}

function dismissToday(): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, getTodayString());
  } catch {
    // ignore
  }
}

export default function LockScreenOverlay() {
  const { dailyUsage } = useDeedsUsage();
  const [dismissed, setDismissed] = useState(isDismissedToday);
  const [accepted, setAccepted] = useState(false);

  const limitReached = dailyUsage >= DAILY_LIMIT_MS;

  useEffect(() => {
    if (!limitReached) {
      // Reset dismissal if a new day has started
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored && stored !== getTodayString()) {
        sessionStorage.removeItem(STORAGE_KEY);
        setDismissed(false);
      }
    }
  }, [limitReached]);

  if (!limitReached || dismissed) return null;

  const handleWordClick = () => {
    setAccepted(true);
    dismissToday();
    setDismissed(true);
  };

  const boldWords = [
    { word: 'DAILY', key: 'daily' },
    { word: 'USAGE', key: 'usage' },
    { word: 'LIMIT', key: 'limit' },
    { word: 'REACHED', key: 'reached' },
    { word: 'ACCEPT', key: 'accept' },
    { word: 'TERMS', key: 'terms' },
    { word: 'CONTINUE', key: 'continue' },
    { word: 'FREE', key: 'free' },
    { word: 'WILL', key: 'will' },
  ];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="max-w-md w-full mx-4 bg-card rounded-2xl shadow-2xl overflow-hidden border border-border">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-400 to-blue-500 p-6 text-center">
          <div className="text-5xl mb-2">⏰</div>
          <h1 className="text-2xl font-black text-white tracking-wide">
            {boldWords.slice(0, 4).map((bw) => (
              <button
                key={bw.key}
                onClick={handleWordClick}
                className="hover:text-yellow-300 transition-colors cursor-pointer underline decoration-dotted mx-0.5"
              >
                {bw.word}
              </button>
            ))}
          </h1>
        </div>

        {/* Body */}
        <div className="p-6 text-center space-y-4">
          <p className="text-foreground text-sm leading-relaxed">
            You've reached your{' '}
            <button onClick={handleWordClick} className="font-black text-primary hover:text-primary/80 underline decoration-dotted cursor-pointer">
              19-HOUR
            </button>{' '}
            daily usage limit on Deeds. We care about your wellbeing and encourage you to take a break.
          </p>

          <p className="text-muted-foreground text-sm leading-relaxed">
            To{' '}
            <button onClick={handleWordClick} className="font-black text-foreground hover:text-primary underline decoration-dotted cursor-pointer">
              CONTINUE
            </button>{' '}
            using Deeds, click any{' '}
            <button onClick={handleWordClick} className="font-black text-foreground hover:text-primary underline decoration-dotted cursor-pointer">
              BOLD
            </button>{' '}
            word to{' '}
            <button onClick={handleWordClick} className="font-black text-foreground hover:text-primary underline decoration-dotted cursor-pointer">
              ACCEPT
            </button>{' '}
            our{' '}
            <button onClick={handleWordClick} className="font-black text-foreground hover:text-primary underline decoration-dotted cursor-pointer">
              TERMS
            </button>{' '}
            and acknowledge your usage on your own{' '}
            <button onClick={handleWordClick} className="font-black text-foreground hover:text-primary underline decoration-dotted cursor-pointer">
              FREE
            </button>{' '}
            <button onClick={handleWordClick} className="font-black text-foreground hover:text-primary underline decoration-dotted cursor-pointer">
              WILL
            </button>
            .
          </p>

          <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground">
            💙 Deeds cares about users of all ages. Please take care of yourself.
          </div>

          <button
            onClick={handleWordClick}
            className="w-full py-3 bg-gradient-to-r from-sky-400 to-blue-500 text-white font-black text-lg rounded-xl hover:opacity-90 transition-opacity shadow-lg"
          >
            I ACCEPT — CONTINUE
          </button>
        </div>
      </div>
    </div>
  );
}
