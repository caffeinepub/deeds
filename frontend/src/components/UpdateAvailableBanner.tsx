import { Button } from './ui/button';
import { RefreshCw, X, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { performFullRecovery } from '../utils/swRecovery';

interface UpdateAvailableBannerProps {
  onUpdate: () => void;
  onDismiss: () => void;
  reloadBlocked?: boolean;
}

export default function UpdateAvailableBanner({ onUpdate, onDismiss, reloadBlocked }: UpdateAvailableBannerProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showRecoveryOption, setShowRecoveryOption] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await onUpdate();
      
      // Wait a moment to see if the reload happens
      setTimeout(() => {
        // If we're still here after 2 seconds, show recovery option
        setShowRecoveryOption(true);
        setIsUpdating(false);
      }, 2000);
    } catch (error) {
      console.error('Update failed:', error);
      setShowRecoveryOption(true);
      setIsUpdating(false);
    }
  };

  const handleFullRecovery = async () => {
    setIsUpdating(true);
    try {
      await performFullRecovery();
    } catch (error) {
      console.error('Recovery failed:', error);
      window.location.reload();
    }
  };

  // If reload is blocked, show recovery UI immediately
  if (reloadBlocked) {
    return (
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[250] animate-fade-in">
        <div className="bg-destructive text-destructive-foreground shadow-premium rounded-lg px-6 py-4 flex items-center gap-4 max-w-md">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-sm">Update Issue Detected</p>
            <p className="text-xs opacity-90 mt-1">The app needs a full cache clear to update properly</p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleFullRecovery}
            disabled={isUpdating}
            className="bg-white text-destructive hover:bg-white/90"
          >
            {isUpdating ? 'Clearing...' : 'Clear Cache'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[250] animate-fade-in">
      <div className="bg-primary text-primary-foreground shadow-premium rounded-full px-6 py-3 flex items-center gap-4 max-w-md">
        <RefreshCw className={`h-5 w-5 ${isUpdating ? 'animate-spin' : ''}`} />
        <div className="flex-1">
          <p className="font-semibold text-sm">Update Available</p>
          <p className="text-xs opacity-90">A new version of Deeds is ready</p>
        </div>
        {showRecoveryOption ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={handleFullRecovery}
            disabled={isUpdating}
            className="bg-white text-primary hover:bg-white/90"
          >
            Clear Cache
          </Button>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            onClick={handleUpdate}
            disabled={isUpdating}
            className="bg-white text-primary hover:bg-white/90"
          >
            {isUpdating ? 'Updating...' : 'Update Now'}
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          onClick={onDismiss}
          className="h-8 w-8 text-primary-foreground hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
