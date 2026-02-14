import { Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = typeof window !== 'undefined' 
    ? encodeURIComponent(window.location.hostname) 
    : 'deeds-app';

  return (
    <footer className="relative z-10 border-t border-border/50 bg-card/80 backdrop-blur-md py-6 mt-auto">
      <div className="container px-4">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Deeds. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            Built with{' '}
            <Heart className="h-3.5 w-3.5 text-primary fill-primary animate-pulse-glow" />{' '}
            using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
