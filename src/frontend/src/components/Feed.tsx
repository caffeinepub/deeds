import { useState, useEffect, useRef } from 'react';
import { useGetAllPosts } from '../hooks/useQueries';
import PostCard from './PostCard';
import CreatePostButton from './CreatePostButton';
import SkeletonPost from './SkeletonPost';
import { Card, CardContent } from './ui/card';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import VideoModeReel from './VideoModeReel';
import { useHorizontalWheelScroll } from '../hooks/useHorizontalWheelScroll';
import SafeImageIcon from './SafeImageIcon';
import { Image } from 'lucide-react';

type FilterType = 'all' | 'following' | 'videos' | 'photos' | 'text';

export default function Feed() {
  const { identity } = useInternetIdentity();
  const { data: posts, isLoading } = useGetAllPosts();
  const [filter, setFilter] = useState<FilterType>('all');
  const [videoModeActive, setVideoModeActive] = useState(false);
  const filterContainerRef = useRef<HTMLDivElement>(null);
  const prevFilterRef = useRef<FilterType>('all');
  const scrollPositionRef = useRef<number>(0);

  useHorizontalWheelScroll(filterContainerRef);

  useEffect(() => {
    if (filter === 'videos' && prevFilterRef.current !== 'videos') {
      scrollPositionRef.current = window.scrollY;
      setVideoModeActive(true);
    }
    prevFilterRef.current = filter;
  }, [filter]);

  const handleExitVideoMode = () => {
    setVideoModeActive(false);
    setFilter('all');
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollPositionRef.current);
    });
  };

  const filteredPosts = posts?.filter((post) => {
    if (filter === 'all') return true;
    if (filter === 'videos') return !!post.video;
    if (filter === 'photos') return !!post.photo && !post.video;
    if (filter === 'text') return !post.photo && !post.video;
    return true;
  }) || [];

  const sortedPosts = [...filteredPosts].sort((a, b) => Number(b.timestamp - a.timestamp));
  const videoPosts = sortedPosts.filter(p => !!p.video);

  if (videoModeActive && videoPosts.length > 0) {
    return (
      <VideoModeReel
        posts={videoPosts}
        onExit={handleExitVideoMode}
      />
    );
  }

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'videos', label: 'Videos' },
    { value: 'photos', label: 'Photos' },
    { value: 'text', label: 'Text' },
  ];

  return (
    <div className="container py-6 pb-24 max-w-2xl mx-auto px-4 relative z-10">
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Feed</h1>
          {identity && <CreatePostButton />}
        </div>

        <div 
          ref={filterContainerRef}
          className="horizontal-scroll-container overflow-x-auto pb-2"
        >
          <div className="flex gap-2 min-w-max">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
                  filter === f.value
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <SkeletonPost key={i} />
          ))}
        </div>
      ) : sortedPosts.length === 0 ? (
        <Card className="shadow-lg border-2">
          <CardContent className="py-16 text-center space-y-4">
            <SafeImageIcon
              src="/assets/generated/empty-feed-premium.dim_400x300.png"
              alt="No posts"
              className="mx-auto mb-4 h-32 w-auto opacity-50"
              fallbackIcon={<Image className="h-32 w-32 mx-auto opacity-50" />}
            />
            <h3 className="text-xl font-semibold">No posts yet</h3>
            <p className="text-muted-foreground">Be the first to share something!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
