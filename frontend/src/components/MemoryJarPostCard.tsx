import { useGetUserProfile, useRemoveFromMemoryJar } from '../hooks/useQueries';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { MemoryJarEntry } from '../backend';
import type { Post } from '../hooks/useQueries';

interface MemoryJarPostCardProps {
  entry: MemoryJarEntry;
  post?: Post;
}

export default function MemoryJarPostCard({ entry, post }: MemoryJarPostCardProps) {
  const { data: authorProfile } = useGetUserProfile(post?.author ?? null);
  const removeFromJar = useRemoveFromMemoryJar();

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await removeFromJar.mutateAsync(entry.postId);
      toast.success('Removed from Memory Jar');
    } catch (error) {
      toast.error('Failed to remove from jar');
    }
  };

  return (
    <div className="group relative rounded-2xl overflow-hidden border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-md hover:shadow-lg transition-all duration-300">
      {/* Polaroid-style top */}
      {post?.photo ? (
        <div className="aspect-square overflow-hidden bg-amber-100">
          <img
            src={post.photo.getDirectURL()}
            alt="Memory"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : post?.video ? (
        <div className="aspect-square overflow-hidden bg-amber-100 flex items-center justify-center">
          <video
            src={post.video.getDirectURL()}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-square bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center p-4">
          <p className="text-sm text-amber-700 text-center italic line-clamp-5">
            "{post?.caption || 'A cherished deed'}"
          </p>
        </div>
      )}

      {/* Card body */}
      <div className="p-3 space-y-2">
        {post?.caption && post.photo && (
          <p className="text-xs text-amber-800 line-clamp-2 italic">"{post.caption}"</p>
        )}

        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            {authorProfile?.profilePicture && (
              <AvatarImage src={authorProfile.profilePicture.getDirectURL()} alt={authorProfile.name} />
            )}
            <AvatarFallback className="text-xs bg-amber-200 text-amber-700">
              {authorProfile ? getInitials(authorProfile.name) : '?'}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-amber-700 font-medium truncate">
            {authorProfile?.name || 'Anonymous'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-amber-500" style={{ fontFamily: 'cursive' }}>
            Saved {formatDate(entry.savedAt)}
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 hover:bg-red-50"
            onClick={handleRemove}
            disabled={removeFromJar.isPending}
            title="Remove from jar"
          >
            {removeFromJar.isPending ? (
              <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Decorative corner */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-amber-400/80 text-white text-xs px-1.5 py-0.5 rounded-full">🫙</div>
      </div>
    </div>
  );
}
