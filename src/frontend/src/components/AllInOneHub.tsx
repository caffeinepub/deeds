import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Home, Compass, PlusCircle, MessageSquare, User, Radio, BookOpen, ShoppingBag, RotateCcw } from 'lucide-react';
import { clearLegacyVideoLayoutStateAndReload } from '../utils/videoLayoutPersistence';
import { Button } from './ui/button';
import { toast } from 'sonner';

export default function AllInOneHub() {
  const navigate = useNavigate();

  const handleResetLayout = () => {
    toast.info('Resetting video layout preferences...');
    clearLegacyVideoLayoutStateAndReload();
  };

  const sections = [
    {
      title: 'Home Feed',
      description: 'Scroll through deeds from your community',
      icon: Home,
      action: () => navigate({ to: '/' }),
    },
    {
      title: 'Discover',
      description: 'Explore trending deeds and new creators',
      icon: Compass,
      action: () => navigate({ to: '/discover' }),
    },
    {
      title: 'Create Post',
      description: 'Share your good deeds with the world',
      icon: PlusCircle,
      action: () => navigate({ to: '/feed' }),
    },
    {
      title: 'Messages',
      description: 'Connect with friends and followers',
      icon: MessageSquare,
      action: () => navigate({ to: '/messages' }),
    },
    {
      title: 'Profile',
      description: 'View and edit your profile',
      icon: User,
      action: () => navigate({ to: '/profile' }),
    },
    {
      title: 'Live',
      description: 'Watch or start live streams',
      icon: Radio,
      action: () => navigate({ to: '/live' }),
    },
    {
      title: 'Blog',
      description: 'Read and write long-form content',
      icon: BookOpen,
      action: () => navigate({ to: '/blog' }),
    },
    {
      title: 'Marketplace',
      description: 'Offer or request help in your community',
      icon: ShoppingBag,
      action: () => navigate({ to: '/marketplace' }),
    },
  ];

  return (
    <div className="container py-8 px-4 max-w-4xl mx-auto relative z-10">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">All-in-One Hub</h1>
        <p className="text-muted-foreground">Access all Deeds features in one place</p>
      </div>

      <div className="space-y-4">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <Card
              key={index}
              className="tech-card cursor-pointer group"
              onClick={section.action}
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="icon-container p-4 group-hover:scale-110 transition-transform">
                    <Icon className="h-7 w-7 text-primary" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">{section.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}

        {/* Reset Video Layout Control */}
        <Card className="tech-card">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="icon-container p-4 bg-muted/50">
                <RotateCcw className="h-7 w-7 text-muted-foreground" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl">Reset Video Layout</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Clear any stored video/reel layout preferences and restore normal scrolling
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleResetLayout}
              variant="outline"
              className="w-full rounded-xl gap-2"
            >
              <RotateCcw className="h-4 w-4" strokeWidth={2} />
              Reset Layout & Reload
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
