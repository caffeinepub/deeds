import { useState, useEffect, useRef } from 'react';
import { useGetLiveComments, useCreateLiveComment, useGetUserProfile, type LiveComment } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Send, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface LiveChatPanelProps {
  sessionId: string;
}

export default function LiveChatPanel({ sessionId }: LiveChatPanelProps) {
  const [message, setMessage] = useState('');
  const { data: comments = [] } = useGetLiveComments(sessionId);
  const addCommentMutation = useCreateLiveComment();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new comments arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await addCommentMutation.mutateAsync({
        sessionId,
        content: message.trim(),
      });
      setMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Failed to send message');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Live Chat</h3>
          <span className="text-xs text-muted-foreground ml-auto">{comments.length}</span>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No messages yet</p>
              <p className="text-xs">Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <LiveCommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Send a message..."
            disabled={addCommentMutation.isPending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || addCommentMutation.isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

function LiveCommentItem({ comment }: { comment: LiveComment }) {
  const { data: authorProfile } = useGetUserProfile(comment.author);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex gap-2">
      <Avatar className="h-8 w-8 flex-shrink-0">
        {authorProfile?.profilePicture && (
          <AvatarImage
            src={authorProfile.profilePicture.getDirectURL()}
            alt={authorProfile.name}
          />
        )}
        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
          {authorProfile ? getInitials(authorProfile.name) : '?'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold truncate">
            {authorProfile?.name || 'Anonymous'}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(Number(comment.timestamp) / 1000000).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        <p className="text-sm break-words">{comment.content}</p>
      </div>
    </div>
  );
}
