import { useNavigate } from '@tanstack/react-router';
import { Button } from './ui/button';
import { MessageSquare, LogIn, LogOut, Menu } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export default function Header() {
  const navigate = useNavigate();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const handleLogoClick = () => {
    navigate({ to: '/' });
  };

  return (
    <header
      className="sticky top-0 z-40 w-full border-b"
      style={{
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)',
        borderColor: 'oklch(90% 0 0)',
      }}
    >
      <div className="container flex h-16 items-center justify-between px-4 mx-auto max-w-7xl">
        {/* Logo */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
          aria-label="Go to home"
        >
          <img
            src="/assets/generated/deeds-header-logo-star-flash-enhanced.dim_300x100.png"
            alt="Deeds"
            className="h-10 w-auto object-contain"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <span
            className="hidden items-center text-2xl font-bold"
            style={{ color: 'oklch(55% 0.18 25)', display: 'none' }}
          >
            Deeds
          </span>
        </button>

        {/* Nav actions */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Navigation menu">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate({ to: '/feed' })}>
                📰 Feed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: '/discover' })}>
                🔍 Discover
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: '/blog' })}>
                📝 Blog
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: '/marketplace' })}>
                🛍️ Marketplace
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: '/live' })}>
                🔴 Live
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: '/space' })}>
                🌌 Space
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: '/love-notes' })}>
                💌 Love Notes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: '/deed-of-the-day' })}>
                🌟 Deed of the Day
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: '/kindness-matches' })}>
                💞 Kindness Matches
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isAuthenticated && (
                <DropdownMenuItem onClick={() => navigate({ to: '/profile' })}>
                  👤 Profile
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: '/messages' })}
              aria-label="Messages"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          )}

          <Button
            onClick={handleAuth}
            disabled={disabled}
            variant={isAuthenticated ? 'outline' : 'default'}
            size="default"
            className="gap-2 min-w-[100px]"
          >
            {isLoggingIn ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Logging in...</span>
              </>
            ) : isAuthenticated ? (
              <>
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
