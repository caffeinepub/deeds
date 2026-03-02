import React, { useState } from 'react';
import { useGetMemoryJar, useRemoveFromMemoryJar, useGetAllPosts } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import MemoryJarPostCard from './MemoryJarPostCard';

export default function MemoryJarView() {
  const { data: jarEntries = [], isLoading } = useGetMemoryJar();
  const { data: allPosts = [] } = useGetAllPosts();
  const removeFromJar = useRemoveFromMemoryJar();
  const [showPublicOnly, setShowPublicOnly] = useState(false);

  const displayedEntries = showPublicOnly
    ? jarEntries.filter((e) => e.isPublic)
    : jarEntries;

  const getPostForEntry = (postId: string) => {
    return allPosts.find((p) => p.id === postId) ?? null;
  };

  const handleRemove = async (postId: string) => {
    try {
      await removeFromJar.mutateAsync(postId);
      toast.success('Removed from Memory Jar');
    } catch {
      toast.error('Failed to remove from Memory Jar');
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🫙</span>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Memory Jar</h3>
            <p className="text-xs text-muted-foreground">Your scrapbook of human goodness</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="public-filter" className="text-xs text-muted-foreground">
            Public only
          </Label>
          <Switch
            id="public-filter"
            checked={showPublicOnly}
            onCheckedChange={setShowPublicOnly}
          />
        </div>
      </div>

      {displayedEntries.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">🫙</div>
          <p className="font-medium text-foreground text-sm">Your Memory Jar is empty</p>
          <p className="text-xs text-muted-foreground mt-1">
            Save deeds from others to collect moments of human goodness
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {displayedEntries.map((entry) => {
            const post = getPostForEntry(entry.postId);
            return (
              <MemoryJarPostCard
                key={entry.postId}
                entry={entry}
                post={post}
                onRemove={() => handleRemove(entry.postId)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
