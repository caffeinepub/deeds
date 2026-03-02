import React, { useState } from 'react';
import { useGetLiveSessions, useGetUserProfile, type LiveSession } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Radio, Users, Play } from 'lucide-react';
import StartLiveModal from './StartLiveModal';
import LiveViewerModal from './LiveViewerModal';

function LiveSessionCard({
  session,
  onJoin,
}: {
  session: LiveSession;
  onJoin: (session: LiveSession) => void;
}) {
  const broadcasterPrincipal = session.broadcaster?.toString() ?? null;
  const { data: broadcasterProfile } = useGetUserProfile(broadcasterPrincipal);

  const getAvatarUrl = () => {
    if (broadcasterProfile?.profilePicture && broadcasterProfile.profilePicture.__kind__ === 'Some') {
      try {
        const blob = broadcasterProfile.profilePicture.value;
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
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="h-32 bg-gradient-to-br from-red-500/20 to-primary/10 flex items-center justify-center relative">
        <Radio className="w-12 h-12 text-primary/40" />
        <Badge variant="destructive" className="absolute top-2 left-2 text-xs animate-pulse">
          LIVE
        </Badge>
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 rounded-full px-2 py-0.5">
          <Users className="w-3 h-3 text-white" />
          <span className="text-xs text-white">{Number(session.viewers)}</span>
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={getAvatarUrl()} alt={broadcasterProfile?.name} />
            <AvatarFallback className="text-xs">
              {broadcasterProfile?.name?.[0]?.toUpperCase() ?? '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground leading-none">
              {broadcasterProfile?.name ?? 'Anonymous'}
            </p>
            <p className="text-xs text-muted-foreground">Live now</p>
          </div>
        </div>

        <Button
          size="sm"
          className="w-full text-xs"
          onClick={() => onJoin(session)}
        >
          <Play className="w-3 h-3 mr-1" />
          Join Stream
        </Button>
      </div>
    </div>
  );
}

export default function LiveFeed() {
  const { data: sessions = [], isLoading } = useGetLiveSessions();
  const [showStartModal, setShowStartModal] = useState(false);
  const [viewingSession, setViewingSession] = useState<LiveSession | null>(null);

  const activeSessions = sessions.filter((s) => s.isActive);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Live</h1>
          {activeSessions.length > 0 && (
            <Badge variant="destructive" className="text-xs animate-pulse">
              {activeSessions.length} Live
            </Badge>
          )}
        </div>
        <Button size="sm" onClick={() => setShowStartModal(true)} className="text-xs">
          Go Live
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : activeSessions.length === 0 ? (
        <div className="text-center py-16">
          <Radio className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-foreground">No live streams right now</p>
          <p className="text-sm text-muted-foreground mt-1">Be the first to go live!</p>
          <Button className="mt-4" onClick={() => setShowStartModal(true)}>
            Start Streaming
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {activeSessions.map((session) => (
            <LiveSessionCard
              key={session.id}
              session={session}
              onJoin={setViewingSession}
            />
          ))}
        </div>
      )}

      {showStartModal && (
        <StartLiveModal onClose={() => setShowStartModal(false)} />
      )}
      {viewingSession && (
        <LiveViewerModal
          session={viewingSession}
          onClose={() => setViewingSession(null)}
        />
      )}
    </div>
  );
}
