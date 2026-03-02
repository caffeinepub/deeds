import React, { useState } from 'react';
import { useGetRippleChain, useGetUserProfile } from '../hooks/useQueries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { GitBranch, Plus } from 'lucide-react';
import CreatePostModal from './CreatePostModal';

interface RippleChainViewProps {
  postId: string;
  onClose?: () => void;
}

function RipplePost({ post }: { post: any }) {
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

  const getPhotoUrl = (): string | null => {
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
  const timestamp = new Date(Number(post.timestamp) / 1_000_000).toLocaleDateString();

  return (
    <div className="flex gap-3 py-3 border-b border-border last:border-0">
      <div className="flex flex-col items-center">
        <Avatar className="w-8 h-8">
          <AvatarImage src={getAvatarUrl()} alt={authorProfile?.name} />
          <AvatarFallback className="text-xs">
            {authorProfile?.name?.[0]?.toUpperCase() ?? '?'}
          </AvatarFallback>
        </Avatar>
        <div className="w-0.5 bg-border flex-1 mt-1" />
      </div>
      <div className="flex-1 min-w-0 pb-2">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-semibold text-foreground">
            {authorProfile?.name ?? 'Anonymous'}
          </span>
          <span className="text-xs text-muted-foreground">{timestamp}</span>
        </div>
        <p className="text-sm text-foreground">{post.caption}</p>
        {photoUrl && (
          <img
            src={photoUrl}
            alt="Post"
            className="mt-2 rounded-lg max-h-32 object-cover"
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
}

export default function RippleChainView({ postId, onClose }: RippleChainViewProps) {
  const { data: chain = [], isLoading } = useGetRippleChain(postId);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground text-sm">Ripple Chain</h3>
          <span className="text-xs text-muted-foreground">({chain.length} deeds)</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-7"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Ripple
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3">
        {isLoading ? (
          <div className="space-y-3 py-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : chain.length === 0 ? (
          <div className="text-center py-8">
            <GitBranch className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No ripples yet</p>
            <p className="text-xs text-muted-foreground mt-1">Be the first to continue this deed!</p>
          </div>
        ) : (
          <div className="py-2">
            {chain.map((post: any) => (
              <RipplePost key={post.id} post={post} />
            ))}
          </div>
        )}
      </ScrollArea>

      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
