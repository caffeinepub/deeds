import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from './ui/button';
import { useGetAllBlogs } from '../hooks/useQueries';
import BlogCard from './BlogCard';
import CreateBlogModal from './CreateBlogModal';
import SkeletonBlog from './SkeletonBlog';
import { Card, CardContent } from './ui/card';

export default function BlogPage() {
  const [showCreateBlog, setShowCreateBlog] = useState(false);
  const { data: allBlogs, isLoading: blogsLoading } = useGetAllBlogs();

  // Sort blogs by timestamp (newest first)
  const sortedBlogs = allBlogs
    ? [...allBlogs].sort((a, b) => Number(b.timestamp - a.timestamp))
    : [];

  return (
    <div className="container py-6 pb-24 max-w-4xl mx-auto relative z-10">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Blogs</h1>
          <p className="text-muted-foreground">
            Share your stories and read inspiring content from the community
          </p>
        </div>
        <Button
          onClick={() => setShowCreateBlog(true)}
          className="gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          <PlusCircle className="h-5 w-5" />
          Create Blog
        </Button>
      </div>

      {/* Blog List */}
      {blogsLoading ? (
        <div className="space-y-5">
          {[...Array(3)].map((_, i) => (
            <SkeletonBlog key={i} />
          ))}
        </div>
      ) : sortedBlogs.length === 0 ? (
        <Card className="shadow-md border bg-card/95 backdrop-blur-sm">
          <CardContent className="py-16 text-center space-y-4">
            <img
              src="/assets/generated/blog-icon-red-transparent.dim_64x64.png"
              alt="No blogs"
              className="mx-auto mb-4 h-16 w-16 opacity-50"
              loading="lazy"
            />
            <h3 className="text-xl font-bold">No blogs yet</h3>
            <p className="text-muted-foreground">Be the first to create a blog!</p>
            <Button onClick={() => setShowCreateBlog(true)} className="gap-2">
              <PlusCircle className="h-5 w-5" />
              Create Your First Blog
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {sortedBlogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}

      {/* Create Blog Modal */}
      {showCreateBlog && (
        <CreateBlogModal onClose={() => setShowCreateBlog(false)} />
      )}
    </div>
  );
}
