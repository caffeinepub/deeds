import React from 'react';
import { X } from 'lucide-react';
import { MemoryJarEntry, Post } from '../hooks/useQueries';
import { useGetUserProfile } from '../hooks/useQueries';

interface MemoryJarPostCardProps {
  entry: MemoryJarEntry;
  post: Post | null;
  onRemove: () => void;
}

export default function MemoryJarPostCard({ entry, post, onRemove }: MemoryJarPostCardProps) {
  const authorPrincipal = post?.author?.toString() ?? null;
  const { data: authorProfile } = useGetUserProfile(authorPrincipal);

  const getPhotoUrl = () => {
    if (post?.photo && post.photo.__kind__ === 'Some') {
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

  const photoUrl = getPhotoUrl();
  const savedDate = new Date(Number(entry.savedAt) / 1_000_000).toLocaleDateString();

  return (
    <div className="relative bg-white rounded-xl shadow-md overflow-hidden border border-border group">
      {/* Remove button */}
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 z-10 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
        title="Remove from Memory Jar"
      >
        <X className="w-3 h-3" />
      </button>

      {/* Public badge */}
      {entry.isPublic && (
        <div className="absolute top-2 left-2 z-10 bg-primary/80 text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
          Public
        </div>
      )}

      {/* Photo area */}
      <div className="h-28 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center overflow-hidden">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="Memory"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-3xl">🌟</span>
        )}
      </div>

      {/* Polaroid bottom */}
      <div className="p-2 bg-white">
        {post?.caption && (
          <p className="text-xs text-gray-700 line-clamp-2 mb-1">{post.caption}</p>
        )}
        <div className="flex items-center gap-1 mt-1">
          <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
            <span className="text-xs">👤</span>
          </div>
          <span className="text-xs text-gray-500 truncate">
            {authorProfile?.name ?? 'Unknown'}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{savedDate}</p>
      </div>
    </div>
  );
}
