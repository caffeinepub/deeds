import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Heart, MessageCircle, Image as ImageIcon, Video, Music } from 'lucide-react';
import { useGetUserProfile, type Blog } from '../hooks/useQueries';
import { Badge } from './ui/badge';
import UserProfileModal from './UserProfileModal';

interface BlogCardProps {
  blog: Blog;
}

export default function BlogCard({ blog }: BlogCardProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const { data: authorProfile } = useGetUserProfile(blog.author);

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
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const truncateContent = (content: string, maxLength: number) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };

  const hasImages = blog.media.some((m) => {
    const url = m.getDirectURL();
    return url.includes('image') || url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  });

  const hasVideos = blog.media.some((m) => {
    const url = m.getDirectURL();
    return url.includes('video') || url.match(/\.(mp4|mov|avi|webm)$/i);
  });

  const hasAudio = blog.media.some((m) => {
    const url = m.getDirectURL();
    return url.includes('audio') || url.match(/\.(mp3|wav|ogg)$/i);
  });

  return (
    <>
      <Card className="overflow-hidden bg-white/95 backdrop-blur transition-all hover:shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <button
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-3 transition-all hover:opacity-80 active:scale-95"
            >
              <Avatar className="h-11 w-11 ring-2 ring-transparent hover:ring-primary/20 transition-all">
                {authorProfile?.profilePicture && (
                  <AvatarImage
                    src={authorProfile.profilePicture.getDirectURL()}
                    alt={authorProfile.name}
                  />
                )}
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {authorProfile ? getInitials(authorProfile.name) : '?'}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="font-semibold text-base">{authorProfile?.name || 'Anonymous'}</p>
                <p className="text-xs text-muted-foreground">{formatTimestamp(blog.timestamp)}</p>
              </div>
            </button>
            <div className="flex gap-2">
              {blog.isLive && (
                <Badge variant="destructive" className="animate-pulse px-3 py-1">
                  LIVE
                </Badge>
              )}
              {hasImages && (
                <Badge variant="secondary" className="flex items-center gap-1 px-2">
                  <ImageIcon className="h-3 w-3" />
                </Badge>
              )}
              {hasVideos && (
                <Badge variant="secondary" className="flex items-center gap-1 px-2">
                  <Video className="h-3 w-3" />
                </Badge>
              )}
              {hasAudio && (
                <Badge variant="secondary" className="flex items-center gap-1 px-2">
                  <Music className="h-3 w-3" />
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pb-4">
          <h3 className="text-xl font-bold tracking-tight">{blog.title}</h3>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {showFullContent ? blog.content : truncateContent(blog.content, 200)}
          </p>
          {blog.content.length > 200 && (
            <Button
              variant="link"
              size="sm"
              onClick={() => setShowFullContent(!showFullContent)}
              className="p-0 h-auto font-medium transition-all hover:text-primary"
            >
              {showFullContent ? 'Show less' : 'Read more'}
            </Button>
          )}

          {blog.media.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {blog.media.slice(0, 4).map((media, idx) => {
                const url = media.getDirectURL();
                const isVideo = url.includes('video') || url.match(/\.(mp4|mov|avi|webm)$/i);
                const isAudio = url.includes('audio') || url.match(/\.(mp3|wav|ogg)$/i);

                if (isVideo) {
                  return (
                    <video
                      key={idx}
                      src={url}
                      controls
                      className="w-full rounded-lg object-cover max-h-48 transition-transform hover:scale-[1.02]"
                      preload="metadata"
                    />
                  );
                } else if (isAudio) {
                  return (
                    <div key={idx} className="col-span-2">
                      <audio src={url} controls className="w-full" />
                    </div>
                  );
                } else {
                  return (
                    <img
                      key={idx}
                      src={url}
                      alt="Blog media"
                      className="w-full rounded-lg object-cover max-h-48 transition-transform hover:scale-[1.02]"
                    />
                  );
                }
              })}
            </div>
          )}

          {blog.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {blog.categories.map((category, idx) => (
                <Badge key={idx} variant="outline" className="px-3 py-1 transition-all hover:bg-accent">
                  {category}
                </Badge>
              ))}
            </div>
          )}

          {blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag, idx) => (
                <span key={idx} className="text-xs text-primary font-medium transition-all hover:text-primary/80">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 transition-all hover:bg-primary/10 hover:text-primary active:scale-95"
            >
              <Heart className="h-4 w-4" />
              <span className="font-medium">{Number(blog.likes)}</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 transition-all hover:bg-primary/10 hover:text-primary active:scale-95">
              <MessageCircle className="h-4 w-4" />
              <span className="font-medium">{Number(blog.comments)}</span>
            </Button>
          </div>
        </CardFooter>
      </Card>

      {showProfile && (
        <UserProfileModal userPrincipal={blog.author} onClose={() => setShowProfile(false)} />
      )}
    </>
  );
}
