import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { MoreHorizontal, Heart, MessageCircle, Share2 } from 'lucide-react';
import { useGetUserProfile, useLikePost, type Post } from '../hooks/useQueries';
import { Badge } from './ui/badge';
import UserProfileModal from './UserProfileModal';
import CommentsSection from './CommentsSection';
import { toast } from 'sonner';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(false);
  const { data: authorProfile } = useGetUserProfile(post.author);
  const likePost = useLikePost();

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

  const handleLike = async () => {
    if (liked) return;
    try {
      await likePost.mutateAsync(post.id);
      setLiked(true);
      toast.success('Post liked!');
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleShare = () => {
    toast.success('Share functionality coming soon!');
  };

  const categoryStr = post.category.__kind__;

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Avatar className="h-10 w-10">
                {authorProfile?.profilePicture && (
                  <AvatarImage
                    src={authorProfile.profilePicture.getDirectURL()}
                    alt={authorProfile.name}
                  />
                )}
                <AvatarFallback>
                  {authorProfile ? getInitials(authorProfile.name) : '?'}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="font-semibold">{authorProfile?.name || 'Anonymous'}</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">{formatTimestamp(post.timestamp)}</p>
                  <Badge variant="secondary" className="text-xs">
                    {getCategoryLabel(categoryStr)}
                  </Badge>
                </div>
              </div>
            </button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pb-4 px-0">
          {post.caption && (
            <p className="text-base px-6">{post.caption}</p>
          )}
          {post.photo && (
            <img
              src={post.photo.getDirectURL()}
              alt="Post"
              className="w-full object-cover max-h-[600px]"
            />
          )}
          {post.video && (
            <video
              src={post.video.getDirectURL()}
              controls
              className="w-full max-h-[600px]"
            />
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-3 pb-4">
          <div className="flex items-center justify-between w-full px-2">
            <div className="flex gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={liked ? 'text-red-500' : ''}
              >
                <Heart className={`h-5 w-5 mr-2 ${liked ? 'fill-current' : ''}`} />
                {Number(post.likes) + (liked ? 1 : 0)}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                {Number(post.comments)}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-5 w-5 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {showComments && <CommentsSection postId={post.id} />}
        </CardFooter>
      </Card>

      {showProfile && (
        <UserProfileModal userPrincipal={post.author} onClose={() => setShowProfile(false)} />
      )}
    </>
  );
}
