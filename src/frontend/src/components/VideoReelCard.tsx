import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useGetUserProfile, type Post } from '../hooks/useQueries';
import { Badge } from './ui/badge';
import UserProfileModal from './UserProfileModal';
import ModerationWarningBanner from './ModerationWarningBanner';
import ReactionButtons from './ReactionButtons';

interface VideoReelCardProps {
  post: Post;
  isVideoMode?: boolean;
  isActive?: boolean;
}

export default function VideoReelCard({ post, isVideoMode = false, isActive = false }: VideoReelCardProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { data: authorProfile } = useGetUserProfile(post.author);

  // Auto-play when active in video mode
  useEffect(() => {
    if (isVideoMode && isActive && videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    } else if (isVideoMode && !isActive && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isVideoMode, isActive]);

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const getCategoryLabel = (categoryKind: string) => {
    switch (categoryKind) {
      case 'environmental':
        return 'Environmental';
      case 'communityService':
        return 'Community Service';
      case 'actsOfKindness':
        return 'Acts of Kindness';
      case 'other':
        return 'Other';
      default:
        return categoryKind;
    }
  };

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
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const categoryStr = post.category.__kind__;

  if (isVideoMode) {
    // Full-screen video mode layout
    return (
      <>
        <div className="relative h-full w-full bg-black flex items-center justify-center">
          {post.isFlagged && (
            <div className="absolute top-4 left-4 right-4 z-10">
              <ModerationWarningBanner />
            </div>
          )}

          {post.video && (
            <video
              ref={videoRef}
              src={post.video.getDirectURL()}
              className="w-full h-full object-contain"
              loop
              playsInline
              muted={isMuted}
              onClick={handlePlayPause}
            />
          )}

          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Button
                size="icon"
                variant="ghost"
                className="h-20 w-20 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm pointer-events-auto"
                onClick={handlePlayPause}
              >
                <Play className="h-10 w-10 text-white fill-white" />
              </Button>
            </div>
          )}

          <div className="absolute bottom-4 right-4 flex flex-col gap-3 z-10 pointer-events-auto">
            <Button
              size="icon"
              variant="ghost"
              className="h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm"
              onClick={handleMuteToggle}
            >
              {isMuted ? (
                <VolumeX className="h-6 w-6 text-white" />
              ) : (
                <Volume2 className="h-6 w-6 text-white" />
              )}
            </Button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-auto">
            <button
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-3 mb-3 transition-all hover:opacity-80"
            >
              <Avatar className="h-12 w-12 ring-2 ring-white/50">
                {authorProfile?.profilePicture && (
                  <AvatarImage
                    src={authorProfile.profilePicture.getDirectURL()}
                    alt={authorProfile.name}
                  />
                )}
                <AvatarFallback className="bg-gradient-to-br from-primary via-secondary to-accent text-white font-bold">
                  {authorProfile ? getInitials(authorProfile.name) : '?'}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="font-bold text-white text-lg">{authorProfile?.name || 'Anonymous'}</p>
                <p className="text-sm text-white/80">{formatTimestamp(post.timestamp)}</p>
              </div>
            </button>

            {post.caption && (
              <p className="text-white text-base leading-relaxed mb-3">{post.caption}</p>
            )}

            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {getCategoryLabel(categoryStr)}
              </Badge>
            </div>

            <div className="mt-4">
              <ReactionButtons post={post} />
            </div>
          </div>
        </div>

        {showProfile && (
          <UserProfileModal userPrincipal={post.author} onClose={() => setShowProfile(false)} />
        )}
      </>
    );
  }

  // Regular card layout
  return (
    <>
      <Card className="overflow-hidden border-0 shadow-premium hover:shadow-premium-hover transition-all duration-300 bg-card/95 backdrop-blur-md rounded-2xl animate-fade-in">
        {post.isFlagged && (
          <div className="px-6 pt-6">
            <ModerationWarningBanner />
          </div>
        )}

        <CardContent className="p-0 relative">
          <div className="relative bg-black aspect-[9/16] max-h-[600px] group">
            {post.video && (
              <video
                ref={videoRef}
                src={post.video.getDirectURL()}
                className="w-full h-full object-contain"
                loop
                playsInline
                muted={isMuted}
                onClick={handlePlayPause}
              />
            )}

            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-20 w-20 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm pointer-events-auto"
                  onClick={handlePlayPause}
                >
                  <Play className="h-10 w-10 text-white fill-white" />
                </Button>
              </div>
            )}

            <div className="absolute bottom-4 right-4 flex flex-col gap-2 pointer-events-auto">
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm"
                onClick={handleMuteToggle}
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5 text-white" />
                ) : (
                  <Volume2 className="h-5 w-5 text-white" />
                )}
              </Button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-auto">
              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center gap-3 mb-3 transition-all hover:opacity-80"
              >
                <Avatar className="h-10 w-10 ring-2 ring-white/50">
                  {authorProfile?.profilePicture && (
                    <AvatarImage
                      src={authorProfile.profilePicture.getDirectURL()}
                      alt={authorProfile.name}
                    />
                  )}
                  <AvatarFallback className="bg-gradient-to-br from-primary via-secondary to-accent text-white font-bold text-sm">
                    {authorProfile ? getInitials(authorProfile.name) : '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="font-bold text-white">{authorProfile?.name || 'Anonymous'}</p>
                  <p className="text-xs text-white/80">{formatTimestamp(post.timestamp)}</p>
                </div>
              </button>

              {post.caption && (
                <p className="text-white text-sm leading-relaxed mb-2">{post.caption}</p>
              )}

              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {getCategoryLabel(categoryStr)}
              </Badge>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-4 pb-4">
          <ReactionButtons post={post} />
        </CardFooter>
      </Card>

      {showProfile && (
        <UserProfileModal userPrincipal={post.author} onClose={() => setShowProfile(false)} />
      )}
    </>
  );
}
