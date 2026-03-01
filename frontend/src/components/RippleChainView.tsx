import { useState } from 'react';
import { useGetRippleChain, useGetUserProfile, type Post } from '../hooks/useQueries';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Loader2, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import CreatePostModal from './CreatePostModal';

interface RippleChainViewProps {
  post: Post;
  authorName?: string;
}

function RippleNode({ post, depth = 0 }: { post: Post; depth?: number }) {
  const { data: authorProfile } = useGetUserProfile(post.author);
  const { data: children, isLoading } = useGetRippleChain(post.id);
  const [expanded, setExpanded] = useState(depth < 2);
  const [showInspireModal, setShowInspireModal] = useState(false);

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

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

  const hasChildren = children && children.length > 0;

  return (
    <div className={`relative ${depth > 0 ? 'ml-6 pl-4 border-l-2 border-amber-200' : ''}`}>
      <div
        className="flex gap-3 p-3 rounded-xl bg-white border border-amber-100 shadow-sm hover:shadow-md transition-shadow mb-2"
        style={{ animationDelay: `${depth * 100}ms` }}
      >
        <Avatar className="h-9 w-9 shrink-0">
          {authorProfile?.profilePicture && (
            <AvatarImage src={authorProfile.profilePicture.getDirectURL()} alt={authorProfile.name} />
          )}
          <AvatarFallback className="text-xs bg-amber-100 text-amber-700">
            {authorProfile ? getInitials(authorProfile.name) : '?'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{authorProfile?.name || 'Anonymous'}</span>
            <span className="text-xs text-muted-foreground">{formatTimestamp(post.timestamp)}</span>
            {depth === 0 && <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">Origin</Badge>}
          </div>
          <p className="text-sm mt-1 line-clamp-3">{post.caption}</p>
          {post.photo && (
            <img
              src={post.photo.getDirectURL()}
              alt="Post"
              className="mt-2 rounded-lg w-full max-h-32 object-cover"
            />
          )}
          <button
            onClick={() => setShowInspireModal(true)}
            className="mt-2 text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 transition-colors"
          >
            <Zap className="h-3 w-3" />
            This inspired me ✨
          </button>
        </div>
      </div>

      {hasChildren && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium mb-2 ml-2 transition-colors"
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {children.length} inspired deed{children.length !== 1 ? 's' : ''}
          </button>
          {expanded && (
            <div>
              {children.map(child => (
                <RippleNode key={child.id} post={child} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      )}

      {isLoading && depth > 0 && (
        <div className="ml-6 pl-4">
          <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
        </div>
      )}

      {showInspireModal && (
        <CreatePostModal
          onClose={() => setShowInspireModal(false)}
          parentPostId={post.id}
          parentCaption={post.caption}
          parentAuthorName={authorProfile?.name}
        />
      )}
    </div>
  );
}

export default function RippleChainView({ post, authorName }: RippleChainViewProps) {
  const { data: children, isLoading } = useGetRippleChain(post.id);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <img
          src="/assets/generated/ripple-effect-hero.dim_800x400.png"
          alt="Ripple Effect"
          className="h-8 w-auto rounded object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div>
          <h3 className="font-bold text-sm text-amber-700">Ripple Chain</h3>
          <p className="text-xs text-muted-foreground">
            {isLoading ? 'Loading...' : `${(children?.length || 0)} inspired deed${(children?.length || 0) !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
        </div>
      ) : (
        <RippleNode post={post} depth={0} />
      )}
    </div>
  );
}
