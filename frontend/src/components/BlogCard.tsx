import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Tag, Calendar } from 'lucide-react';
import { Blog, useGetUserProfile } from '../hooks/useQueries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface BlogCardProps {
  blog: Blog;
}

export default function BlogCard({ blog }: BlogCardProps) {
  const authorPrincipal = blog.author?.toString() ?? null;
  const { data: authorProfile } = useGetUserProfile(authorPrincipal);
  const [liked, setLiked] = useState(false);

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

  const getMediaUrl = (mediaItem: any): string | null => {
    if (!mediaItem) return null;
    if (typeof mediaItem.getDirectURL === 'function') {
      return mediaItem.getDirectURL();
    }
    return null;
  };

  const timestamp = new Date(Number(blog.timestamp) / 1_000_000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied!');
  };

  return (
    <article className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Media */}
      {blog.media && blog.media.length > 0 && getMediaUrl(blog.media[0]) && (
        <div className="h-48 overflow-hidden">
          <img
            src={getMediaUrl(blog.media[0])!}
            alt={blog.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-4">
        {/* Author */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={getAvatarUrl()} alt={authorProfile?.name} />
            <AvatarFallback className="text-xs">
              {authorProfile?.name?.[0]?.toUpperCase() ?? '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground leading-none">
              {authorProfile?.name ?? 'Anonymous'}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{timestamp}</p>
            </div>
          </div>
          {blog.isLive && (
            <Badge variant="destructive" className="ml-auto text-xs">
              LIVE
            </Badge>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-foreground text-base mb-2 line-clamp-2">{blog.title}</h3>

        {/* Content preview */}
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{blog.content}</p>

        {/* Categories & Tags */}
        {(blog.categories.length > 0 || blog.tags.length > 0) && (
          <div className="flex flex-wrap gap-1 mb-3">
            {blog.categories.slice(0, 2).map((cat) => (
              <Badge key={cat} variant="secondary" className="text-xs">
                {cat}
              </Badge>
            ))}
            {blog.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-xs text-primary flex items-center gap-0.5">
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2 border-t border-border">
          <button
            onClick={() => setLiked(!liked)}
            className={`flex items-center gap-1 text-sm transition-colors ${
              liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            <span>{Number(blog.likes) + (liked ? 1 : 0)}</span>
          </button>
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span>{Number(blog.comments)}</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors ml-auto"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
