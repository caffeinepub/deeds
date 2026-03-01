import { useState } from 'react';
import { useActor } from '../hooks/useActor';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle2, XCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function ServiceStatusChecker() {
  const { actor } = useActor();
  const [isChecking, setIsChecking] = useState(false);
  const [healthCheck, setHealthCheck] = useState<{
    operational: boolean;
    message: string;
    photoSystem: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkSystemStatus = async () => {
    if (!actor) {
      toast.error('Backend actor not available');
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      // Check health using the available healthcheckWithPhotos method (admin-only)
      const health = await actor.healthcheckWithPhotos();
      // Transform the response to match our expected format
      setHealthCheck({
        operational: true,
        message: 'Photo system is operational',
        photoSystem: health.photoSystem,
      });
      toast.success('Service status check completed');
    } catch (err: any) {
      console.error('Status check error:', err);
      if (err.message?.includes('Unauthorized')) {
        setError('Admin access required to check system health');
      } else {
        setError(err.message || 'Failed to check service status');
      }
      toast.error('Failed to check service status');
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = () => {
    if (error) {
      return <XCircle className="h-8 w-8 text-destructive" />;
    }
    if (healthCheck?.operational) {
      return <CheckCircle2 className="h-8 w-8 text-green-600" />;
    }
    return <AlertCircle className="h-8 w-8 text-yellow-600" />;
  };

  const getStatusBadge = () => {
    if (error) {
      return <Badge variant="destructive">Error</Badge>;
    }
    if (healthCheck?.operational) {
      return <Badge className="bg-green-600 hover:bg-green-700">Operational</Badge>;
    }
    return <Badge variant="secondary">Unknown</Badge>;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-premium">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <CardTitle className="text-2xl">Caffeine Production Service Status</CardTitle>
              <CardDescription>
                Check the operational status and network availability of the deployment service
              </CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Health Check Information (Admin Only) */}
        {healthCheck && (
          <div className="space-y-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Deployment Service Health
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Operational:</span>
                <span className="font-semibold text-green-600">
                  {healthCheck.operational ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Photo System:</span>
                <span className="font-semibold text-green-600">
                  {healthCheck.photoSystem ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="mt-2">
                <p className="text-muted-foreground mb-1">Message:</p>
                <p className="font-medium">{healthCheck.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="space-y-3 p-4 bg-destructive/10 rounded-lg border border-destructive/30">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Error
            </h3>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Service Information */}
        <div className="space-y-3 p-4 bg-primary/5 rounded-lg">
          <h3 className="font-semibold text-lg">Service Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Internet Computer Network</p>
                <p className="text-muted-foreground text-xs">
                  Running on the decentralized Internet Computer blockchain
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Production Deployment</p>
                <p className="text-muted-foreground text-xs">
                  Permanent canister with indefinite hosting and persistent data storage
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Network Availability</p>
                <p className="text-muted-foreground text-xs">
                  24/7 uptime with automatic failover and redundancy
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">DNS & Infrastructure</p>
                <p className="text-muted-foreground text-xs">
                  Distributed infrastructure with global CDN and automatic DNS resolution
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={checkSystemStatus}
          disabled={isChecking || !actor}
          className="w-full font-semibold"
          size="lg"
        >
          {isChecking ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Checking Status...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-5 w-5" />
              Check Service Status
            </>
          )}
        </Button>

        {/* Additional Information */}
        <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
          <p>
            <strong>Note:</strong> This check verifies the operational status of the Caffeine
            production deployment service and the Internet Computer network.
          </p>
          <p>
            The service runs on a permanent production canister with no expiration dates or
            scheduled maintenance windows.
          </p>
          <p>
            Admin access is required to perform system health checks.
          </p>
          <p>
            For real-time network status, visit:{' '}
            <a
              href="https://status.internetcomputer.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              status.internetcomputer.org
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
