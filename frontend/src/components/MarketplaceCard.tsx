import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { MapPin, MessageSquare, Bookmark, MoreHorizontal } from 'lucide-react';
import { useGetUserProfile, type MarketplacePost } from '../hooks/useQueries';
import { Badge } from './ui/badge';
import UserProfileModal from './UserProfileModal';
import { toast } from 'sonner';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface MarketplaceCardProps {
  post: MarketplacePost;
}

export default function MarketplaceCard({ post }: MarketplaceCardProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [saved, setSaved] = useState(false);
  const { data: authorProfile } = useGetUserProfile(post.author);
  const { identity } = useInternetIdentity();

  const handleSave = async () => {
    if (saved) return;
    toast.info('Save feature coming soon!');
    setSaved(true);
  };

  const handleMessage = () => {
    if (!identity) {
      toast.error('Please login to send messages');
      return;
    }
    toast.success('Opening message...');
  };

  const getCategoryLabel = (category: any) => {
    const categoryStr = String(category);
    switch (categoryStr) {
      case 'environment':
        return 'Environment';
      case 'education':
        return 'Education';
      case 'communitySupport':
        return 'Community Support';
      case 'animalWelfare':
        return 'Animal Welfare';
      case 'emotionalSupport':
        return 'Emotional Support';
      case 'other':
        return 'Other';
      default:
        return categoryStr;
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

  const isNeed = String(post.postType) === 'need';
  const isOffer = String(post.postType) === 'offer';

  return (
    <>
      <Card className="overflow-hidden border-0 shadow-premium hover:shadow-premium-hover transition-all duration-300 bg-card/95 backdrop-blur-md rounded-2xl animate-fade-in flex flex-col h-full">
        <CardHeader className="pb-4 space-y-0">
          <div className="flex items-start justify-between gap-3">
            <button
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-3 transition-all hover:opacity-80 active:scale-95 group min-w-0 flex-1"
            >
              <Avatar className="h-11 w-11 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all flex-shrink-0">
                {authorProfile?.profilePicture && (
                  <AvatarImage
                    src={authorProfile.profilePicture.getDirectURL()}
                    alt={authorProfile.name}
                  />
                )}
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-sm">
                  {authorProfile ? getInitials(authorProfile.name) : '?'}
                </AvatarFallback>
              </Avatar>
              <div className="text-left min-w-0 flex-1">
                <p className="font-bold text-base truncate">{authorProfile?.name || 'Anonymous'}</p>
                <p className="text-xs text-muted-foreground">{formatTimestamp(post.timestamp)}</p>
              </div>
            </button>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isNeed && (
                <Badge variant="destructive" className="flex items-center gap-1.5 px-2.5 py-1 h-7 rounded-lg">
                  <img src="/assets/generated/needs-icon-red-transparent.dim_48x48.png" alt="" className="h-3.5 w-3.5" />
                  <span className="text-xs font-bold">Need</span>
                </Badge>
              )}
              {isOffer && (
                <Badge className="flex items-center gap-1.5 px-2.5 py-1 h-7 rounded-lg bg-green-600 hover:bg-green-700">
                  <img src="/assets/generated/offers-icon-red-transparent.dim_48x48.png" alt="" className="h-3.5 w-3.5" />
                  <span className="text-xs font-bold">Offer</span>
                </Badge>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-accent/50">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pb-4 flex-1 flex flex-col">
          <div className="space-y-3">
            <h3 className="text-xl font-bold leading-tight line-clamp-2">{post.title}</h3>
            <Badge variant="secondary" className="inline-block">
              {getCategoryLabel(post.category)}
            </Badge>
            <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-wrap line-clamp-4">
              {post.description}
            </p>
          </div>

          {post.media && (
            <div className="w-full overflow-hidden rounded-lg">
              <img
                src={post.media.getDirectURL()}
                alt="Post media"
                className="w-full object-cover max-h-[280px] hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="font-semibold truncate">{post.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Bookmark className="h-4 w-4 flex-shrink-0" />
              <span className="font-semibold">{Number(post.savedCount)} saved</span>
            </div>
          </div>

          <div className="bg-accent/30 rounded-lg p-4 border border-border/50 mt-auto">
            <p className="text-sm font-semibold text-muted-foreground mb-1.5">Contact Method:</p>
            <p className="text-base font-bold break-words">{post.contactMethod}</p>
          </div>
        </CardContent>

        <CardFooter className="flex items-center gap-3 pt-4 pb-4 border-t">
          <Button
            variant="default"
            size="lg"
            onClick={handleMessage}
            className="gap-2 flex-1 rounded-xl shadow-md hover:shadow-lg transition-all h-11"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="font-bold">Message</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleSave}
            disabled={saved}
            className={`gap-2 flex-1 rounded-xl transition-all h-11 ${saved ? 'bg-primary/10 border-primary' : ''}`}
          >
            <Bookmark className={`h-5 w-5 ${saved ? 'fill-current text-primary' : ''}`} />
            <span className="font-bold">{saved ? 'Saved' : 'Save'}</span>
          </Button>
        </CardFooter>
      </Card>

      {showProfile && (
        <UserProfileModal userPrincipal={post.author} onClose={() => setShowProfile(false)} />
      )}
    </>
  );
}
