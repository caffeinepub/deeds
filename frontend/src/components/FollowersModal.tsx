import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetFollowers, useGetUserProfile } from '../hooks/useQueries';
import { Users } from 'lucide-react';

interface FollowersModalProps {
  userPrincipal: any;
  onClose: () => void;
}

function FollowerItem({ followerPrincipal }: { followerPrincipal: string }) {
  const { data: profile } = useGetUserProfile(followerPrincipal);

  const getAvatarUrl = () => {
    if (profile?.profilePicture && profile.profilePicture.__kind__ === 'Some') {
      try {
        const blob = profile.profilePicture.value;
        if (blob && typeof blob.getDirectURL === 'function') {
          return blob.getDirectURL();
        }
      } catch {
        // fallback
      }
    }
    return undefined;
  };

  return (
    <div className="flex items-center gap-3 py-2">
      <Avatar className="w-10 h-10">
        <AvatarImage src={getAvatarUrl()} alt={profile?.name} />
        <AvatarFallback>{profile?.name?.[0]?.toUpperCase() ?? '?'}</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-semibold text-foreground">{profile?.name ?? 'Loading...'}</p>
        {profile?.bio && (
          <p className="text-xs text-muted-foreground line-clamp-1">{profile.bio}</p>
        )}
      </div>
    </div>
  );
}

export default function FollowersModal({ userPrincipal, onClose }: FollowersModalProps) {
  const principalStr = typeof userPrincipal === 'string' ? userPrincipal : userPrincipal?.toString?.() ?? null;
  const { data: followers = [], isLoading } = useGetFollowers(principalStr);

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Followers ({followers.length})
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-80">
          {isLoading ? (
            <div className="space-y-3 p-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : followers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No followers yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border px-1">
              {followers.map((follow, idx) => {
                const followerPrincipal = follow.follower?.toString?.() ?? String(idx);
                return (
                  <FollowerItem key={followerPrincipal} followerPrincipal={followerPrincipal} />
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
