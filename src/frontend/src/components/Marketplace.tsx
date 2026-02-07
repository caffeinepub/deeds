import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { PlusCircle, Filter } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useGetAllMarketplacePosts, type Variant_offer_need } from '../hooks/useQueries';
import MarketplaceCard from './MarketplaceCard';
import CreateMarketplacePostModal from './CreateMarketplacePostModal';
import SkeletonMarketplace from './SkeletonMarketplace';

type SortFilter = 'newest' | 'closest' | 'popular';

export default function Marketplace() {
  const [activeTab, setActiveTab] = useState<'all' | 'needs' | 'offers'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<SortFilter>('newest');

  const { data: allPosts, isLoading, error } = useGetAllMarketplacePosts();

  const filterByType = (posts: any[] | undefined) => {
    if (!posts) return [];
    if (activeTab === 'all') return posts;
    if (activeTab === 'needs') {
      return posts.filter(p => p.postType.__kind__ === 'need');
    }
    return posts.filter(p => p.postType.__kind__ === 'offer');
  };

  const sortPosts = (posts: any[]) => {
    const sorted = [...posts];
    
    switch (filter) {
      case 'newest':
        return sorted.sort((a, b) => Number(b.timestamp - a.timestamp));
      case 'popular':
        return sorted.sort((a, b) => Number(b.savedCount - a.savedCount));
      case 'closest':
        return sorted;
      default:
        return sorted;
    }
  };

  const displayPosts = sortPosts(filterByType(allPosts));

  if (error) {
    return (
      <div className="container py-8 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-md border">
          <CardContent className="py-16 text-center space-y-4">
            <p className="text-destructive">Error loading marketplace posts</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section - Improved spacing and alignment */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <img 
            src="/assets/generated/marketplace-icon-professional-transparent.dim_64x64.png" 
            alt="Marketplace" 
            className="h-12 w-12 sm:h-14 sm:w-14 drop-shadow-lg flex-shrink-0"
          />
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold premium-title">Marketplace</h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-1">Connect through needs and offers</p>
          </div>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          size="lg"
          className="gap-2 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl px-6 py-3 w-full sm:w-auto"
        >
          <PlusCircle className="h-5 w-5" />
          <span className="font-bold">Create Post</span>
        </Button>
      </div>

      {/* Tabs and Filter Section - Better responsive layout */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full lg:w-auto">
          <TabsList className="grid w-full lg:w-auto grid-cols-3 h-12 rounded-xl shadow-sm">
            <TabsTrigger value="all" className="gap-2 font-bold text-sm sm:text-base rounded-lg px-4">
              All
            </TabsTrigger>
            <TabsTrigger value="needs" className="gap-2 font-bold text-sm sm:text-base rounded-lg px-4">
              <img src="/assets/generated/needs-icon-professional-transparent.dim_48x48.png" alt="" className="h-4 w-4" />
              Needs
            </TabsTrigger>
            <TabsTrigger value="offers" className="gap-2 font-bold text-sm sm:text-base rounded-lg px-4">
              <img src="/assets/generated/offers-icon-red-transparent.dim_48x48.png" alt="" className="h-4 w-4" />
              Offers
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <Filter className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <Select value={filter} onValueChange={(v) => setFilter(v as SortFilter)}>
            <SelectTrigger className="w-full lg:w-[180px] h-12 rounded-xl shadow-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="closest">Closest</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Section - Improved grid layout and spacing */}
      {isLoading ? (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <SkeletonMarketplace key={i} />
          ))}
        </div>
      ) : displayPosts.length === 0 ? (
        <Card className="shadow-md border">
          <CardContent className="py-16 text-center space-y-4">
            <img
              src="/assets/generated/marketplace-icon-professional-transparent.dim_64x64.png"
              alt="No posts"
              className="mx-auto mb-4 h-16 w-16 opacity-50"
            />
            <h3 className="text-xl font-bold">No marketplace posts yet</h3>
            <p className="text-muted-foreground">
              Be the first to share a {activeTab === 'needs' ? 'need' : activeTab === 'offers' ? 'offer' : 'post'}!
            </p>
            <Button 
              onClick={() => setShowCreateModal(true)}
              size="lg"
              className="gap-2 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl px-6 mt-4"
            >
              <PlusCircle className="h-5 w-5" />
              <span className="font-bold">Create Post</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 auto-rows-fr">
          {displayPosts.map((post) => (
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
