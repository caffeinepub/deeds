import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import SafeImageIcon from './SafeImageIcon';
import { Clock } from 'lucide-react';

interface DeedsBarProps {
  sessionDuration: number; // in milliseconds
  dailyUsage: number; // in milliseconds
  onWarning?: () => void;
  onTimeout?: () => void;
}

const SESSION_LIMIT = 25 * 60 * 1000; // 25 minutes in milliseconds
const WARNING_TIME = 24 * 60 * 1000; // 24 minutes (1 minute before timeout)
const DAILY_LIMIT = 17 * 60 * 60 * 1000; // 17 hours in milliseconds

export default function DeedsBar({ sessionDuration, dailyUsage, onWarning, onTimeout }: DeedsBarProps) {
  const [hasWarned, setHasWarned] = useState(false);

  useEffect(() => {
    // Check for warning (1 minute before timeout)
    if (sessionDuration >= WARNING_TIME && !hasWarned) {
      setHasWarned(true);
      onWarning?.();
    }

    // Check for timeout
    if (sessionDuration >= SESSION_LIMIT) {
      onTimeout?.();
    }
  }, [sessionDuration, hasWarned, onWarning, onTimeout]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getBatteryLevel = () => {
    const percentage = (sessionDuration / SESSION_LIMIT) * 100;
    return Math.min(100, Math.max(0, 100 - percentage));
  };

  const getBatteryIcon = () => {
    const level = getBatteryLevel();
    if (level > 75) return '/assets/generated/battery-full-red-metallic-transparent.dim_64x64.png';
    if (level > 50) return '/assets/generated/battery-75-red-metallic-transparent.dim_64x64.png';
    if (level > 25) return '/assets/generated/battery-50-red-metallic-transparent.dim_64x64.png';
    if (level > 10) return '/assets/generated/battery-25-red-metallic-transparent.dim_64x64.png';
    return '/assets/generated/battery-low-red-metallic-transparent.dim_64x64.png';
  };

  const dailyUsagePercentage = (dailyUsage / DAILY_LIMIT) * 100;
  const dailyUsageHours = (dailyUsage / (60 * 60 * 1000)).toFixed(1);
  const remainingDailyHours = Math.max(0, (DAILY_LIMIT - dailyUsage) / (60 * 60 * 1000)).toFixed(1);
  const remainingSessionTime = Math.max(0, SESSION_LIMIT - sessionDuration);

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-primary flex items-center gap-2">
          <SafeImageIcon
            src="/assets/generated/deedsbar-timer-icon-red-metallic-transparent.dim_64x64.png"
            alt="Timer"
            fallbackIcon={<Clock className="h-6 w-6" />}
            className="h-6 w-6"
          />
          Your Deeds Bar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Session Timer with Battery */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="relative"
                style={{
                  filter: getBatteryLevel() < 25 ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))' : 'none'
                }}
              >
                <SafeImageIcon
                  src={getBatteryIcon()}
                  alt="Battery"
                  fallbackIcon={<Clock className="h-12 w-12" />}
                  className={`h-12 w-12 transition-all duration-500 ${
                    getBatteryLevel() < 25 ? 'animate-pulse' : ''
                  }`}
                />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Session Time
                </p>
                <p className="text-3xl font-bold text-primary tabular-nums">
                  {formatTime(sessionDuration)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Hours : Minutes : Seconds
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-muted-foreground">Battery</p>
              <p className={`text-2xl font-bold tabular-nums ${
                getBatteryLevel() < 25 ? 'text-destructive animate-pulse' : 'text-primary'
              }`}>
                {getBatteryLevel().toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Battery Progress Bar with Animation */}
          <div className="space-y-2">
            <Progress 
              value={getBatteryLevel()} 
              className="h-3 bg-muted shadow-inner"
            />
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                {sessionDuration >= WARNING_TIME ? (
                  <span className="text-destructive font-semibold animate-pulse">
                    ⚠️ Auto-logout in {formatTime(remainingSessionTime)}
                  </span>
                ) : (
                  <span>Time remaining: {formatTime(remainingSessionTime)}</span>
                )}
              </span>
              <span className="text-muted-foreground font-medium">
                25 min limit
              </span>
            </div>
          </div>
        </div>

        {/* Daily Usage Stats */}
        <div className="pt-4 border-t border-border/50 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Today's Total Usage</p>
              <p className="text-xs text-muted-foreground">Daily limit: 17 hours</p>
            </div>
            <p className="text-xl font-bold text-primary tabular-nums">
              {dailyUsageHours}h / 17h
            </p>
          </div>
          <div className="space-y-2">
            <Progress 
              value={Math.min(100, dailyUsagePercentage)} 
              className="h-2.5 bg-muted shadow-inner"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="font-medium">{remainingDailyHours}h remaining today</span>
              <span className="font-medium">{dailyUsagePercentage.toFixed(1)}% used</span>
            </div>
          </div>
        </div>

        {/* Motivational Message */}
        <div className="pt-3 border-t border-border/50">
          <p className="text-sm text-center font-medium text-muted-foreground italic">
            {dailyUsagePercentage < 30 
              ? "🌟 Keep spreading kindness!" 
              : dailyUsagePercentage < 60 
              ? "💪 You're making a difference!" 
              : dailyUsagePercentage < 85
              ? "🎯 Great work today!"
              : "🌙 Amazing effort! Remember to rest"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
