import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetFollowing,
  useGetMessages,
  useSendMessage,
  useGetUserProfile,
} from '../hooks/useQueries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

function FriendItem({
  friendPrincipal,
  isSelected,
  onClick,
}: {
  friendPrincipal: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { data: profile } = useGetUserProfile(friendPrincipal);

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

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
        isSelected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted'
      }`}
    >
      <Avatar className="w-10 h-10 flex-shrink-0">
        <AvatarImage src={getAvatarUrl()} alt={profile?.name} />
        <AvatarFallback>{profile?.name?.[0]?.toUpperCase() ?? '?'}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {profile?.name ?? 'Loading...'}
        </p>
        {profile?.bio && (
          <p className="text-xs text-muted-foreground truncate">{profile.bio}</p>
        )}
      </div>
    </button>
  );
}

function MessageBubble({
  message,
  isOwn,
}: {
  message: any;
  isOwn: boolean;
}) {
  const timestamp = new Date(Number(message.timestamp) / 1_000_000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[75%] rounded-2xl px-3 py-2 ${
          isOwn
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-muted text-foreground rounded-bl-sm'
        }`}
      >
        <p className="text-sm break-words">{message.content}</p>
        <p className={`text-xs mt-0.5 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
          {timestamp}
        </p>
      </div>
    </div>
  );
}

export default function Messages() {
  const { identity } = useInternetIdentity();
  const currentUserPrincipal = identity?.getPrincipal().toString() ?? null;

  const { data: following = [], isLoading: followingLoading } = useGetFollowing(currentUserPrincipal);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const { data: messages = [], isLoading: messagesLoading } = useGetMessages(selectedUser);
  const sendMessage = useSendMessage();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    setIsSending(true);
    try {
      await sendMessage.mutateAsync({
        receiver: selectedUser,
        content: newMessage.trim(),
      });
      setNewMessage('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const friends = following.map((f) => {
    const p = f.following;
    return typeof p === 'string' ? p : p?.toString?.() ?? '';
  }).filter(Boolean);

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex border border-border rounded-xl overflow-hidden shadow-sm">
      {/* Friends sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-border flex flex-col">
        <div className="p-3 border-b border-border">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-primary" />
            Messages
          </h2>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {followingLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))
            ) : friends.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4 px-2">
                Follow people to start messaging them
              </p>
            ) : (
              friends.map((friendPrincipal) => (
                <FriendItem
                  key={friendPrincipal}
                  friendPrincipal={friendPrincipal}
                  isSelected={selectedUser === friendPrincipal}
                  onClick={() => setSelectedUser(friendPrincipal)}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Conversation area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <ConversationHeader userPrincipal={selectedUser} />
            <ScrollArea className="flex-1 p-4">
              {messagesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-48 rounded-2xl" />
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isOwn={msg.sender?.toString?.() === currentUserPrincipal}
                  />
                ))
              )}
            </ScrollArea>
            <form onSubmit={handleSend} className="flex gap-2 p-3 border-t border-border">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
                maxLength={500}
                disabled={isSending}
              />
              <Button
                type="submit"
                size="sm"
                disabled={isSending || !newMessage.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium text-foreground">Select a conversation</p>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a friend from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ConversationHeader({ userPrincipal }: { userPrincipal: string }) {
  const { data: profile } = useGetUserProfile(userPrincipal);

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

  return (
    <div className="flex items-center gap-3 p-3 border-b border-border">
      <Avatar className="w-9 h-9">
        <AvatarImage src={getAvatarUrl()} alt={profile?.name} />
        <AvatarFallback>{profile?.name?.[0]?.toUpperCase() ?? '?'}</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-semibold text-foreground">{profile?.name ?? 'Loading...'}</p>
        {profile?.bio && (
          <p className="text-xs text-muted-foreground line-clamp-1">{profile.bio}</p>
        )}
      </div>
    </div>
  );
}
