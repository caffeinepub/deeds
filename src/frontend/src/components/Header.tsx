import { useNavigate } from '@tanstack/react-router';
import { Button } from './ui/button';
import { MessageSquare } from 'lucide-react';
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
  const text = loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login';

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
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <SafeImageIcon
            src="/assets/generated/deeds-header-logo-star-flash-enhanced.dim_300x100.png"
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
              className="relative"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          )}
          <Button
            onClick={handleAuth}
            disabled={disabled}
            variant={isAuthenticated ? 'outline' : 'default'}
            className={
              isAuthenticated
                ? ''
                : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white'
            }
          >
            {text}
          </Button>
        </div>
      </div>
    </header>
  );
}
