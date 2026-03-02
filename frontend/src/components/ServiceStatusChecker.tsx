import React, { useState } from 'react';
import { useActor } from '../hooks/useActor';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RefreshCw, Shield, Wifi, WifiOff } from 'lucide-react';

export default function ServiceStatusChecker() {
  const { actor } = useActor();
  const { data: isAdmin } = useIsCallerAdmin();
  const [status, setStatus] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkStatus = async () => {
    if (!actor) return;
    setStatus('checking');
    setErrorMessage(null);
    try {
      // Try a basic actor call to check connectivity
      await (actor as any).isCallerAdmin();
      setStatus('ok');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err?.message ?? 'Unknown error');
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto p-8 text-center">
        <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <h2 className="font-bold text-foreground mb-2">Admin Access Required</h2>
        <p className="text-sm text-muted-foreground">
          You need admin privileges to view service status.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold text-foreground">Service Status</h1>
      </div>

      {/* Network status */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm font-medium text-foreground">Network</span>
          </div>
          <Badge variant={isOnline ? 'default' : 'destructive'} className="text-xs">
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>
      </div>

      {/* Backend status */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-foreground">Backend Canister</span>
          {status === 'idle' && (
            <Badge variant="secondary" className="text-xs">Not checked</Badge>
          )}
          {status === 'checking' && (
            <Badge variant="secondary" className="text-xs animate-pulse">Checking...</Badge>
          )}
          {status === 'ok' && (
            <Badge className="text-xs bg-green-500">Healthy</Badge>
          )}
          {status === 'error' && (
            <Badge variant="destructive" className="text-xs">Error</Badge>
          )}
        </div>

        {status === 'ok' && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs">Backend is responding normally</span>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-start gap-2 text-red-600">
            <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="text-xs break-words">{errorMessage ?? 'Connection failed'}</span>
          </div>
        )}

        <Button
          size="sm"
          variant="outline"
          className="w-full mt-3 text-xs"
          onClick={checkStatus}
          disabled={status === 'checking' || !actor}
        >
          {status === 'checking' ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Checking...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <RefreshCw className="w-3 h-3" />
              Check Status
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
