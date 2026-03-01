import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useGetFollowers, useGetUserProfile } from '../hooks/useQueries';
import { Principal } from '@icp-sdk/core/principal';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface FollowersModalProps {
  userPrincipal: Principal;
  onClose: () => void;
}

export default function FollowersModal({ userPrincipal, onClose }: FollowersModalProps) {
  const { data: followers, isLoading } = useGetFollowers(userPrincipal);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Followers</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : followers && followers.length > 0 ? (
            <div className="space-y-2">
              {followers.map((follow) => (
                <FollowerItem key={follow.follower.toString()} userPrincipal={follow.follower} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No followers yet</p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function FollowerItem({ userPrincipal }: { userPrincipal: Principal }) {
  const { data: profile } = useGetUserProfile(userPrincipal);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
      <Avatar className="h-10 w-10">
        {profile?.profilePicture && (
          <AvatarImage src={profile.profilePicture.getDirectURL()} alt={profile.name} />
        )}
        <AvatarFallback className="bg-primary/10 text-primary">
          {profile ? getInitials(profile.name) : '?'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="font-medium text-sm">{profile?.name || 'User'}</p>
        {profile?.bio && <p className="text-xs text-muted-foreground line-clamp-1">{profile.bio}</p>}
      </div>
    </div>
  );
}
