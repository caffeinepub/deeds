import React, { useEffect, useRef } from 'react';
import { useDeedsUsage } from '../hooks/useDeedsUsage';

const DAILY_LIMIT_MS = 19 * 60 * 60 * 1000; // 19 hours

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

interface FloatingIcon {
  x: number;
  y: number;
  vx: number;
  vy: number;
  src: string;
  size: number;
}

export default function DeedsBar() {
  const { sessionDuration, dailyUsage } = useDeedsUsage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const iconsRef = useRef<FloatingIcon[]>([]);
  const animFrameRef = useRef<number>(0);
  const imagesRef = useRef<{ [key: string]: HTMLImageElement }>({});

  const dailyMs = dailyUsage;
  const progress = Math.min(1, dailyMs / DAILY_LIMIT_MS);
  const remaining = Math.max(0, DAILY_LIMIT_MS - dailyMs);

  // Initialize floating icons
  useEffect(() => {
    const iconSources = [
      '/assets/generated/bear-icon.dim_128x128.png',
      '/assets/generated/pineapple-icon.dim_128x128.png',
      '/assets/generated/monkey-icon.dim_128x128.png',
    ];

    // Preload images
    iconSources.forEach((src) => {
      const img = new Image();
      img.src = src;
      imagesRef.current[src] = img;
    });

    // Initialize icon positions
    iconsRef.current = iconSources.map((src, i) => ({
      x: 60 + i * 100,
      y: 20 + Math.random() * 20,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.3,
      src,
      size: 28,
    }));
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bgImg = new Image();
    bgImg.src = '/assets/generated/lightning-bg.dim_800x400.png';

    const animate = () => {
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      // Background: light baby blue lightning
      if (bgImg.complete && bgImg.naturalWidth > 0) {
        ctx.drawImage(bgImg, 0, 0, W, H);
      } else {
        // Fallback gradient
        const grad = ctx.createLinearGradient(0, 0, W, 0);
        grad.addColorStop(0, '#bfefff');
        grad.addColorStop(0.5, '#87ceeb');
        grad.addColorStop(1, '#b0e0ff');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Lightning streaks
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(W * 0.2, 0);
        ctx.lineTo(W * 0.25, H * 0.4);
        ctx.lineTo(W * 0.22, H * 0.4);
        ctx.lineTo(W * 0.28, H);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(W * 0.7, 0);
        ctx.lineTo(W * 0.73, H * 0.5);
        ctx.lineTo(W * 0.71, H * 0.5);
        ctx.lineTo(W * 0.75, H);
        ctx.stroke();
      }

      // Update and draw floating icons (behind the time display)
      iconsRef.current.forEach((icon) => {
        icon.x += icon.vx;
        icon.y += icon.vy;

        // Bounce off walls
        if (icon.x < icon.size / 2 || icon.x > W - icon.size / 2) icon.vx *= -1;
        if (icon.y < icon.size / 2 || icon.y > H - icon.size / 2) icon.vy *= -1;

        const img = imagesRef.current[icon.src];
        if (img && img.complete && img.naturalWidth > 0) {
          ctx.globalAlpha = 0.7;
          ctx.drawImage(img, icon.x - icon.size / 2, icon.y - icon.size / 2, icon.size, icon.size);
          ctx.globalAlpha = 1;
        } else {
          // Emoji fallback
          ctx.font = `${icon.size}px serif`;
          ctx.globalAlpha = 0.7;
          const emoji = icon.src.includes('bear') ? '🐻' : icon.src.includes('pineapple') ? '🍍' : '🐵';
          ctx.fillText(emoji, icon.x - icon.size / 2, icon.y + icon.size / 2);
          ctx.globalAlpha = 1;
        }
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className="rounded-xl overflow-hidden shadow-md border border-border">
      {/* Canvas background with floating icons */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={80}
          className="w-full h-20 block"
          style={{ imageRendering: 'auto' }}
        />

        {/* Time overlay - on top of canvas */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1 text-center">
            <div className="text-white font-mono font-bold text-lg leading-none">
              {formatTime(sessionDuration)}
            </div>
            <div className="text-white/80 text-xs mt-0.5">
              {formatTime(remaining)} remaining today
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-sky-100 px-3 py-2">
        <div className="flex items-center justify-between text-xs text-sky-700 mb-1">
          <span>Daily Usage</span>
          <span>{Math.round(progress * 100)}% of 19h</span>
        </div>
        <div className="h-2 bg-sky-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${progress * 100}%`,
              background: progress > 0.8
                ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                : progress > 0.5
                ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                : 'linear-gradient(90deg, #38bdf8, #0ea5e9)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
