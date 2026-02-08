import { Flame, Sparkles, MessageCircle, Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { useLikePost, type Post } from '../hooks/useQueries';
import { toast } from 'sonner';

interface ReelActionOverlayProps {
  post: Post;
}

export default function ReelActionOverlay({ post }: ReelActionOverlayProps) {
  const likeMutation = useLikePost();

  const handleSpark = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    likeMutation.mutate(post.id, {
      onSuccess: () => {
        toast.success('Sparked! 🔥');
      },
    });
  };

  const handleInspire = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toast.success('Inspired! ✨');
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toast.info('Comments coming soon!');
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toast.success('Share feature coming soon!');
  };

  return (
    <div className="absolute bottom-32 right-4 flex flex-col gap-4 z-20">
      <div className="flex flex-col items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          className="h-14 w-14 rounded-full bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-lg hover:shadow-xl transition-all"
          onClick={handleSpark}
          disabled={likeMutation.isPending}
        >
          <Flame className="h-7 w-7 text-white fill-white" />
        </Button>
        <span className="text-white text-xs font-semibold">{Number(post.likes)}</span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          className="h-14 w-14 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 hover:from-gray-300 hover:to-gray-400 shadow-lg hover:shadow-xl transition-all"
          onClick={handleInspire}
        >
          <Sparkles className="h-7 w-7 text-white fill-white" />
        </Button>
        <span className="text-white text-xs font-semibold">Inspire</span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          className="h-14 w-14 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 shadow-lg hover:shadow-xl transition-all"
          onClick={handleComment}
        >
          <MessageCircle className="h-7 w-7 text-white fill-white" />
        </Button>
        <span className="text-white text-xs font-semibold">{Number(post.comments)}</span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          className="h-14 w-14 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all"
          onClick={handleShare}
        >
          <Share2 className="h-7 w-7 text-white" />
        </Button>
        <span className="text-white text-xs font-semibold">Share</span>
      </div>
    </div>
  );
}
