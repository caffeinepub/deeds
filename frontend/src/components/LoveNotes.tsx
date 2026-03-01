import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useSendLoveNote, useGetMyLoveNotes } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Loader2, Send, Heart, Inbox } from 'lucide-react';
import { toast } from 'sonner';
import LoveNoteCard from './LoveNoteCard';
import { Principal } from '@icp-sdk/core/principal';

// A pool of anonymous recipient principals for demo purposes
// In production, the backend would handle random recipient selection
const ANONYMOUS_RECIPIENT = Principal.fromText('2vxsx-fae');

export default function LoveNotes() {
  const { identity } = useInternetIdentity();
  const [message, setMessage] = useState('');
  const sendNote = useSendLoveNote();
  const { data: myNotes, isLoading: notesLoading } = useGetMyLoveNotes();

  const MAX_CHARS = 280;
  const remaining = MAX_CHARS - message.length;

  if (!identity) {
    return (
      <div className="container py-16 max-w-2xl mx-auto text-center">
        <div className="text-6xl mb-4">💌</div>
        <h2 className="text-2xl font-bold mb-2">Love Notes to Strangers</h2>
        <p className="text-muted-foreground">Please log in to send and receive love notes.</p>
      </div>
    );
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      // Send to a random/anonymous recipient
      await sendNote.mutateAsync({
        recipient: ANONYMOUS_RECIPIENT,
        message: message.trim(),
      });
      setMessage('');
      toast.success('Your love note has been sent to a stranger! 💌', {
        description: 'Someone out there just received a little warmth from you.',
      });
    } catch (error) {
      console.error('Error sending love note:', error);
      toast.error('Failed to send love note. Please try again.');
    }
  };

  return (
    <div className="container py-8 max-w-2xl mx-auto px-4 space-y-8">
      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <img
            src="/assets/generated/love-note-envelope.dim_256x256.png"
            alt="Love Notes"
            className="h-24 w-24 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'block';
            }}
          />
          <div className="hidden text-6xl">💌</div>
        </div>
        <h1 className="text-3xl font-bold text-rose-700">Love Notes to Strangers</h1>
        <p className="text-muted-foreground text-base max-w-md mx-auto">
          Send an anonymous note of warmth to a random stranger. You never know whose day you might brighten. 💕
        </p>
      </div>

      {/* Send Form */}
      <Card className="border-rose-200 shadow-lg bg-gradient-to-br from-white to-rose-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-rose-700">
            <Heart className="h-5 w-5 fill-rose-400 text-rose-400" />
            Write a Love Note
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="space-y-4">
            <div className="relative">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, MAX_CHARS))}
                placeholder="Write something kind, uplifting, or simply warm... Your note will be sent anonymously to a stranger who needs it. 💕"
                rows={5}
                className="resize-none border-rose-200 focus:border-rose-400 focus:ring-rose-300 bg-white/80"
              />
              <div className={`absolute bottom-3 right-3 text-xs font-medium ${remaining < 30 ? 'text-red-500' : 'text-muted-foreground'}`}>
                {remaining}
              </div>
            </div>
            <Button
              type="submit"
              disabled={sendNote.isPending || !message.trim()}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              {sendNote.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send to a Stranger 💌
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Inbox */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Inbox className="h-5 w-5 text-rose-500" />
          <h2 className="text-xl font-bold text-rose-700">Your Love Notes Inbox</h2>
          {myNotes && myNotes.length > 0 && (
            <span className="bg-rose-100 text-rose-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {myNotes.length}
            </span>
          )}
        </div>

        {notesLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-rose-400" />
          </div>
        ) : !myNotes || myNotes.length === 0 ? (
          <Card className="border-rose-100 bg-gradient-to-br from-rose-50 to-pink-50">
            <CardContent className="py-16 text-center space-y-4">
              <div className="text-6xl">📭</div>
              <div>
                <p className="font-semibold text-rose-600 text-lg">Your inbox is empty</p>
                <p className="text-muted-foreground text-sm mt-2 max-w-xs mx-auto">
                  Love notes from kind strangers will appear here. The universe is preparing something warm for you! 💕
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...myNotes].sort((a, b) => Number(b.timestamp - a.timestamp)).map(note => (
              <LoveNoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
