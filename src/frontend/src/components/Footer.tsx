import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container py-6">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025. Built with <Heart className="inline h-4 w-4 text-primary fill-primary" /> using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

