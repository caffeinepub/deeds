import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { Post, useGetUserProfile, useLikePost, useSaveToMemoryJar } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import CommentsSection from './CommentsSection';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface PostCardProps {
  post: Post;
}

const CATEGORY_LABELS: Record<string, string> = {
  environmental: '🌿 Environment',
  communityService: '🤝 Community',
  actsOfKindness: '💛 Kindness',
  other: '✨ Deed',
};

const CATEGORY_COLORS: Record<string, string> = {
  environmental: 'bg-green-100 text-green-700 border-green-200',
  communityService: 'bg-blue-100 text-blue-700 border-blue-200',
  actsOfKindness: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  other: 'bg-purple-100 text-purple-700 border-purple-200',
};

export default function PostCard({ post }: PostCardProps) {
  const { identity } = useInternetIdentity();
  const authorPrincipal = post.author?.toString() ?? null;
  const { data: authorProfile } = useGetUserProfile(authorPrincipal);
  const likePost = useLikePost();
  const saveToJar = useSaveToMemoryJar();

  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const categoryKind = post.category?.__kind__ ?? 'other';
  const categoryLabel = CATEGORY_LABELS[categoryKind] ?? '✨ Deed';
  const categoryColor = CATEGORY_COLORS[categoryKind] ?? CATEGORY_COLORS.other;

  const getPhotoUrl = () => {
    if (post.photo && post.photo.__kind__ === 'Some') {
      try {
        const blob = post.photo.value;
        if (blob && typeof blob.getDirectURL === 'function') {
          return blob.getDirectURL();
        }
      } catch {
        // fallback
      }
    }
    return null;
  };

  const getVideoUrl = () => {
    if (post.video && post.video.__kind__ === 'Some') {
      try {
        const blob = post.video.value;
        if (blob && typeof blob.getDirectURL === 'function') {
          return blob.getDirectURL();
        }
      } catch {
        // fallback
      }
    }
    return null;
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      await likePost.mutateAsync(post.id);
    } catch {
      toast.error('Failed to like post');
    } finally {
      setIsLiking(false);
    }
  };

  const handleSaveToJar = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await saveToJar.mutateAsync(post.id);
      toast.success('Saved to Memory Jar! 🫙');
    } catch {
      toast.error('Failed to save to Memory Jar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Deed on Deeds', text: post.caption });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  const photoUrl = getPhotoUrl();
  const videoUrl = getVideoUrl();
  const timestamp = new Date(Number(post.timestamp) / 1_000_000).toLocaleDateString();

  return (
    <article className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Author */}
      <div className="flex items-center justify-between p-3 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
            <span className="text-sm font-bold text-primary">
              {authorProfile?.name?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-none">
              {authorProfile?.name ?? 'Anonymous'}
            </p>
            <p className="text-xs text-muted-foreground">{timestamp}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Category Badge */}
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${categoryColor}`}>
            {categoryLabel}
          </span>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Caption */}
      <div className="px-3 pb-2">
        <p className="text-sm text-foreground leading-relaxed">{post.caption}</p>
      </div>

      {/* Media */}
      {photoUrl && (
        <div className="mx-3 mb-2 rounded-lg overflow-hidden">
          <img
            src={photoUrl}
            alt="Post"
            className="w-full max-h-64 object-cover"
            loading="lazy"
          />
        </div>
      )}
      {videoUrl && (
        <div className="mx-3 mb-2 rounded-lg overflow-hidden">
          <video
            src={videoUrl}
            className="w-full max-h-64 object-cover"
            controls
            preload="metadata"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className="flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
          >
            <Heart className="w-4 h-4" />
            <span className="text-xs">{Number(post.likes)}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">{Number(post.comments)}</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Save to Memory Jar */}
        <button
          onClick={handleSaveToJar}
          disabled={isSaving}
          className="flex items-center gap-1 text-muted-foreground hover:text-amber-500 transition-colors disabled:opacity-50"
          title="Save to Memory Jar"
        >
          {isSaving ? (
            <span className="w-4 h-4 border-2 border-muted-foreground/30 border-t-amber-500 rounded-full animate-spin" />
          ) : (
            <span className="text-base">🫙</span>
          )}
          <span className="text-xs">Save</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && <CommentsSection postId={post.id} />}
    </article>
  );
}
