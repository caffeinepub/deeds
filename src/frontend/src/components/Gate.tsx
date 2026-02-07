import { useState, memo } from 'react';
import { TrendingUp, Sparkles, Video, MessageSquare, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useSearchBlogs, useGetAllBlogs } from '../hooks/useQueries';
import BlogCard from './BlogCard';
import CreateBlogButton from './CreateBlogButton';
import UserProfileModal from './UserProfileModal';
import { Principal } from '@icp-sdk/core/principal';
import SkeletonBlog from './SkeletonBlog';
import ChallengesSection from './ChallengesSection';
import FriendsStatusFeed from './FriendsStatusFeed';
import Search from './Search';
import StarEffectLogo from './StarEffectLogo';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import SafeImageIcon from './SafeImageIcon';

const MemoizedBlogCard = memo(BlogCard);

export default function Gate() {
  const { identity } = useInternetIdentity();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<Principal | null>(null);
  const { data: searchResults, isLoading: searchLoading } = useSearchBlogs(searchQuery);
  const { data: allBlogs, isLoading: blogsLoading } = useGetAllBlogs();

  const handleSearch = (term: string) => {
    setSearchQuery(term);
  };

  const trendingBlogs = allBlogs
    ? [...allBlogs].sort((a, b) => Number(b.likes - a.likes)).slice(0, 3)
    : [];

  return (
    <div className="container py-8 pb-24 max-w-7xl mx-auto relative z-10 bg-background">
      <div className="text-center mb-12 space-y-8 bg-white rounded-3xl p-10 md:p-12 border-2 border-border/30 shadow-lg">
        <div className="flex items-center justify-center mb-6">
          <StarEffectLogo
            src="/assets/generated/updated-deeds-logo-white-glow-d-star-effect.dim_400x120.png"
            alt="Deeds"
            className="h-24 w-auto max-w-full"
          />
        </div>
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
          Welcome to Deeds
        </h2>
        <p className="text-xl md:text-2xl text-muted-foreground font-medium">
          Connect. Share. Inspire.
        </p>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Your hub for inspiring stories, positive challenges, and community connection
        </p>

        <Search onSearch={handleSearch} />

        {searchQuery && (
          <Card className="max-w-2xl mx-auto shadow-lg border-2 bg-white mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-5 w-5 text-red-600" />
                Search Results for "{searchQuery}"
              </CardTitle>
            </CardHeader>
            <CardContent>
              {searchLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {searchResults && searchResults.length > 0 ? (
                    <div>
                      <h3 className="font-semibold mb-2 text-sm flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-red-600" />
                        Blogs
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Found {searchResults.length} blog(s)
                      </p>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-6">No results found</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
        <Card className="bg-gradient-to-br from-red-500/10 to-red-400/10 border-2 border-red-500/20 hover:border-red-500/40 transition-all duration-300 hover:shadow-xl cursor-pointer group">
          <CardContent className="pt-8 text-center space-y-4">
            <div className="bg-red-500/20 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
              <Video className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="font-bold text-xl">Video Reels</h3>
            <p className="text-sm text-muted-foreground">Share inspiring moments</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-400/10 to-red-300/10 border-2 border-red-400/20 hover:border-red-400/40 transition-all duration-300 hover:shadow-xl cursor-pointer group">
          <CardContent className="pt-8 text-center space-y-4">
            <div className="bg-red-400/20 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
              <MessageSquare className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="font-bold text-xl">Text Posts</h3>
            <p className="text-sm text-muted-foreground">Share your thoughts</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-600/10 to-red-500/10 border-2 border-red-600/20 hover:border-red-600/40 transition-all duration-300 hover:shadow-xl cursor-pointer group">
          <CardContent className="pt-8 text-center space-y-4">
            <div className="bg-red-600/20 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
              <Users className="h-10 w-10 text-red-700" />
            </div>
            <h3 className="font-bold text-xl">Community</h3>
            <p className="text-sm text-muted-foreground">Connect with others</p>
          </CardContent>
        </Card>
      </div>

      {identity && (
        <div className="mb-12">
          <FriendsStatusFeed />
        </div>
      )}

      <div className="mb-12">
        <div className="bg-white rounded-3xl p-8 md:p-10 border-2 border-red-500/20 hover:border-red-500/40 transition-all duration-300 shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="h-8 w-8 text-red-600 animate-pulse" />
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-700 to-red-500 bg-clip-text text-transparent">
              Weekly Challenges
            </h2>
          </div>
          <ChallengesSection />
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between bg-white rounded-2xl p-6 border-2 border-red-400/20 shadow-md">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-red-600" />
            Trending Blogs
          </h2>
          <CreateBlogButton />
        </div>

        {blogsLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <SkeletonBlog key={i} />
            ))}
          </div>
        ) : trendingBlogs.length === 0 ? (
          <Card className="shadow-lg border-2 bg-white">
            <CardContent className="py-16 text-center space-y-4">
              <SafeImageIcon
                src="/assets/generated/blog-icon-red-transparent.dim_64x64.png"
                alt="No blogs"
                className="mx-auto mb-4 h-16 w-16 opacity-50"
                fallbackIcon={<TrendingUp className="h-16 w-16 mx-auto opacity-50 text-red-600" />}
              />
              <h3 className="text-xl font-semibold">No trending blogs yet</h3>
              <p className="text-muted-foreground">Be the first to create a blog!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trendingBlogs.map((blog) => (
              <MemoizedBlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        )}
      </div>

      {selectedUser && (
        <UserProfileModal
          userPrincipal={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
