import { Home, Compass, PlusCircle, MessageSquare, User, LayoutGrid } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from './ui/button';
import { useState } from 'react';
import CreatePostModal from './CreatePostModal';

/**
 * @deprecated This component is deprecated for the reel page ('/').
 * Use WheelNavScroller instead for the main reel navigation.
 * This component may still be used on other pages if needed.
 */
export default function ReelBottomNav() {
  const navigate = useNavigate();
  const [showCreatePost, setShowCreatePost] = useState(false);

  const handleNavigation = (path: string) => {
    navigate({ to: path });
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-t border-white/10">
        <div className="flex items-center justify-around px-4 py-3 max-w-2xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 text-white hover:bg-white/10"
            onClick={() => handleNavigation('/')}
          >
            <Home className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 text-white hover:bg-white/10"
            onClick={() => handleNavigation('/discover')}
          >
            <Compass className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-14 w-14 text-white hover:bg-white/10 relative -top-2"
            onClick={() => setShowCreatePost(true)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-700 rounded-full" />
            <PlusCircle className="h-8 w-8 relative z-10" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 text-white hover:bg-white/10"
            onClick={() => handleNavigation('/messages')}
          >
            <MessageSquare className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 text-white hover:bg-white/10"
            onClick={() => handleNavigation('/profile')}
          >
            <User className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 text-white hover:bg-white/10"
            onClick={() => handleNavigation('/hub')}
          >
            <LayoutGrid className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {showCreatePost && <CreatePostModal onClose={() => setShowCreatePost(false)} />}
    </>
  );
}
