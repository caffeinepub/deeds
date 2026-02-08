import { Home, Compass, PlusCircle, MessageSquare, User, LayoutGrid } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import CreatePostModal from './CreatePostModal';
import { Button } from './ui/button';

interface NavItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path?: string;
  action?: () => void;
}

export default function ReelBottomTabNav() {
  const navigate = useNavigate();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const navItems: NavItem[] = [
    {
      id: 'home',
      icon: Home,
      label: 'Home',
      path: '/',
    },
    {
      id: 'discover',
      icon: Compass,
      label: 'Discover',
      path: '/discover',
    },
    {
      id: 'create',
      icon: PlusCircle,
      label: 'Create',
      action: () => setShowCreatePost(true),
    },
    {
      id: 'messages',
      icon: MessageSquare,
      label: 'Messages',
      path: '/messages',
    },
    {
      id: 'profile',
      icon: User,
      label: 'Profile',
      path: '/profile',
    },
    {
      id: 'hub',
      icon: LayoutGrid,
      label: 'Hub',
      path: '/hub',
    },
  ];

  const handleNavClick = (item: NavItem) => {
    setActiveTab(item.id);
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate({ to: item.path });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, item: NavItem) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNavClick(item);
    }
  };

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 reel-bottom-nav"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="reel-bottom-nav-container">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => handleNavClick(item)}
                onKeyDown={(e) => handleKeyDown(e, item)}
                className={`reel-bottom-nav-item ${isActive ? 'reel-bottom-nav-item-active' : ''}`}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="flex flex-col items-center gap-1">
                  <Icon className={`h-6 w-6 transition-colors ${isActive ? 'text-primary' : 'text-white/80'}`} />
                  <span className={`text-xs font-medium transition-colors ${isActive ? 'text-primary' : 'text-white/80'}`}>
                    {item.label}
                  </span>
                </div>
              </Button>
            );
          })}
        </div>
      </nav>

      {showCreatePost && <CreatePostModal onClose={() => setShowCreatePost(false)} />}
    </>
  );
}
