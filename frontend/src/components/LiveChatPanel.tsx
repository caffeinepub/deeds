import React, { useState, useRef, useEffect } from 'react';
import { useGetLiveComments, useAddLiveComment, useGetUserProfile, type LiveComment } from '../hooks/useQueries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

interface LiveChatPanelProps {
  sessionId: string;
}

function ChatMessage({ comment }: { comment: LiveComment }) {
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

  return (
    <div className="flex gap-2 py-1">
      <Avatar className="w-6 h-6 flex-shrink-0">
        <AvatarImage src={getAvatarUrl()} alt={authorProfile?.name} />
        <AvatarFallback className="text-xs">
          {authorProfile?.name?.[0]?.toUpperCase() ?? '?'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold text-foreground mr-1">
          {authorProfile?.name ?? 'Anonymous'}
        </span>
        <span className="text-xs text-muted-foreground break-words">{comment.content}</span>
      </div>
    </div>
  );
}

export default function LiveChatPanel({ sessionId }: LiveChatPanelProps) {
  const { data: comments = [] } = useGetLiveComments(sessionId);
  const addComment = useAddLiveComment();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);
    try {
      await addComment.mutateAsync({ sessionId, content: message.trim() });
      setMessage('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Live Chat</h3>
      </div>

      <ScrollArea className="flex-1 px-3 py-2">
        <div ref={scrollRef}>
          {comments.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No messages yet. Say hello!
            </p>
          ) : (
            comments.map((comment) => (
              <ChatMessage key={comment.id} comment={comment} />
            ))
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSend} className="flex gap-2 p-3 border-t border-border">
        <Input
          placeholder="Say something..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="text-xs h-8"
          maxLength={200}
          disabled={isSending}
        />
        <Button
          type="submit"
          size="sm"
          variant="ghost"
          disabled={isSending || !message.trim()}
          className="h-8 px-2"
        >
          <Send className="w-3 h-3" />
        </Button>
      </form>
    </div>
  );
}
