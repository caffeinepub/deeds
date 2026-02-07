import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import VideoReelCard from './VideoReelCard';
import type { Post } from '../hooks/useQueries';

interface VideoModeReelProps {
  posts: Post[];
  onExit: () => void;
}

export default function VideoModeReel({ posts, onExit }: VideoModeReelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const itemHeight = container.clientHeight;
      const newIndex = Math.round(scrollTop / itemHeight);
      setActiveIndex(newIndex);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <Button
        onClick={onExit}
        variant="ghost"
        size="icon"
        className="fixed top-4 right-4 z-[101] bg-black/50 hover:bg-black/70 text-white rounded-full"
        aria-label="Exit video mode"
      >
        <X className="h-6 w-6" />
      </Button>

      <div
        ref={containerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {posts.map((post, index) => (
          <div
            key={post.id}
            className="h-full w-full snap-start snap-always flex items-center justify-center"
          >
            <VideoReelCard
              post={post}
              isActive={index === activeIndex}
              isVideoMode={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
