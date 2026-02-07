import { useState } from 'react';
import { useGetComments, useGetUserProfile } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CommentsSectionProps {
  postId: string;
}

export default function CommentsSection({ postId }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState('');
  const { data: comments, isLoading } = useGetComments(postId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    // NOTE: Comment creation is not yet implemented in the backend
    toast.info('Comment functionality coming soon!');
    setNewComment('');
  };

  const sortedComments = comments
    ? [...comments].sort((a, b) => Number(b.timestamp - a.timestamp))
    : [];

  return (
    <div className="border-t bg-muted/30">
      <div className="p-4 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={2}
            maxLength={300}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">{newComment.length}/300</span>
            <Button type="submit" size="sm" disabled={!newComment.trim()}>
              Post Comment
            </Button>
          </div>
        </form>

        <Separator />

        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : sortedComments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <div className="space-y-3">
            {sortedComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CommentItem({ comment }: { comment: any }) {
  const { data: authorProfile } = useGetUserProfile(comment.author);

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

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8">
        {authorProfile?.profilePicture && (
          <AvatarImage src={authorProfile.profilePicture.getDirectURL()} alt={authorProfile.name} />
        )}
        <AvatarFallback className="bg-primary/10 text-primary text-xs">
          {authorProfile ? getInitials(authorProfile.name) : '?'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{authorProfile?.name || 'Anonymous'}</span>
          <span className="text-xs text-muted-foreground">{formatTimestamp(comment.timestamp)}</span>
        </div>
        <p className="text-sm">{comment.content}</p>
      </div>
    </div>
  );
}
