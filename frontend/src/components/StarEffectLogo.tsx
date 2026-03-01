import { useEffect, useRef } from 'react';

interface StarEffectLogoProps {
  src: string;
  alt: string;
  className?: string;
}

export default function StarEffectLogo({ src, alt, className = '' }: StarEffectLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const logo = logoRef.current;
    if (!canvas || !logo) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match logo
    const updateCanvasSize = () => {
      const rect = logo.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Star particle system
    interface Star {
      x: number;
      y: number;
      size: number;
      opacity: number;
      speed: number;
      twinkleSpeed: number;
      twinklePhase: number;
      angle: number;
      distance: number;
    }

    const stars: Star[] = [];
    const starCount = 15;

    // Initialize stars around the logo
    for (let i = 0; i < starCount; i++) {
      const angle = (Math.PI * 2 * i) / starCount;
      const distance = 40 + Math.random() * 30;
      stars.push({
        x: 0,
        y: 0,
        size: 1.5 + Math.random() * 2,
        opacity: 0.3 + Math.random() * 0.4,
        speed: 0.0005 + Math.random() * 0.001,
        twinkleSpeed: 0.02 + Math.random() * 0.03,
        twinklePhase: Math.random() * Math.PI * 2,
        angle,
        distance,
      });
    }

    let animationId: number;
    let time = 0;

    const animate = () => {
      const rect = logo.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      ctx.clearRect(0, 0, rect.width, rect.height);

      time += 0.016;

      stars.forEach((star) => {
        // Rotate stars slowly around the logo
        star.angle += star.speed;

        // Calculate position
        star.x = centerX + Math.cos(star.angle) * star.distance;
        star.y = centerY + Math.sin(star.angle) * star.distance;

        // Twinkle effect
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
        const currentOpacity = star.opacity * twinkle;

        // Draw star with glow
        ctx.save();
        ctx.globalAlpha = currentOpacity;

        // Outer glow
        const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 4);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 200, 200, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright core
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Star points (4-pointed star)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        for (let i = 0; i < 4; i++) {
          const angle = (Math.PI / 2) * i + time;
          const length = star.size * 2.5;
          ctx.beginPath();
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(star.x + Math.cos(angle) * length, star.y + Math.sin(angle) * length);
          ctx.lineTo(star.x + Math.cos(angle + 0.1) * (length * 0.3), star.y + Math.sin(angle + 0.1) * (length * 0.3));
          ctx.lineTo(star.x + Math.cos(angle - 0.1) * (length * 0.3), star.y + Math.sin(angle - 0.1) * (length * 0.3));
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      });

      // Occasional light burst effect
      if (Math.random() < 0.02) {
        const burstX = centerX + (Math.random() - 0.5) * rect.width * 0.6;
        const burstY = centerY + (Math.random() - 0.5) * rect.height * 0.6;
        const burstSize = 3 + Math.random() * 4;

        ctx.save();
        ctx.globalAlpha = 0.6;
        const burstGradient = ctx.createRadialGradient(burstX, burstY, 0, burstX, burstY, burstSize * 3);
        burstGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        burstGradient.addColorStop(0.5, 'rgba(255, 220, 220, 0.4)');
        burstGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = burstGradient;
        ctx.beginPath();
        ctx.arc(burstX, burstY, burstSize * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className={`relative inline-block ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />
      <img
        ref={logoRef}
        src={src}
        alt={alt}
        className="relative block max-w-full h-auto object-contain"
        style={{ zIndex: 2, display: 'block' }}
      />
    </div>
  );
}
