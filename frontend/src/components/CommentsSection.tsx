import React, { useState } from 'react';
import { useGetPostComments, useGetUserProfile, useCreateComment } from '../hooks/useQueries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

interface CommentsSectionProps {
  postId: string;
}

function CommentItem({ comment }: { comment: any }) {
  const authorPrincipal = comment.author?.toString() ?? null;
  const { data: authorProfile } = useGetUserProfile(authorPrincipal);

  const getAvatarUrl = () => {
    if (authorProfile?.profilePicture && authorProfile.profilePicture.__kind__ === 'Some') {
      try {
        const blob = authorProfile.profilePicture.value;
        if (blob && typeof blob.getDirectURL === 'function') {
          return blob.getDirectURL();
        }
      } catch {
        // fallback
      }
    }
    return undefined;
  };

  const timestamp = new Date(Number(comment.timestamp) / 1_000_000).toLocaleDateString();

  return (
    <div className="flex gap-2 py-2">
      <Avatar className="w-7 h-7 flex-shrink-0">
        <AvatarImage src={getAvatarUrl()} alt={authorProfile?.name} />
        <AvatarFallback className="text-xs">
          {authorProfile?.name?.[0]?.toUpperCase() ?? '?'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-semibold text-foreground">
            {authorProfile?.name ?? 'Anonymous'}
          </span>
          <span className="text-xs text-muted-foreground">{timestamp}</span>
        </div>
        <p className="text-xs text-foreground mt-0.5 break-words">{comment.content}</p>
      </div>
    </div>
  );
}

export default function CommentsSection({ postId }: CommentsSectionProps) {
  const { data: comments = [], isLoading } = useGetPostComments(postId);
  const createComment = useCreateComment();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await createComment.mutateAsync({ postId, content: newComment.trim() });
      setNewComment('');
    } catch {
      toast.error('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-t border-border px-3 py-2">
      {isLoading ? (
        <div className="space-y-2 py-2">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-2">
              <Skeleton className="w-7 h-7 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {comments.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2 text-center">
              No comments yet. Be the first!
            </p>
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>
      )}

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
        <Input
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="text-xs h-8"
          maxLength={300}
          disabled={isSubmitting}
        />
        <Button
          type="submit"
          size="sm"
          variant="ghost"
          disabled={isSubmitting || !newComment.trim()}
          className="h-8 px-2"
        >
          <Send className="w-3 h-3" />
        </Button>
      </form>
    </div>
  );
}
