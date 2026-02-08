import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Home, Compass, PlusCircle, MessageSquare, User, Radio, BookOpen, ShoppingBag } from 'lucide-react';
import SafeImageIcon from './SafeImageIcon';

export default function AllInOneHub() {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Home Feed',
      description: 'Scroll through deeds from your community',
      icon: <Home className="h-8 w-8" />,
      action: () => navigate({ to: '/' }),
      color: 'from-red-500 to-red-600',
    },
    {
      title: 'Discover',
      description: 'Explore trending deeds and new creators',
      icon: <Compass className="h-8 w-8" />,
      action: () => navigate({ to: '/discover' }),
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Create Post',
      description: 'Share your good deeds with the world',
      icon: <PlusCircle className="h-8 w-8" />,
      action: () => navigate({ to: '/feed' }),
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Messages',
      description: 'Connect with friends and followers',
      icon: <MessageSquare className="h-8 w-8" />,
      action: () => navigate({ to: '/messages' }),
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Profile',
      description: 'View and edit your profile',
      icon: <User className="h-8 w-8" />,
      action: () => navigate({ to: '/profile' }),
      color: 'from-pink-500 to-pink-600',
    },
    {
      title: 'Live',
      description: 'Watch or start live streams',
      icon: <Radio className="h-8 w-8" />,
      action: () => navigate({ to: '/live' }),
      color: 'from-red-500 to-orange-500',
    },
    {
      title: 'Blog',
      description: 'Read and write long-form content',
      icon: <BookOpen className="h-8 w-8" />,
      action: () => navigate({ to: '/blog' }),
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      title: 'Marketplace',
      description: 'Offer or request help in your community',
      icon: <ShoppingBag className="h-8 w-8" />,
      action: () => navigate({ to: '/marketplace' }),
      color: 'from-amber-500 to-amber-600',
    },
  ];

  return (
    <div className="container py-8 px-4 max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">All-in-One Hub</h1>
        <p className="text-muted-foreground">Access all Deeds features in one place</p>
      </div>

      <div className="space-y-4">
        {sections.map((section, index) => (
          <Card
            key={index}
            className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50"
            onClick={section.action}
          >
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${section.color} text-white`}>
                  {section.icon}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
