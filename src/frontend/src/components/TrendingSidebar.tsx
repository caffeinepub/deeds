import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, Hash, Trophy, Zap } from 'lucide-react';
import { useGetAllPosts } from '../hooks/useQueries';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Principal } from '@icp-sdk/core/principal';

export default function TrendingSidebar() {
  const { data: allPosts } = useGetAllPosts();

  // Extract trending hashtags from captions
  const trendingHashtags = useMemo(() => {
    if (!allPosts) return [];
    return Array.from(
      new Set(
        allPosts
          .flatMap((post) => {
            const matches = post.caption.match(/#\w+/g);
            return matches || [];
          })
      )
    ).slice(0, 5);
  }, [allPosts]);

  // Top users by post count - calculated from posts
  const topUsers = useMemo(() => {
    if (!allPosts) return [];
    
    // Group posts by author
    const userPostCounts = new Map<string, { author: Principal; count: number }>();
    
    allPosts.forEach((post) => {
      const authorKey = post.author.toString();
      const existing = userPostCounts.get(authorKey);
      if (existing) {
        existing.count++;
      } else {
        userPostCounts.set(authorKey, { author: post.author, count: 1 });
      }
    });

    // Sort by post count and take top 5
    return Array.from(userPostCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [allPosts]);

  const getInitials = (principal: Principal) => {
    const str = principal.toString();
    return str.slice(0, 2).toUpperCase();
  };

  return (
    <div className="sticky top-20 space-y-4">
      {/* Trending Hashtags */}
      <Card className="shadow-premium border bg-card/95 backdrop-blur-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <img
              src="/assets/generated/trending-hashtag-icon-red-glow.dim_48x48.png"
              alt=""
              className="h-5 w-5"
            />
            Trending Hashtags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trendingHashtags.length > 0 ? (
            trendingHashtags.map((hashtag, index) => (
              <button
                key={hashtag}
                className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-accent/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-muted-foreground">
                    {index + 1}
                  </span>
                  <Hash className="h-4 w-4 text-primary" />
                  <span className="font-semibold group-hover:text-primary transition-colors">
                    {hashtag.slice(1)}
                  </span>
                </div>
                <TrendingUp className="h-4 w-4 text-primary" />
              </button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No trending hashtags yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Top Users */}
      <Card className="shadow-premium border bg-card/95 backdrop-blur-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <img
              src="/assets/generated/leaderboard-crown-icon-silver-red.dim_64x64.png"
              alt=""
              className="h-5 w-5"
            />
            Top Users
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topUsers.length > 0 ? (
            topUsers.map(({ author, count }, index) => (
              <div
                key={author.toString()}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-all"
              >
                <span className="text-lg font-bold text-muted-foreground w-6">
                  {index + 1}
                </span>
                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary via-secondary to-accent text-primary-foreground font-bold text-sm">
                    {getInitials(author)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-sm">
                    {author.toString().slice(0, 10)}...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {count} Deeds
                  </p>
                </div>
                {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No users yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Challenges */}
      <Card className="shadow-premium border bg-card/95 backdrop-blur-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <img
              src="/assets/generated/challenge-badge-gradient.dim_80x80.png"
              alt=""
              className="h-5 w-5"
            />
            Active Challenges
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Kindness Week</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Share 7 acts of kindness this week
            </p>
            <Badge variant="secondary" className="mt-2 text-xs">
              Coming Soon
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
