import { useNavigate } from '@tanstack/react-router';
import { Button } from './ui/button';
import { MessageSquare, LogIn, LogOut } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import LanguageSelector from './LanguageSelector';
import SafeImageIcon from './SafeImageIcon';

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
    navigate({ to: '/hub' });
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-header">
      <div className="container flex h-16 items-center justify-between px-4">
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          aria-label="Go to hub"
        >
          <SafeImageIcon
            src="/assets/generated/deeds-header-logo-red-glow-star-effect.dim_300x100.png"
            alt="Deeds"
            className="h-10 w-auto"
            fallbackText="Deeds"
          />
        </button>

        <div className="flex items-center gap-3">
          <LanguageSelector />
          
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: '/messages' })}
              className="rounded-xl hover:bg-accent/50 transition-colors"
              aria-label="Messages"
            >
              <MessageSquare className="h-5 w-5" strokeWidth={2} />
            </Button>
          )}

          <Button
            onClick={handleAuth}
            disabled={disabled}
            variant={isAuthenticated ? 'outline' : 'default'}
            size="default"
            className="rounded-xl gap-2 min-w-[100px] transition-all"
          >
            {isLoggingIn ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Logging in...</span>
              </>
            ) : isAuthenticated ? (
              <>
                <LogOut className="h-4 w-4" strokeWidth={2} />
                <span>Logout</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" strokeWidth={2} />
                <span>Login</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
