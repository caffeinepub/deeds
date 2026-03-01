import { useNavigate } from '@tanstack/react-router';
import { TrendingUp, Video, MessageSquare, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { useGetAllBlogs } from '../hooks/useQueries';
import BlogCard from './BlogCard';
import SkeletonBlog from './SkeletonBlog';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function Gate() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: allBlogs, isLoading: blogsLoading } = useGetAllBlogs();

  const trendingBlogs = allBlogs
    ? [...allBlogs].sort((a, b) => Number(b.likes - a.likes)).slice(0, 3)
    : [];

  return (
    <div className="container py-8 max-w-7xl mx-auto px-4">
      <div className="text-center mb-12 space-y-6">
        <img
          src="/assets/generated/deeds-logo.png"
          alt="Deeds"
          className="h-20 w-auto mx-auto"
        />
        <h2 className="text-4xl md:text-6xl font-bold">
          Welcome to Deeds
        </h2>
        <p className="text-xl md:text-2xl text-muted-foreground">
          Connect. Share. Inspire.
        </p>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Your hub for inspiring stories, positive challenges, and community connection
        </p>

        {!identity && (
          <div className="pt-4">
            <Button size="lg" onClick={() => navigate({ to: '/feed' })}>
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-12">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate({ to: '/feed' })}>
          <CardContent className="pt-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Video className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold text-xl">Video Reels</h3>
            <p className="text-sm text-muted-foreground">Share inspiring moments</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate({ to: '/feed' })}>
          <CardContent className="pt-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold text-xl">Text Posts</h3>
            <p className="text-sm text-muted-foreground">Share your thoughts</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate({ to: '/discover' })}>
          <CardContent className="pt-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold text-xl">Community</h3>
            <p className="text-sm text-muted-foreground">Connect with others</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-primary" />
            Trending Blogs
          </h2>
          <Button variant="outline" onClick={() => navigate({ to: '/blog' })}>
            View All
          </Button>
        </div>

        {blogsLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <SkeletonBlog key={i} />
            ))}
          </div>
        ) : trendingBlogs.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center space-y-4">
              <TrendingUp className="h-16 w-16 mx-auto opacity-50 text-primary" />
              <h3 className="text-xl font-semibold">No trending blogs yet</h3>
              <p className="text-muted-foreground">Be the first to create a blog!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trendingBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
