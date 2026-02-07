import { useState, useEffect, useRef } from 'react';
import { useGetAllPosts } from '../hooks/useQueries';
import PostCard from './PostCard';
import SkeletonPost from './SkeletonPost';
import { Card, CardContent } from './ui/card';
import VideoModeReel from './VideoModeReel';
import { useHorizontalWheelScroll } from '../hooks/useHorizontalWheelScroll';
import SafeImageIcon from './SafeImageIcon';
import { Compass } from 'lucide-react';

type DiscoverFilter = 'forYou' | 'trending' | 'videos' | 'photos';

export default function DiscoverFeed() {
  const { data: posts, isLoading } = useGetAllPosts();
  const [filter, setFilter] = useState<DiscoverFilter>('forYou');
  const [videoModeActive, setVideoModeActive] = useState(false);
  const filterContainerRef = useRef<HTMLDivElement>(null);
  const prevFilterRef = useRef<DiscoverFilter>('forYou');
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
    setFilter('forYou');
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollPositionRef.current);
    });
  };

  const getFilteredPosts = () => {
    if (!posts) return [];

    let filtered = [...posts];

    if (filter === 'videos') {
      filtered = filtered.filter(p => !!p.video);
    } else if (filter === 'photos') {
      filtered = filtered.filter(p => !!p.photo && !p.video);
    } else if (filter === 'trending') {
      filtered.sort((a, b) => Number(b.likes - a.likes));
    } else {
      const engagementScore = (p: typeof posts[0]) => Number(p.likes) * 2 + Number(p.comments);
      filtered.sort((a, b) => engagementScore(b) - engagementScore(a));
    }

    return filtered;
  };

  const filteredPosts = getFilteredPosts();
  const videoPosts = filteredPosts.filter(p => !!p.video);

  if (videoModeActive && videoPosts.length > 0) {
    return (
      <VideoModeReel
        posts={videoPosts}
        onExit={handleExitVideoMode}
      />
    );
  }

  const filters: { value: DiscoverFilter; label: string }[] = [
    { value: 'forYou', label: 'For You' },
    { value: 'trending', label: 'Trending' },
    { value: 'videos', label: 'Videos' },
    { value: 'photos', label: 'Photos' },
  ];

  return (
    <div className="container py-6 pb-24 max-w-2xl mx-auto px-4 relative z-10">
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-3">
          <SafeImageIcon
            src="/assets/generated/discover-icon-transparent.dim_64x64.png"
            alt="Discover"
            className="h-10 w-10"
            fallbackIcon={<Compass className="h-10 w-10 text-primary" />}
          />
          <h1 className="text-3xl font-bold">Discover</h1>
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
      ) : filteredPosts.length === 0 ? (
        <Card className="shadow-lg border-2">
          <CardContent className="py-16 text-center space-y-4">
            <SafeImageIcon
              src="/assets/generated/empty-feed-premium.dim_400x300.png"
              alt="No content"
              className="mx-auto mb-4 h-32 w-auto opacity-50"
              fallbackIcon={<Compass className="h-32 w-32 mx-auto opacity-50" />}
            />
            <h3 className="text-xl font-semibold">No content to discover yet</h3>
            <p className="text-muted-foreground">Check back soon for new posts!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
