import { useEffect, useRef } from 'react';
import { useWeather } from '../hooks/useWeather';

interface WeatherBackgroundProps {
  className?: string;
}

export default function WeatherBackground({ className = '' }: WeatherBackgroundProps) {
  const { weather } = useWeather();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !weather) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }

    const particles: Particle[] = [];

    // Create particles based on weather condition
    const createParticles = () => {
      particles.length = 0;
      const count = weather.condition === 'rainy' ? 150 : weather.condition === 'snowy' ? 100 : 0;

      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: weather.condition === 'rainy' ? Math.random() * 2 - 1 : Math.random() * 1 - 0.5,
          vy: weather.condition === 'rainy' ? Math.random() * 5 + 5 : Math.random() * 2 + 1,
          size: weather.condition === 'rainy' ? Math.random() * 2 + 1 : Math.random() * 4 + 2,
          opacity: Math.random() * 0.5 + 0.3,
        });
      }
    };

    createParticles();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw particles
      particles.forEach((particle) => {
        ctx.save();
        ctx.globalAlpha = particle.opacity;

        if (weather.condition === 'rainy') {
          // Rain drops
          ctx.strokeStyle = 'rgba(174, 194, 224, 0.6)';
          ctx.lineWidth = particle.size;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(particle.x + particle.vx * 2, particle.y + particle.vy * 2);
          ctx.stroke();
        } else if (weather.condition === 'snowy') {
          // Snowflakes
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Reset particle if out of bounds
        if (particle.y > canvas.height) {
          particle.y = -10;
          particle.x = Math.random() * canvas.width;
        }
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.x = Math.random() * canvas.width;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [weather]);

  if (!weather) return null;

  // Background gradient based on weather and time
  const getBackgroundGradient = () => {
    const { condition, isDay } = weather;

    if (!isDay) {
      // Night gradients
      return 'linear-gradient(to bottom, oklch(0.20 0.03 280) 0%, oklch(0.16 0.02 280) 100%)';
    }

    // Day gradients
    switch (condition) {
      case 'sunny':
        return 'linear-gradient(to bottom, oklch(0.75 0.08 240) 0%, oklch(0.85 0.06 220) 100%)';
      case 'cloudy':
        return 'linear-gradient(to bottom, oklch(0.65 0.04 250) 0%, oklch(0.75 0.03 240) 100%)';
      case 'rainy':
        return 'linear-gradient(to bottom, oklch(0.50 0.05 260) 0%, oklch(0.60 0.04 250) 100%)';
      case 'snowy':
        return 'linear-gradient(to bottom, oklch(0.80 0.02 270) 0%, oklch(0.90 0.01 260) 100%)';
      case 'clear':
        return 'linear-gradient(to bottom, oklch(0.70 0.10 240) 0%, oklch(0.80 0.08 230) 100%)';
      default:
        return 'linear-gradient(to bottom, oklch(0.75 0.08 240) 0%, oklch(0.85 0.06 220) 100%)';
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 transition-all duration-1000 ${className}`}
        style={{
          background: getBackgroundGradient(),
          zIndex: -2,
        }}
      />
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: -1 }}
      />
    </>
  );
}
