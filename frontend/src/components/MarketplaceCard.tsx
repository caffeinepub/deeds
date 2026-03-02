import React from 'react';
import { MapPin, Phone, Heart, MessageCircle } from 'lucide-react';
import { MarketplacePost, useGetUserProfile } from '../hooks/useQueries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MarketplaceCardProps {
  post: MarketplacePost;
}

const CATEGORY_LABELS: Record<string, string> = {
  environment: '🌿 Environment',
  education: '📚 Education',
  communitySupport: '🤝 Community',
  animalWelfare: '🐾 Animals',
  emotionalSupport: '💛 Support',
  other: '✨ Other',
};

export default function MarketplaceCard({ post }: MarketplaceCardProps) {
  const authorPrincipal = post.author?.toString() ?? null;
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

  const getMediaUrl = (): string | null => {
    if (post.media && post.media.__kind__ === 'Some') {
      try {
        const blob = post.media.value;
        if (blob && typeof blob.getDirectURL === 'function') {
          return blob.getDirectURL();
        }
      } catch {
        // fallback
      }
    }
    return null;
  };

  const categoryKind = post.category?.__kind__ ?? 'other';
  const categoryLabel = CATEGORY_LABELS[categoryKind] ?? '✨ Other';
  const isOffer = post.postType?.__kind__ === 'offer';
  const mediaUrl = getMediaUrl();
  const timestamp = new Date(Number(post.timestamp) / 1_000_000).toLocaleDateString();

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Media */}
      {mediaUrl && (
        <div className="h-36 overflow-hidden">
          <img
            src={mediaUrl}
            alt={post.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-3 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm line-clamp-1">{post.title}</h3>
            <p className="text-xs text-muted-foreground">{timestamp}</p>
          </div>
          <Badge
            variant={isOffer ? 'default' : 'secondary'}
            className="text-xs flex-shrink-0"
          >
            {isOffer ? 'Offer' : 'Need'}
          </Badge>
        </div>

        {/* Category */}
        <span className="text-xs text-muted-foreground mb-2">{categoryLabel}</span>

        {/* Description */}
        <p className="text-xs text-foreground line-clamp-2 mb-3 flex-1">{post.description}</p>

        {/* Author */}
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="w-6 h-6">
            <AvatarImage src={getAvatarUrl()} alt={authorProfile?.name} />
            <AvatarFallback className="text-xs">
              {authorProfile?.name?.[0]?.toUpperCase() ?? '?'}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate">
            {authorProfile?.name ?? 'Anonymous'}
          </span>
        </div>

        {/* Location */}
        {post.location && (
          <div className="flex items-center gap-1 mb-3">
            <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground truncate">{post.location}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Button size="sm" variant="outline" className="flex-1 text-xs h-7">
            <MessageCircle className="w-3 h-3 mr-1" />
            Contact
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2">
            <Heart className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
