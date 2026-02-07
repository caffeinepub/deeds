import { useState } from 'react';
import { useActor } from '../hooks/useActor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Shield, Activity, Database, Network, Trash2 } from 'lucide-react';
import ServiceStatusChecker from './ServiceStatusChecker';
import StorageCleanup from './StorageCleanup';

export default function AdminDashboard() {
  const { actor } = useActor();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const checkAdminStatus = async () => {
    if (!actor) return;
    setChecking(true);
    try {
      const adminStatus = await actor.isCallerAdmin();
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error('Failed to check admin status:', error);
      setIsAdmin(false);
    } finally {
      setChecking(false);
    }
  };

  if (isAdmin === null) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Card className="shadow-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Admin Dashboard
            </CardTitle>
            <CardDescription>
              Verify your admin status to access system management tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={checkAdminStatus} disabled={checking || !actor} className="w-full">
              {checking ? 'Checking...' : 'Check Admin Status'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Card className="shadow-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-destructive" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You do not have administrator privileges to access this dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="destructive">Not Authorized</Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              System management and monitoring tools
            </p>
          </div>
          <Badge className="bg-green-600 hover:bg-green-700">
            <Shield className="h-4 w-4 mr-1" />
            Admin Access
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="status" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="status">
            <Activity className="h-4 w-4 mr-2" />
            Service Status
          </TabsTrigger>
          <TabsTrigger value="storage">
            <Trash2 className="h-4 w-4 mr-2" />
            Storage Cleanup
          </TabsTrigger>
          <TabsTrigger value="network">
            <Network className="h-4 w-4 mr-2" />
            Network
          </TabsTrigger>
          <TabsTrigger value="database">
            <Database className="h-4 w-4 mr-2" />
            Database
          </TabsTrigger>
          <TabsTrigger value="system">
            <Shield className="h-4 w-4 mr-2" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-6">
          <ServiceStatusChecker />
        </TabsContent>

        <TabsContent value="storage" className="space-y-6">
          <StorageCleanup />
        </TabsContent>

        <TabsContent value="network" className="space-y-6">
          <Card className="shadow-premium">
            <CardHeader>
              <CardTitle>Network Information</CardTitle>
              <CardDescription>
                Internet Computer network status and connectivity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                  <span className="font-medium">Network Type:</span>
                  <Badge>Production Mainnet</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                  <span className="font-medium">Deployment Status:</span>
                  <Badge className="bg-green-600 hover:bg-green-700">Live</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                  <span className="font-medium">Canister Type:</span>
                  <Badge variant="secondary">Permanent Production</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card className="shadow-premium">
            <CardHeader>
              <CardTitle>Database Status</CardTitle>
              <CardDescription>
                Persistent data storage and state management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                  <span className="font-medium">Storage Type:</span>
                  <Badge variant="secondary">Stable Memory</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                  <span className="font-medium">Data Persistence:</span>
                  <Badge className="bg-green-600 hover:bg-green-700">Enabled</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                  <span className="font-medium">Backup Status:</span>
                  <Badge className="bg-green-600 hover:bg-green-700">Automatic</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card className="shadow-premium">
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>
                Application configuration and deployment details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                  <span className="font-medium">Application:</span>
                  <span className="font-semibold">Deeds</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                  <span className="font-medium">Deployment Type:</span>
                  <Badge className="bg-green-600 hover:bg-green-700">Production</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                  <span className="font-medium">Expiration:</span>
                  <Badge variant="secondary">No Expiration</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                  <span className="font-medium">Content Language:</span>
                  <Badge variant="secondary">English</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
