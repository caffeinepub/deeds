import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Battery, Zap } from 'lucide-react';

interface AnimatedDeedsBarProps {
  sessionDuration: number;
  dailyUsage: number;
  onWarning?: () => void;
  onTimeout?: () => void;
}

const SESSION_LIMIT = 25 * 60 * 1000;
const WARNING_TIME = 24 * 60 * 1000;
const DAILY_LIMIT = 17 * 60 * 60 * 1000;

export default function AnimatedDeedsBar({ sessionDuration, dailyUsage, onWarning, onTimeout }: AnimatedDeedsBarProps) {
  const [hasWarned, setHasWarned] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (sessionDuration >= WARNING_TIME && !hasWarned) {
      setHasWarned(true);
      onWarning?.();
    }

    if (sessionDuration >= SESSION_LIMIT) {
      onTimeout?.();
    }
  }, [sessionDuration, hasWarned, onWarning, onTimeout]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const elements: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      type: 'pineapple' | 'teddy';
      size: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
      targetX: number;
      targetY: number;
    }> = [];

    const spacing = canvas.width / 6;
    const centerY = canvas.height / 2;
    const elementSize = 16;

    ['pineapple', 'teddy', 'pineapple', 'teddy', 'pineapple'].forEach((type, index) => {
      elements.push({
        x: spacing * (index + 0.5),
        y: centerY + (Math.random() - 0.5) * 15,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        type: type as 'pineapple' | 'teddy',
        size: elementSize,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.012,
        opacity: 0.85 + Math.random() * 0.15,
        targetX: spacing * (index + 0.5),
        targetY: centerY,
      });
    });

    let streakOffset = 0;

    let animationFrame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createLinearGradient(streakOffset, 0, streakOffset + canvas.width * 0.7, 0);
      gradient.addColorStop(0, 'rgba(135, 206, 250, 0)');
      gradient.addColorStop(0.1, 'rgba(135, 206, 250, 0.2)');
      gradient.addColorStop(0.25, 'rgba(173, 216, 230, 0.4)');
      gradient.addColorStop(0.4, 'rgba(135, 206, 250, 0.6)');
      gradient.addColorStop(0.5, 'rgba(173, 216, 230, 0.7)');
      gradient.addColorStop(0.6, 'rgba(135, 206, 250, 0.6)');
      gradient.addColorStop(0.75, 'rgba(173, 216, 230, 0.4)');
      gradient.addColorStop(0.9, 'rgba(135, 206, 250, 0.2)');
      gradient.addColorStop(1, 'rgba(135, 206, 250, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      streakOffset += 2.5;
      if (streakOffset > canvas.width) {
        streakOffset = -canvas.width * 0.7;
      }

      elements.forEach((el) => {
        const dx = el.targetX - el.x;
        const dy = el.targetY - el.y;
        el.vx += dx * 0.0008;
        el.vy += dy * 0.0008;
        
        el.vx *= 0.96;
        el.vy *= 0.96;
        
        el.x += el.vx;
        el.y += el.vy;
        el.rotation += el.rotationSpeed;

        el.x = Math.max(el.size, Math.min(canvas.width - el.size, el.x));
        el.y = Math.max(el.size, Math.min(canvas.height - el.size, el.y));

        ctx.save();
        ctx.translate(el.x, el.y);
        ctx.rotate(el.rotation);

        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(135, 206, 250, 0.9)';
        ctx.globalAlpha = el.opacity;

        ctx.font = `${el.size}px Arial`;
        ctx.fillStyle = '#87CEEB';
        ctx.strokeStyle = '#5DADE2';
        ctx.lineWidth = 1.2;
        
        const emoji = el.type === 'pineapple' ? '🍍' : '🧸';
        ctx.fillText(emoji, -el.size / 2, el.size / 2);

        ctx.restore();
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

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

  const dailyUsagePercentage = (dailyUsage / DAILY_LIMIT) * 100;
  const dailyUsageHours = (dailyUsage / (60 * 60 * 1000)).toFixed(1);
  const remainingDailyHours = Math.max(0, (DAILY_LIMIT - dailyUsage) / (60 * 60 * 1000)).toFixed(1);
  const remainingSessionTime = Math.max(0, SESSION_LIMIT - sessionDuration);

  return (
    <Card className="border-sky-300/50 bg-gradient-to-br from-sky-50/95 via-blue-50/95 to-cyan-50/95 dark:from-sky-950/70 dark:via-blue-950/70 dark:to-cyan-950/70 shadow-xl overflow-hidden max-w-md mx-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-sky-600 dark:text-sky-400 flex items-center gap-2">
          <Zap className="h-5 w-5 text-sky-500" />
          Your Deeds Battery
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="relative bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900 dark:to-blue-900 rounded-xl p-4 border-2 border-sky-300 dark:border-sky-700 overflow-hidden shadow-inner"
            style={{ minHeight: '120px' }}
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: 1 }}
            />
            
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-sky-700 dark:text-sky-300 uppercase tracking-wider mb-1">
                  Session Time
                </p>
                <p className="text-3xl font-extrabold text-sky-600 dark:text-sky-400 tabular-nums tracking-tight">
                  {formatTime(sessionDuration)}
                </p>
              </div>
              <div className="text-right">
                <Battery className={`h-10 w-10 mb-1 ${
                  getBatteryLevel() < 25 ? 'text-destructive animate-pulse' : 'text-sky-600 dark:text-sky-400'
                }`} />
                <p className={`text-2xl font-extrabold tabular-nums ${
                  getBatteryLevel() < 25 ? 'text-destructive animate-pulse' : 'text-sky-600 dark:text-sky-400'
                }`}>
                  {getBatteryLevel().toFixed(0)}%
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Progress 
              value={getBatteryLevel()} 
              className="h-3 bg-muted shadow-inner [&>div]:bg-gradient-to-r [&>div]:from-sky-400 [&>div]:via-blue-400 [&>div]:to-cyan-400 [&>div]:shadow-md"
            />
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground font-medium">
                {sessionDuration >= WARNING_TIME ? (
                  <span className="text-destructive font-bold animate-pulse">
                    ⚠️ {formatTime(remainingSessionTime)}
                  </span>
                ) : (
                  <span>{formatTime(remainingSessionTime)}</span>
                )}
              </span>
              <span className="text-muted-foreground font-semibold">
                25 min
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-sky-200 dark:border-sky-800 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-foreground">Today's Usage</p>
              <p className="text-[10px] text-muted-foreground">Limit: 17h</p>
            </div>
            <p className="text-lg font-extrabold text-sky-600 dark:text-sky-400 tabular-nums">
              {dailyUsageHours}h
            </p>
          </div>
          <div className="space-y-1">
            <Progress 
              value={Math.min(100, dailyUsagePercentage)} 
              className="h-2 bg-muted shadow-inner [&>div]:bg-gradient-to-r [&>div]:from-sky-400 [&>div]:via-blue-400 [&>div]:to-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span className="font-semibold">{remainingDailyHours}h left</span>
              <span className="font-semibold">{dailyUsagePercentage.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-sky-200 dark:border-sky-800">
          <p className="text-xs text-center font-semibold text-sky-700 dark:text-sky-300 italic">
            {dailyUsagePercentage < 30 
              ? "🌟 Keep spreading kindness!" 
              : dailyUsagePercentage < 60 
              ? "💪 You're making a difference!" 
              : dailyUsagePercentage < 85
              ? "🎯 Great work today!"
              : "🌙 Amazing! Remember to rest"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

