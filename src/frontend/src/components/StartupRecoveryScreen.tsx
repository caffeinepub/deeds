import { useState } from 'react';
import { Button } from './ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { performFullRecovery } from '../utils/swRecovery';

interface StartupRecoveryScreenProps {
  context?: 'stuck' | 'update-failed';
}

export default function StartupRecoveryScreen({ context = 'stuck' }: StartupRecoveryScreenProps) {
  const [isRecovering, setIsRecovering] = useState(false);

  const handleRecovery = async () => {
    setIsRecovering(true);
    try {
      await performFullRecovery();
    } catch (error) {
      console.error('Recovery failed:', error);
      // Force reload anyway
      window.location.reload();
    }
  };

  const getMessage = () => {
    if (context === 'update-failed') {
      return {
        title: 'Update Did Not Complete',
        description: 'The app update encountered an issue. Clearing the cache will help resolve this.',
      };
    }
    return {
      title: 'App Loading Issue',
      description: 'Deeds is having trouble loading. This might be due to cached data from a previous version.',
    };
  };

  const message = getMessage();

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-4">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            {message.title}
          </h1>
          <p className="text-gray-600">
            {message.description}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2">
          <p className="text-sm text-gray-700 font-medium">
            What will happen when you click "Reload and Clear Cache":
          </p>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Clear all cached app data</li>
            <li>Reset service workers</li>
            <li>Reload the app with fresh data</li>
          </ul>
          <p className="text-xs text-gray-500 mt-2">
            Your account and data are safe. This only clears temporary app files.
          </p>
        </div>

        <Button
          onClick={handleRecovery}
          disabled={isRecovering}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
          size="lg"
        >
          {isRecovering ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Clearing Cache...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload and Clear Cache
            </>
          )}
        </Button>

        <p className="text-xs text-gray-500">
          If the problem persists after reloading, please contact support.
        </p>
      </div>
    </div>
  );
}
