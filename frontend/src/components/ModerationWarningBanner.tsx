import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface ModerationWarningBannerProps {
  className?: string;
}

export default function ModerationWarningBanner({ className = '' }: ModerationWarningBannerProps) {
  return (
    <Alert 
      variant="destructive" 
      className={`
        bg-gradient-to-r from-primary/10 via-destructive/10 to-primary/10 
        border-primary/30 
        backdrop-blur-sm 
        animate-pulse-gentle
        ${className}
      `}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <img 
            src="/assets/generated/moderation-warning-icon.dim_48x48.png" 
            alt="Warning" 
            className="h-8 w-8 animate-pulse-gentle"
          />
        </div>
        <AlertDescription className="text-sm font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-primary" />
          <span>Let's keep Deeds positive</span>
        </AlertDescription>
      </div>
    </Alert>
  );
}
