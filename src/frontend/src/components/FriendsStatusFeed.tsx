import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Music, Image as ImageIcon, Clock, Sparkles } from 'lucide-react';
import { useGetFriendsStatusUpdates, useGetFollowing } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Skeleton } from './ui/skeleton';
import type { StatusUpdate } from '../backend';

export default function FriendsStatusFeed() {
  const { identity } = useInternetIdentity();
  const currentUserPrincipal = identity?.getPrincipal();
  const { data: following } = useGetFollowing(currentUserPrincipal || null);
  const friendPrincipals = following?.map(f => f.following) || [];
  const { data: statusUpdates, isLoading } = useGetFriendsStatusUpdates(friendPrincipals);

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
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card className="bg-white shadow-xl border-border/50 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-6 w-6 text-primary" />
            Friends' Status Updates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!statusUpdates || statusUpdates.length === 0) {
    return (
      <Card className="bg-white shadow-xl border-border/50 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-6 w-6 text-primary" />
            Friends' Status Updates
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center space-y-4">
          <Sparkles className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
          <div>
            <h3 className="text-lg font-semibold mb-2">No Status Updates Yet</h3>
            <p className="text-sm text-muted-foreground">
              Your friends haven't posted any status updates yet. Check back later!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedUpdates = [...statusUpdates].sort((a, b) => Number(b.timestamp - a.timestamp));

  return (
    <Card className="bg-white shadow-xl border-border/50 rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Sparkles className="h-6 w-6 text-primary" />
          Friends' Status Updates
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          See what your friends are up to
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {sortedUpdates.map((update, index) => (
          <div
            key={index}
            className="relative bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl p-5 border-2 border-transparent bg-clip-padding overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
            style={{
              backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #FFD700 0%, #C0C0C0 25%, #FF69B4 50%, #8A2BE2 75%, #00BFFF 100%)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
            }}
          >
            <div className="flex items-start gap-3 mb-4">
              <Avatar className="h-12 w-12 ring-2 ring-white shadow-md">
                <AvatarImage src="" alt="Friend" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">
                  {getInitials('Friend')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-base">Friend</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatTimestamp(update.timestamp)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {update.text && (
                <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words leading-relaxed">
                  {update.text}
                </p>
              )}

              {update.image && (
                <div className="relative rounded-xl overflow-hidden border-2 border-white/50 dark:border-gray-700/50 shadow-md">
                  <img
                    src={update.image.getDirectURL()}
                    alt="Status"
                    className="w-full max-h-80 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-900/90 rounded-full p-1.5">
                    <ImageIcon className="h-4 w-4 text-primary" />
                  </div>
                </div>
              )}

              {update.music && (
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-3 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/20 p-2 rounded-lg">
                      <Music className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{update.music.title}</p>
                      <p className="text-xs text-muted-foreground">{update.music.artist}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
