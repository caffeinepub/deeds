import { useState } from 'react';
import { useGetFollowing, useGetUserProfile, useSendMessage } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Principal } from '@icp-sdk/core/principal';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send, Users } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner';
import { Card, CardContent } from './ui/card';

export default function Messages() {
  const { identity } = useInternetIdentity();
  const currentUserPrincipal = identity?.getPrincipal();
  const { data: following } = useGetFollowing(currentUserPrincipal || null);
  const [selectedUser, setSelectedUser] = useState<Principal | null>(null);
  const [messageText, setMessageText] = useState('');
  const sendMessage = useSendMessage();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUser) return;

    try {
      await sendMessage.mutateAsync({
        receiver: selectedUser,
        content: messageText.trim(),
      });
      setMessageText('');
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="container py-8 pb-24 max-w-6xl mx-auto">
      <div className="mb-8 space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Messages</h2>
        <p className="text-muted-foreground text-base">Chat with your friends</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border rounded-lg overflow-hidden bg-card shadow-lg">
        {/* Friends List */}
        <div className="md:col-span-1 border-r bg-muted/30">
          <div className="p-4 border-b bg-background">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Friends
            </h3>
          </div>
          <ScrollArea className="h-[500px]">
            {following && following.length > 0 ? (
              <div className="p-2 space-y-1">
                {following.map((follow) => (
                  <FriendListItem
                    key={follow.following.toString()}
                    friendPrincipal={follow.following}
                    isSelected={selectedUser?.toString() === follow.following.toString()}
                    onClick={() => setSelectedUser(follow.following)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No friends yet</p>
                <p className="text-xs mt-1">Follow users to start messaging</p>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Conversation Area */}
        <div className="md:col-span-2 flex flex-col">
          {selectedUser ? (
            <>
              <div className="p-4 border-b bg-muted/50">
                <ConversationHeader userPrincipal={selectedUser} />
              </div>
              <ScrollArea className="flex-1 h-[400px] p-4">
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-sm">Start a conversation!</p>
                  <p className="text-xs mt-2">Messages will appear here</p>
                </div>
              </ScrollArea>
              <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sendMessage.isPending}
                  className="transition-all focus:ring-2 focus:ring-primary"
                />
                <Button 
                  type="submit" 
                  disabled={sendMessage.isPending || !messageText.trim()}
                  className="transition-all hover:scale-105 active:scale-95"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-[500px] text-muted-foreground">
              <div className="text-center">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="font-semibold">Select a friend to start messaging</p>
                <p className="text-sm mt-2">Choose from your friends list</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FriendListItem({ 
  friendPrincipal, 
  isSelected, 
  onClick 
}: { 
  friendPrincipal: Principal; 
  isSelected: boolean; 
  onClick: () => void;
}) {
  const { data: profile } = useGetUserProfile(friendPrincipal);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-accent ${
        isSelected ? 'bg-accent border-2 border-primary' : ''
      }`}
    >
      <Avatar className="h-10 w-10">
        {profile?.profilePicture && (
          <AvatarImage src={profile.profilePicture.getDirectURL()} alt={profile.name} />
        )}
        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
          {profile ? getInitials(profile.name) : '?'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 text-left min-w-0">
        <p className="font-semibold text-sm truncate">{profile?.name || 'User'}</p>
        <p className="text-xs text-muted-foreground truncate">
          {friendPrincipal.toString().slice(0, 8)}...
        </p>
      </div>
    </button>
  );
}

function ConversationHeader({ userPrincipal }: { userPrincipal: Principal }) {
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
    <div className="flex items-center gap-3">
      <Avatar className="h-11 w-11">
        {profile?.profilePicture && (
          <AvatarImage src={profile.profilePicture.getDirectURL()} alt={profile.name} />
        )}
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {profile ? getInitials(profile.name) : '?'}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-semibold text-base">{profile?.name || 'User'}</p>
        <p className="text-xs text-muted-foreground">
          {userPrincipal.toString().slice(0, 12)}...
        </p>
      </div>
    </div>
  );
}
