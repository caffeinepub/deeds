import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetUserProfile, useGetUserPosts, useGetFollowing, useFollowUser, useUnfollowUser } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Users, UserPlus, UserMinus } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfileModalProps {
  userPrincipal: any;
  onClose: () => void;
}

export default function UserProfileModal({ userPrincipal, onClose }: UserProfileModalProps) {
  const { identity } = useInternetIdentity();
  const currentUserPrincipal = identity?.getPrincipal().toString() ?? null;

  const principalStr = typeof userPrincipal === 'string' ? userPrincipal : userPrincipal?.toString?.() ?? null;

  const { data: profile, isLoading: profileLoading } = useGetUserProfile(principalStr);
  const { data: following = [] } = useGetFollowing(currentUserPrincipal);
  const { data: posts = [], isLoading: postsLoading } = useGetUserPosts(principalStr);

  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const isFollowing = following.some(
    (f) => (f.following?.toString?.() ?? '') === principalStr
  );
  const isOwnProfile = currentUserPrincipal === principalStr;

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

  const getPostPhotoUrl = (post: any): string | null => {
    if (post?.photo && post.photo.__kind__ === 'Some') {
      try {
        const blob = post.photo.value;
        if (blob && typeof blob.getDirectURL === 'function') {
          return blob.getDirectURL();
        }
      } catch {
        // fallback
      }
    }
    return null;
  };

  const getPostVideoUrl = (post: any): string | null => {
    if (post?.video && post.video.__kind__ === 'Some') {
      try {
        const blob = post.video.value;
        if (blob && typeof blob.getDirectURL === 'function') {
          return blob.getDirectURL();
        }
      } catch {
        // fallback
      }
    }
    return null;
  };

  const handleFollowToggle = async () => {
    if (!principalStr) return;
    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser.mutateAsync(principalStr);
        toast.success('Unfollowed');
      } else {
        await followUser.mutateAsync(principalStr);
        toast.success('Following!');
      }
    } catch {
      toast.error('Failed to update follow status');
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
        </DialogHeader>

        {profileLoading ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </div>
        ) : !profile ? (
          <p className="text-sm text-muted-foreground text-center py-4">Profile not found</p>
        ) : (
          <ScrollArea className="flex-1">
            <div className="space-y-4">
              {/* Profile info */}
              <div className="flex items-start gap-3">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={getAvatarUrl()} alt={profile.name} />
                  <AvatarFallback className="text-lg">
                    {profile.name?.[0]?.toUpperCase() ?? '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground">{profile.name}</h3>
                  {profile.bio && (
                    <p className="text-sm text-muted-foreground mt-0.5">{profile.bio}</p>
                  )}
                  <div className="flex gap-4 mt-2">
                    <div className="text-center">
                      <div className="text-sm font-bold text-foreground">{Number(profile.followers)}</div>
                      <div className="text-xs text-muted-foreground">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-foreground">{Number(profile.following)}</div>
                      <div className="text-xs text-muted-foreground">Following</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Follow button */}
              {!isOwnProfile && (
                <Button
                  variant={isFollowing ? 'outline' : 'default'}
                  size="sm"
                  className="w-full"
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                >
                  {isFollowLoading ? (
                    <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  ) : isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4 mr-1" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-1" />
                      Follow
                    </>
                  )}
                </Button>
              )}

              {/* Posts */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Recent Deeds ({posts.length})
                </h4>
                {postsLoading ? (
                  <div className="grid grid-cols-3 gap-1">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="aspect-square rounded-lg" />
                    ))}
                  </div>
                ) : posts.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-3">No deeds yet</p>
                ) : (
                  <div className="grid grid-cols-3 gap-1">
                    {posts.slice(0, 9).map((post) => {
                      const photoUrl = getPostPhotoUrl(post);
                      const videoUrl = getPostVideoUrl(post);
                      return (
                        <div
                          key={post.id}
                          className="aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center"
                        >
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt="Post"
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : videoUrl ? (
                            <video
                              src={videoUrl}
                              className="w-full h-full object-cover"
                              preload="metadata"
                            />
                          ) : (
                            <span className="text-lg">🌟</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
