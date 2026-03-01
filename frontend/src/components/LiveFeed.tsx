import { useState } from 'react';
import { useGetActiveLiveSessions, useGetUserProfile, type LiveSession } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Radio, Users, Eye } from 'lucide-react';
import StartLiveModal from './StartLiveModal';
import LiveViewerModal from './LiveViewerModal';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';

export default function LiveFeed() {
  const { data: liveSessions = [], isLoading } = useGetActiveLiveSessions();
  const [showStartLive, setShowStartLive] = useState(false);
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null);

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="text-muted-foreground">Loading live sessions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 pb-24">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Radio className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Live Now</h1>
            <p className="text-sm text-muted-foreground">
              {liveSessions.length} {liveSessions.length === 1 ? 'person' : 'people'} streaming
            </p>
          </div>
        </div>
        <Button 
          onClick={() => setShowStartLive(true)} 
          className="gap-2 transition-all hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
        >
          <Radio className="h-4 w-4" />
          Go Live
        </Button>
      </div>

      {liveSessions.length === 0 ? (
        <Card className="border-dashed transition-all hover:shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="p-4 bg-muted rounded-full">
              <Radio className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No Live Streams</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Be the first to go live and share your good deeds with the community!
            </p>
            <Button 
              onClick={() => setShowStartLive(true)} 
              className="gap-2 mt-2 transition-all hover:scale-105 active:scale-95"
            >
              <Radio className="h-4 w-4" />
              Start Broadcasting
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {liveSessions.map((session) => (
            <LiveSessionCard
              key={session.id}
              session={session}
              onJoin={() => setSelectedSession(session)}
            />
          ))}
        </div>
      )}

      {showStartLive && <StartLiveModal onClose={() => setShowStartLive(false)} />}
      {selectedSession && (
        <LiveViewerModal session={selectedSession} onClose={() => setSelectedSession(null)} />
      )}
    </div>
  );
}

function LiveSessionCard({
  session,
  onJoin,
}: {
  session: LiveSession;
  onJoin: () => void;
}) {
  const { data: broadcasterProfile } = useGetUserProfile(session.broadcaster);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg cursor-pointer group" onClick={onJoin}>
      <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-primary text-primary-foreground gap-1 animate-pulse px-3 py-1">
            <div className="h-2 w-2 rounded-full bg-white" />
            LIVE
          </Badge>
        </div>
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="secondary" className="gap-1 px-3 py-1">
            <Eye className="h-3 w-3" />
            {Number(session.viewers)}
          </Badge>
        </div>
        <Radio className="h-16 w-16 text-primary/40 group-hover:scale-110 transition-transform" />
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
            {broadcasterProfile?.profilePicture && (
              <AvatarImage
                src={broadcasterProfile.profilePicture.getDirectURL()}
                alt={broadcasterProfile.name}
              />
            )}
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
              {broadcasterProfile ? getInitials(broadcasterProfile.name) : '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">
              {broadcasterProfile?.name || 'Anonymous'}
            </CardTitle>
            <p className="text-xs text-muted-foreground">Broadcasting now</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Button className="w-full gap-2 transition-all hover:scale-105 active:scale-95" variant="outline">
          <Users className="h-4 w-4" />
          Join Stream
        </Button>
      </CardContent>
    </Card>
  );
}
