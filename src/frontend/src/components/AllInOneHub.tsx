import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { 
  Home, 
  Compass, 
  PlusCircle, 
  MessageSquare, 
  User, 
  Video, 
  BookOpen, 
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useState } from 'react';
import CreatePostModal from './CreatePostModal';
import SafeImageIcon from './SafeImageIcon';

export default function AllInOneHub() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [showCreatePost, setShowCreatePost] = useState(false);

  const isAuthenticated = !!identity;

  const sections = [
    {
      title: 'Home Feed',
      description: 'See what\'s happening in your community',
      icon: <Home className="h-8 w-8 text-red-600" />,
      action: () => navigate({ to: '/' }),
      color: 'from-red-500/10 to-red-400/10',
      border: 'border-red-500/20 hover:border-red-500/40',
    },
    {
      title: 'Discover',
      description: 'Explore trending content and new connections',
      icon: <Compass className="h-8 w-8 text-red-500" />,
      action: () => navigate({ to: '/discover' }),
      color: 'from-red-400/10 to-red-300/10',
      border: 'border-red-400/20 hover:border-red-400/40',
    },
    {
      title: 'Create Post',
      description: 'Share your story with the world',
      icon: <PlusCircle className="h-8 w-8 text-red-700" />,
      action: () => setShowCreatePost(true),
      color: 'from-red-600/10 to-red-500/10',
      border: 'border-red-600/20 hover:border-red-600/40',
      requiresAuth: true,
    },
    {
      title: 'Messages',
      description: 'Connect with friends and followers',
      icon: <MessageSquare className="h-8 w-8 text-red-600" />,
      action: () => navigate({ to: '/messages' }),
      color: 'from-red-500/10 to-red-400/10',
      border: 'border-red-500/20 hover:border-red-500/40',
      requiresAuth: true,
    },
    {
      title: 'Profile',
      description: 'View and edit your profile',
      icon: <User className="h-8 w-8 text-red-500" />,
      action: () => navigate({ to: '/profile' }),
      color: 'from-red-400/10 to-red-300/10',
      border: 'border-red-400/20 hover:border-red-400/40',
      requiresAuth: true,
    },
    {
      title: 'Live Sessions',
      description: 'Join or start live streaming',
      icon: <Video className="h-8 w-8 text-red-700" />,
      action: () => navigate({ to: '/live' }),
      color: 'from-red-600/10 to-red-500/10',
      border: 'border-red-600/20 hover:border-red-600/40',
    },
    {
      title: 'Blog',
      description: 'Read and write inspiring stories',
      icon: <BookOpen className="h-8 w-8 text-red-600" />,
      action: () => navigate({ to: '/blog' }),
      color: 'from-red-500/10 to-red-400/10',
      border: 'border-red-500/20 hover:border-red-500/40',
    },
    {
      title: 'Marketplace',
      description: 'Find needs and offers in your community',
      icon: <ShoppingBag className="h-8 w-8 text-red-500" />,
      action: () => navigate({ to: '/marketplace' }),
      color: 'from-red-400/10 to-red-300/10',
      border: 'border-red-400/20 hover:border-red-400/40',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-8 pb-24 max-w-5xl mx-auto px-4">
        <div className="text-center mb-12 space-y-6 bg-white rounded-3xl p-8 md:p-10 border-2 border-red-500/20 shadow-xl">
          <div className="flex items-center justify-center mb-4">
            <SafeImageIcon
              src="/assets/generated/updated-deeds-logo-white-glow-d-star-effect.dim_400x120.png"
              alt="Deeds"
              className="h-20 w-auto max-w-full"
              fallbackIcon={<Sparkles className="h-20 w-20 text-red-600" />}
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            All-in-One Hub
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need in one place. Scroll to explore all features.
          </p>
        </div>

        <div className="space-y-4">
          {sections.map((section, index) => {
            if (section.requiresAuth && !isAuthenticated) {
              return null;
            }

            return (
              <Card
                key={index}
                className={`bg-gradient-to-br ${section.color} border-2 ${section.border} transition-all duration-300 hover:shadow-xl cursor-pointer group`}
                onClick={section.action}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/80 w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md">
                      {section.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xl text-foreground mb-1">
                        {section.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {section.description}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full group-hover:bg-white/50 transition-all flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        section.action();
                      }}
                    >
                      Go
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {!isAuthenticated && (
          <div className="mt-8 text-center p-6 bg-red-50 rounded-2xl border-2 border-red-200">
            <p className="text-muted-foreground mb-4">
              Log in to access all features including Create Post, Messages, and Profile
            </p>
          </div>
        )}
      </div>

      {showCreatePost && (
        <CreatePostModal onClose={() => setShowCreatePost(false)} />
      )}
    </div>
  );
}
