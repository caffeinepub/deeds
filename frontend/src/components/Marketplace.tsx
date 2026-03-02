import React, { useState } from 'react';
import { useGetMarketplacePosts, type Variant_offer_need } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag, Plus, Filter } from 'lucide-react';
import MarketplaceCard from './MarketplaceCard';
import CreateMarketplacePostModal from './CreateMarketplacePostModal';
import SkeletonMarketplace from './SkeletonMarketplace';

type FilterType = 'all' | 'need' | 'offer';

export default function Marketplace() {
  const { data: posts = [], isLoading } = useGetMarketplacePosts();
  const [filter, setFilter] = useState<FilterType>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredPosts = posts.filter((post) => {
    if (filter === 'all') return true;
    return post.postType?.__kind__ === filter;
  });

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Marketplace</h1>
        </div>
        <Button size="sm" onClick={() => setShowCreateModal(true)} className="text-xs">
          <Plus className="w-3 h-3 mr-1" />
          Post
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {(['all', 'need', 'offer'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize ${
              filter === f
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-foreground border-border hover:border-primary/50'
            }`}
          >
            {f === 'all' ? 'All' : f === 'need' ? 'Needs' : 'Offers'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonMarketplace key={i} />
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-foreground">No posts yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            {filter === 'all'
              ? 'Be the first to post a need or offer!'
              : `No ${filter}s posted yet.`}
          </p>
          <Button className="mt-4" size="sm" onClick={() => setShowCreateModal(true)}>
            Create Post
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredPosts.map((post) => (
            <MarketplaceCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateMarketplacePostModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
