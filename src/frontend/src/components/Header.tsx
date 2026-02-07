import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from './ui/button';
import { useQueryClient } from '@tanstack/react-query';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../contexts/LanguageContext';
import { MessageSquare } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import SafeImageIcon from './SafeImageIcon';

interface HeaderProps {
  onMessagesClick?: () => void;
}

export default function Header({ onMessagesClick }: HeaderProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';
  const text = loginStatus === 'logging-in' 
    ? 'Logging in...' 
    : isAuthenticated 
    ? t('action.logout')
    : t('action.login');

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
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/90 shadow-sm">
      <div className="container flex h-16 items-center justify-between max-w-7xl mx-auto px-4 sm:px-6">
        <div 
          className="flex items-center justify-center cursor-pointer"
          onClick={handleLogoClick}
        >
          <SafeImageIcon
            src="/assets/generated/updated-deeds-header-logo-white-glow-d-star-effect.dim_300x100.png"
            alt="Deeds"
            className="h-10 w-auto object-contain block"
            fallbackText="Deeds"
          />
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated && onMessagesClick && (
            <Button
              onClick={onMessagesClick}
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-primary/10 transition-all"
              aria-label="Messages"
            >
              <MessageSquare className="h-5 w-5 text-primary" />
            </Button>
          )}
          <LanguageSelector />
          <Button
            onClick={handleAuth}
            disabled={disabled}
            variant={isAuthenticated ? 'outline' : 'default'}
            className="rounded-full font-semibold shadow-sm hover:shadow-md transition-all bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white border-0"
          >
            {text}
          </Button>
        </div>
      </div>
    </header>
  );
}
