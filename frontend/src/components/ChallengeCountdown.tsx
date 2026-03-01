import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function ChallengeCountdown() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-3">
      <Clock className="h-4 w-4 text-amber-500 animate-pulse" />
      <div className="flex items-center gap-1">
        <TimeUnit value={pad(timeLeft.hours)} label="hrs" />
        <span className="text-amber-400 font-bold text-lg animate-pulse">:</span>
        <TimeUnit value={pad(timeLeft.minutes)} label="min" />
        <span className="text-amber-400 font-bold text-lg animate-pulse">:</span>
        <TimeUnit value={pad(timeLeft.seconds)} label="sec" />
      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl font-bold tabular-nums text-amber-700 leading-none">{value}</span>
      <span className="text-xs text-amber-500 leading-none mt-0.5">{label}</span>
    </div>
  );
}
