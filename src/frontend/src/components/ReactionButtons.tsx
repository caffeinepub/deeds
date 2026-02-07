import { useState } from 'react';
import { Button } from './ui/button';
import { useLikePost, type Post } from '../hooks/useQueries';
import { toast } from 'sonner';
import CommentsSection from './CommentsSection';
import { useLanguage } from '../contexts/LanguageContext';

interface ReactionButtonsProps {
  post: Post;
}

export default function ReactionButtons({ post }: ReactionButtonsProps) {
  const { t } = useLanguage();
  const [showComments, setShowComments] = useState(false);
  const [sparked, setSparked] = useState(false);
  const [inspired, setInspired] = useState(false);
  const likePost = useLikePost();

  const handleSpark = async () => {
    if (sparked) return;
    try {
      await likePost.mutateAsync(post.id);
      setSparked(true);
      toast.success(`✨ ${t('reaction.sparked')}`, {
        description: 'Your spark lights up this deed!',
      });
    } catch (error) {
      console.error('Error sparking post:', error);
    }
  };

  const handleInspire = () => {
    if (inspired) return;
    setInspired(true);
    toast.success(`🌟 ${t('reaction.inspired')}`, {
      description: 'You found this inspiring!',
    });
  };

  const handleShare = () => {
    toast.success(`📤 ${t('reaction.share')}`, {
      description: 'Share functionality coming soon!',
    });
  };

  return (
    <>
      <div className="flex items-center justify-between w-full text-sm text-muted-foreground px-2 mb-3">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-sm">
            <span className="text-primary font-bold">{Number(post.likes)}</span> Sparks
          </span>
          <span className="font-semibold text-sm">
            <span className="text-cyan-500 font-bold">{Number(post.comments)}</span> Comments
          </span>
        </div>
      </div>

      <div className="flex items-center justify-around w-full border-t pt-3 gap-2">
        <Button
          variant="ghost"
          size="lg"
          onClick={handleSpark}
          disabled={likePost.isPending || sparked}
          className={`gap-2 flex-1 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl group ${
            sparked ? 'bg-red-50 dark:bg-red-950/20' : ''
          }`}
        >
          <img
            src="/assets/generated/spark-reaction-red-metallic-transparent.dim_64x64.png"
            alt="Spark"
            className={`h-6 w-6 transition-all duration-200 ${
              sparked ? 'scale-110' : 'group-hover:scale-110'
            }`}
          />
          <span className={`font-semibold text-sm ${sparked ? 'text-red-600' : 'text-foreground'}`}>
            {t('reaction.spark')}
          </span>
        </Button>

        <Button
          variant="ghost"
          size="lg"
          onClick={handleInspire}
          disabled={inspired}
          className={`gap-2 flex-1 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl group ${
            inspired ? 'bg-red-50 dark:bg-red-950/20' : ''
          }`}
        >
          <img
            src="/assets/generated/inspire-reaction-red-metallic-transparent.dim_64x64.png"
            alt="Inspire"
            className={`h-6 w-6 transition-all duration-200 ${
              inspired ? 'scale-110' : 'group-hover:scale-110'
            }`}
          />
          <span className={`font-semibold text-sm ${inspired ? 'text-red-600' : 'text-foreground'}`}>
            {t('reaction.inspire')}
          </span>
        </Button>

        <Button
          variant="ghost"
          size="lg"
          onClick={() => setShowComments(!showComments)}
          className={`gap-2 flex-1 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl group ${
            showComments ? 'bg-red-50 dark:bg-red-950/20' : ''
          }`}
        >
          <img
            src="/assets/generated/heart-reaction-red-metallic-transparent.dim_64x64.png"
            alt="Comment"
            className="h-6 w-6 transition-all duration-200 group-hover:scale-110"
          />
          <span className={`font-semibold text-sm ${showComments ? 'text-red-600' : 'text-foreground'}`}>
            {t('reaction.comment')}
          </span>
        </Button>

        <Button
          variant="ghost"
          size="lg"
          onClick={handleShare}
          className="gap-2 flex-1 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded-xl group"
        >
          <img
            src="/assets/generated/share-reaction-deeds-exclusive-transparent.dim_64x64.png"
            alt="Share"
            className="h-6 w-6 transition-all duration-200 group-hover:scale-110"
          />
          <span className="font-semibold text-sm text-foreground">
            {t('reaction.share')}
          </span>
        </Button>
      </div>

      {showComments && <CommentsSection postId={post.id} />}
    </>
  );
}

