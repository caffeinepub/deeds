import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import {
  useGetUserProfile,
  useGetAllPosts,
  useGetFollowing,
} from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Principal } from '@icp-sdk/core/principal';
import { Loader2, Award } from 'lucide-react';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { toast } from 'sonner';

interface UserProfileModalProps {
  userPrincipal: Principal;
  onClose: () => void;
}

export default function UserProfileModal({ userPrincipal, onClose }: UserProfileModalProps) {
  const { identity } = useInternetIdentity();
  const currentUserPrincipal = identity?.getPrincipal();
  const { data: profile, isLoading: profileLoading } = useGetUserProfile(userPrincipal);
  const { data: allPosts, isLoading: postsLoading } = useGetAllPosts();
  const { data: following } = useGetFollowing(currentUserPrincipal || null);

  const userPosts = allPosts?.filter(
    (post) => post.author.toString() === userPrincipal.toString()
  ) || [];

  const isOwnProfile = currentUserPrincipal?.toString() === userPrincipal.toString();
  const isFollowing = following?.some((p) => p.toString() === userPrincipal.toString());

  const handleFollow = async () => {
    toast.info('Follow functionality coming soon!');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getCategoryLabel = (categoryKind: string) => {
    switch (categoryKind) {
      case 'environmental':
        return 'Environmental';
      case 'communityService':
        return 'Community Service';
      case 'actsOfKindness':
        return 'Acts of Kindness';
      case 'other':
        return 'Other';
      default:
        return categoryKind;
    }
  };

  const sortedPosts = userPosts ? [...userPosts].sort((a, b) => Number(b.timestamp - a.timestamp)) : [];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        {profileLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : profile ? (
          <>
            <DialogHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  {profile.profilePicture && (
                    <AvatarImage src={profile.profilePicture.getDirectURL()} alt={profile.name} />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <DialogTitle className="text-2xl mb-1">{profile.name}</DialogTitle>
                  {profile.bio && <p className="text-sm text-muted-foreground">{profile.bio}</p>}
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <div>
                      <span className="font-semibold">{Number(profile.followers)}</span> Followers
                    </div>
                    <div>
                      <span className="font-semibold">{Number(profile.following)}</span> Following
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="font-medium">
                        {userPosts.length}{' '}
                        {userPosts.length === 1 ? 'Post' : 'Posts'}
                      </span>
                    </div>
                  </div>
                  {!isOwnProfile && (
                    <Button
                      onClick={handleFollow}
                      variant={isFollowing ? 'outline' : 'default'}
                      size="sm"
                      className="mt-3"
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  )}
                </div>
              </div>
            </DialogHeader>

            <Separator className="my-4" />

            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Posts</h3>
              {postsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : sortedPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No posts shared yet
                </p>
              ) : (
                <div className="space-y-4">
                  {sortedPosts.slice(0, 5).map((post) => (
                    <div key={post.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{getCategoryLabel(post.category.__kind__)}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(Number(post.timestamp) / 1000000).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{post.caption}</p>
                      {post.photo && (
                        <img
                          src={post.photo.getDirectURL()}
                          alt="Post"
                          className="w-full rounded-md object-cover max-h-48"
                        />
                      )}
                      {post.video && (
                        <video
                          src={post.video.getDirectURL()}
                          controls
                          className="w-full rounded-md object-cover max-h-48"
                        />
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{Number(post.likes)} likes</span>
                        <span>{Number(post.comments)} comments</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Profile not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

