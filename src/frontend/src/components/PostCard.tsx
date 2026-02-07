import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { MoreHorizontal, TrendingUp } from 'lucide-react';
import { useGetUserProfile, type Post } from '../hooks/useQueries';
import { Badge } from './ui/badge';
import UserProfileModal from './UserProfileModal';
import ModerationWarningBanner from './ModerationWarningBanner';
import ReactionButtons from './ReactionButtons';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [showProfile, setShowProfile] = useState(false);
  const { data: authorProfile } = useGetUserProfile(post.author);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'environmental':
        return 'Environmental';
      case 'communityService':
        return 'Community Service';
      case 'actsOfKindness':
        return 'Acts of Kindness';
      case 'other':
        return 'Other';
      default:
        return category;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'environmental':
        return '/assets/generated/category-environmental-transparent.dim_64x64.png';
      case 'communityService':
        return '/assets/generated/category-community-transparent.dim_64x64.png';
      case 'actsOfKindness':
        return '/assets/generated/category-kindness-transparent.dim_64x64.png';
      default:
        return null;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const categoryStr = post.category.__kind__;
  const categoryIcon = getCategoryIcon(categoryStr);
  const isTrending = Number(post.likes) > 5;

  return (
    <>
      <Card className="overflow-hidden border-0 shadow-premium hover:shadow-premium-hover transition-all duration-300 bg-card/95 backdrop-blur-md rounded-2xl animate-fade-in">
        {post.isFlagged && (
          <div className="px-6 pt-6">
            <ModerationWarningBanner />
          </div>
        )}

        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-4 transition-all hover:opacity-80 active:scale-96 group"
            >
              <Avatar className="h-12 w-12 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                {authorProfile?.profilePicture && (
                  <AvatarImage
                    src={authorProfile.profilePicture.getDirectURL()}
                    alt={authorProfile.name}
                    loading="lazy"
                  />
                )}
                <AvatarFallback className="bg-gradient-to-br from-primary via-secondary to-accent text-primary-foreground font-bold text-sm">
                  {authorProfile ? getInitials(authorProfile.name) : '?'}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="font-bold text-lg">{authorProfile?.name || 'Anonymous'}</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">{formatTimestamp(post.timestamp)}</p>
                  {categoryIcon && (
                    <Badge variant="secondary" className="flex items-center gap-1.5 px-2.5 py-1 h-6 rounded-lg">
                      <img src={categoryIcon} alt="" className="h-3.5 w-3.5" loading="lazy" />
                      <span className="text-xs font-semibold">{getCategoryLabel(categoryStr)}</span>
                    </Badge>
                  )}
                </div>
              </div>
            </button>
            <div className="flex items-center gap-2">
              {isTrending && (
                <Badge className="trending-glow flex items-center gap-1.5 px-3 py-1.5 rounded-xl">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span className="text-xs font-bold">Trending</span>
                </Badge>
              )}
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-accent/50">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pb-4 px-0">
          {post.caption && (
            <p className="text-base leading-relaxed whitespace-pre-wrap px-6">{post.caption}</p>
          )}
          {post.photo && (
            <img
              src={post.photo.getDirectURL()}
              alt="Post"
              className="w-full object-cover max-h-[600px] hover:scale-[1.01] transition-transform duration-300"
              loading="lazy"
              decoding="async"
            />
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-3 pb-4">
          <ReactionButtons post={post} />
        </CardFooter>
      </Card>

      {showProfile && (
        <UserProfileModal userPrincipal={post.author} onClose={() => setShowProfile(false)} />
      )}
    </>
  );
}

