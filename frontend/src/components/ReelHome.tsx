import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllPosts } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Home, Compass, PlusCircle, MessageCircle, User, Heart, Share2, Bookmark } from 'lucide-react';
import CreatePostModal from './CreatePostModal';
import { toast } from 'sonner';

// Bottom tab navigation
function BottomNav({ onCreatePost }: { onCreatePost: () => void }) {
  const navigate = useNavigate();

  const tabs = [
    { icon: <Home className="w-5 h-5" />, label: 'Home', path: '/feed' },
    { icon: <Compass className="w-5 h-5" />, label: 'Discover', path: '/discover' },
    { icon: <PlusCircle className="w-6 h-6" />, label: 'Create', path: null },
    { icon: <MessageCircle className="w-5 h-5" />, label: 'Messages', path: '/messages' },
    { icon: <User className="w-5 h-5" />, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => {
              if (tab.path === null) {
                onCreatePost();
              } else {
                navigate({ to: tab.path as any });
              }
            }}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
              tab.label === 'Create'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon}
            <span className="text-xs">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// Single reel card
function ReelCard({ post, isActive }: { post: any; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const getPhotoUrl = (): string | null => {
    if (post?.photo && post.photo.__kind__ === 'Some') {
      try {
        const blob = post.photo.value;
        if (blob && typeof blob.getDirectURL === 'function') return blob.getDirectURL();
      } catch { /* fallback */ }
    }
    return null;
  };

  const getVideoUrl = (): string | null => {
    if (post?.video && post.video.__kind__ === 'Some') {
      try {
        const blob = post.video.value;
        if (blob && typeof blob.getDirectURL === 'function') return blob.getDirectURL();
      } catch { /* fallback */ }
    }
    return null;
  };

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isActive]);

  const photoUrl = getPhotoUrl();
  const videoUrl = getVideoUrl();

  const categoryColors: Record<string, string> = {
    environmental: 'bg-green-500/80',
    communityService: 'bg-blue-500/80',
    actsOfKindness: 'bg-yellow-500/80',
    other: 'bg-purple-500/80',
  };
  const categoryKind = post?.category?.__kind__ ?? 'other';
  const categoryColor = categoryColors[categoryKind] ?? categoryColors.other;

  const categoryLabels: Record<string, string> = {
    environmental: '🌿 Environment',
    communityService: '🤝 Community',
    actsOfKindness: '💛 Kindness',
    other: '✨ Deed',
  };
  const categoryLabel = categoryLabels[categoryKind] ?? '✨ Deed';

  return (
    <div className="relative w-full h-full flex-shrink-0 snap-start bg-black overflow-hidden">
      {/* Background media */}
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          className="absolute inset-0 w-full h-full object-cover"
          loop
          muted
          playsInline
        />
      ) : photoUrl ? (
        <img
          src={photoUrl}
          alt="Post"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center">
          <span className="text-6xl">🌟</span>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

      {/* Category badge */}
      <div className="absolute top-4 left-4">
        <span className={`text-xs text-white font-medium px-2 py-1 rounded-full ${categoryColor}`}>
          {categoryLabel}
        </span>
      </div>

      {/* Caption */}
      <div className="absolute bottom-20 left-4 right-16 text-white">
        <p className="text-sm font-medium leading-relaxed line-clamp-3">{post?.caption}</p>
      </div>

      {/* Action buttons */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5">
        <button
          className="flex flex-col items-center gap-1"
          onClick={() => toast.success('Liked! ❤️')}
        >
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="text-white text-xs">{Number(post?.likes ?? 0)}</span>
        </button>

        <button
          className="flex flex-col items-center gap-1"
          onClick={() => toast.success('Saved to Memory Jar! 🫙')}
        >
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Bookmark className="w-5 h-5 text-white" />
          </div>
          <span className="text-white text-xs">Save</span>
        </button>

        <button
          className="flex flex-col items-center gap-1"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied!');
          }}
        >
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-white text-xs">Share</span>
        </button>
      </div>
    </div>
  );
}

export default function ReelHome() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: posts = [], isLoading } = useGetAllPosts();
  const [activeIndex, setActiveIndex] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Redirect to gate if not authenticated
  useEffect(() => {
    if (!identity) {
      navigate({ to: '/gate' });
    }
  }, [identity, navigate]);

  // Track active reel via scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const height = container.clientHeight;
      const index = Math.round(scrollTop / height);
      setActiveIndex(index);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  if (!identity) return null;

  return (
    <div className="fixed inset-0 bg-black">
      {/* Reel container */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory"
        style={{ scrollbarWidth: 'none' }}
      >
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center snap-start">
            <div className="text-center space-y-3">
              <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              <p className="text-white/70 text-sm">Loading deeds...</p>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center snap-start">
            <div className="text-center space-y-4 px-8">
              <div className="text-6xl">🌱</div>
              <h2 className="text-white text-xl font-bold">No deeds yet</h2>
              <p className="text-white/70 text-sm">Be the first to share a good deed!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium text-sm"
              >
                Share a Deed
              </button>
            </div>
          </div>
        ) : (
          posts.map((post, index) => (
            <div key={post.id} className="w-full h-screen snap-start">
              <ReelCard post={post} isActive={index === activeIndex} />
            </div>
          ))
        )}
      </div>

      {/* Bottom navigation */}
      <BottomNav onCreatePost={() => setShowCreateModal(true)} />

      {/* Create post modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
