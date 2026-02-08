import { useState, useRef, useEffect } from 'react';
import { useGetAllPosts } from '../hooks/useQueries';
import VideoReelCard from './VideoReelCard';
import PhotoTextReelCard from './PhotoTextReelCard';
import ReelBottomTabNav from './ReelBottomTabNav';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import LoginPrompt from './LoginPrompt';
import ProfileSetupModal from './ProfileSetupModal';
import { useGetCallerUserProfile } from '../hooks/useQueries';

export default function ReelHome() {
  const { identity } = useInternetIdentity();
  const { data: posts, isLoading } = useGetAllPosts();
  const { data: userProfile, isLoading: profileLoading, isFetched, refetch } = useGetCallerUserProfile();
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Sort posts by timestamp (newest first)
  const sortedPosts = posts ? [...posts].sort((a, b) => Number(b.timestamp - a.timestamp)) : [];

  // Track active reel item for autoplay
  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            setActiveIndex(index);
          }
        });
      },
      {
        root: null,
        threshold: 0.75,
      }
    );

    const items = containerRef.current.querySelectorAll('[data-index]');
    items.forEach((item) => observerRef.current?.observe(item));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [sortedPosts.length]);

  const handleProfileSetupComplete = () => {
    refetch();
  };

  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <LoginPrompt />
      </div>
    );
  }

  if (showProfileSetup) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <ProfileSetupModal open={true} onComplete={handleProfileSetupComplete} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">Loading deeds...</div>
      </div>
    );
  }

  if (sortedPosts.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-white">
        <div className="text-center space-y-4 px-6">
          <h2 className="text-2xl font-bold">No deeds yet</h2>
          <p className="text-white/70">Be the first to share something amazing!</p>
        </div>
        <ReelBottomTabNav />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black overscroll-y-none" ref={containerRef}>
      {sortedPosts.map((post, index) => (
        <div
          key={post.id}
          data-index={index}
          className="h-screen w-full snap-start snap-always flex items-center justify-center relative"
        >
          {post.video ? (
            <VideoReelCard post={post} isVideoMode={true} isActive={activeIndex === index} />
          ) : (
            <PhotoTextReelCard post={post} isActive={activeIndex === index} />
          )}
        </div>
      ))}
      <ReelBottomTabNav />
    </div>
  );
}
