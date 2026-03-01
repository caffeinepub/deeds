import { useState } from 'react';
import { useGetAllPosts } from '../hooks/useQueries';
import PostCard from './PostCard';
import SkeletonPost from './SkeletonPost';
import { Card, CardContent } from './ui/card';
import { TrendingUp, Video, Image as ImageIcon, Sparkles } from 'lucide-react';

type FilterType = 'forYou' | 'trending' | 'videos' | 'photos';

export default function DiscoverFeed() {
  const { data: posts, isLoading } = useGetAllPosts();
  const [filter, setFilter] = useState<FilterType>('forYou');

  const filteredPosts = posts?.filter((post) => {
    if (filter === 'videos') return !!post.video;
    if (filter === 'photos') return !!post.photo && !post.video;
    return true;
  }) || [];

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (filter === 'trending') {
      return Number(b.likes - a.likes);
    }
    return Number(b.timestamp - a.timestamp);
  });

  const filters: { value: FilterType; label: string; icon: React.ReactNode }[] = [
    { value: 'forYou', label: 'For You', icon: <Sparkles className="h-4 w-4" /> },
    { value: 'trending', label: 'Trending', icon: <TrendingUp className="h-4 w-4" /> },
    { value: 'videos', label: 'Videos', icon: <Video className="h-4 w-4" /> },
    { value: 'photos', label: 'Photos', icon: <ImageIcon className="h-4 w-4" /> },
  ];

  return (
    <div className="container py-6 max-w-2xl mx-auto px-4">
      <div className="mb-6 space-y-4">
        <h1 className="text-3xl font-bold">Discover</h1>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                filter === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <SkeletonPost key={i} />
          ))}
        </div>
      ) : sortedPosts.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <ImageIcon className="h-32 w-32 mx-auto opacity-50" />
            <h3 className="text-xl font-semibold">No posts yet</h3>
            <p className="text-muted-foreground">Start exploring!</p>
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
