import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { MoreHorizontal, Heart, MessageCircle, Share2, Zap, BookmarkPlus, BookmarkCheck, GitBranch } from 'lucide-react';
import { useGetUserProfile, useLikePost, useAddToMemoryJar, useRemoveFromMemoryJar, useGetMyMemoryJar, type Post } from '../hooks/useQueries';
import { Badge } from './ui/badge';
import UserProfileModal from './UserProfileModal';
import CommentsSection from './CommentsSection';
import CreatePostModal from './CreatePostModal';
import RippleChainView from './RippleChainView';
import { toast } from 'sonner';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showInspireModal, setShowInspireModal] = useState(false);
  const [showRippleChain, setShowRippleChain] = useState(false);
  const { data: authorProfile } = useGetUserProfile(post.author);
  const { identity } = useInternetIdentity();
  const likePost = useLikePost();
  const addToJar = useAddToMemoryJar();
  const removeFromJar = useRemoveFromMemoryJar();
  const { data: memoryJar } = useGetMyMemoryJar();

  const isInJar = memoryJar?.some(entry => entry.postId === post.id) ?? false;
  const isAuthenticated = !!identity;

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'environmental': return 'Environmental';
      case 'communityService': return 'Community Service';
      case 'actsOfKindness': return 'Acts of Kindness';
      case 'other': return 'Other';
      default: return category;
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

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

  const handleMemoryJar = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to save posts');
      return;
    }
    try {
      if (isInJar) {
        await removeFromJar.mutateAsync(post.id);
        toast.success('Removed from Memory Jar 🫙');
      } else {
        await addToJar.mutateAsync(post.id);
        toast.success('Saved to Memory Jar 🫙');
      }
    } catch (error) {
      console.error('Memory jar error:', error);
      toast.error('Failed to update Memory Jar');
    }
  };

  const categoryStr = post.category.__kind__;
  const isJarPending = addToJar.isPending || removeFromJar.isPending;

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
                  {post.parentPostId && (
                    <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                      <Zap className="h-2.5 w-2.5 mr-1" />
                      Inspired
                    </Badge>
                  )}
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
            <div className="flex gap-1 flex-wrap">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={liked ? 'text-red-500' : ''}
              >
                <Heart className={`h-5 w-5 mr-1.5 ${liked ? 'fill-current' : ''}`} />
                {Number(post.likes) + (liked ? 1 : 0)}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageCircle className="h-5 w-5 mr-1.5" />
                {Number(post.comments)}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-5 w-5 mr-1.5" />
                Share
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInspireModal(true)}
                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              >
                <Zap className="h-5 w-5 mr-1.5" />
                Inspired
              </Button>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRippleChain(!showRippleChain)}
                className="text-muted-foreground hover:text-amber-600"
                title="View Ripple Chain"
              >
                <GitBranch className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMemoryJar}
                disabled={isJarPending}
                className={isInJar ? 'text-amber-500 hover:text-amber-600' : 'text-muted-foreground hover:text-amber-500'}
                title={isInJar ? 'Remove from Memory Jar' : 'Save to Memory Jar'}
              >
                {isJarPending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : isInJar ? (
                  <BookmarkCheck className="h-4 w-4 fill-current" />
                ) : (
                  <BookmarkPlus className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {showRippleChain && (
            <div className="w-full px-2 pt-2 border-t border-amber-100">
              <RippleChainView post={post} authorName={authorProfile?.name} />
            </div>
          )}

          {showComments && <CommentsSection postId={post.id} />}
        </CardFooter>
      </Card>

      {showProfile && (
        <UserProfileModal userPrincipal={post.author} onClose={() => setShowProfile(false)} />
      )}

      {showInspireModal && (
        <CreatePostModal
          onClose={() => setShowInspireModal(false)}
          parentPostId={post.id}
          parentCaption={post.caption}
          parentAuthorName={authorProfile?.name}
        />
      )}
    </>
  );
}
