import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';

// Static imports — avoids TypeScript "not a module" errors from dynamic import()
import Header from './components/Header';
import Footer from './components/Footer';
import LoginPrompt from './components/LoginPrompt';
import ProfileSetupModal from './components/ProfileSetupModal';
import LockScreenOverlay from './components/LockScreenOverlay';
import Feed from './components/Feed';
import DiscoverFeed from './components/DiscoverFeed';
import Profile from './components/Profile';
import Messages from './components/Messages';
import LiveFeed from './components/LiveFeed';
import BlogPage from './components/BlogPage';
import Marketplace from './components/Marketplace';
import Space from './components/Space';
import AdminDashboard from './components/AdminDashboard';
import ServiceStatusChecker from './components/ServiceStatusChecker';
import Gate from './components/Gate';
import AllInOneHub from './components/AllInOneHub';
import ReelHome from './components/ReelHome';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
    },
  },
});

function AppLayout() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  const showProfileSetup =
    isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <img
            src="/assets/generated/deeds-header-logo-star-flash-enhanced.dim_300x100.png"
            alt="Deeds"
            className="h-12 mx-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading Deeds...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-16 pb-4">
        <Outlet />
      </main>
      <Footer />
      {showProfileSetup && <ProfileSetupModal open={true} onComplete={() => {}} />}
      <LockScreenOverlay />
    </div>
  );
}

// Routes
const rootRoute = createRootRoute({ component: AppLayout });

const reelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: ReelHome,
});

const gateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/gate',
  component: Gate,
});

const feedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/feed',
  component: Feed,
});

const discoverRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/discover',
  component: DiscoverFeed,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: Profile,
});

const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/messages',
  component: Messages,
});

const hubRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/hub',
  component: AllInOneHub,
});

const liveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/live',
  component: LiveFeed,
});

const blogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/blog',
  component: BlogPage,
});

const marketplaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/marketplace',
  component: Marketplace,
});

const spaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/space',
  component: Space,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboard,
});

const serviceStatusRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/service-status',
  component: ServiceStatusChecker,
});

const loveNotesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/love-notes',
  component: AllInOneHub,
});

const deedOfTheDayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/deed-of-the-day',
  component: () => (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-foreground mb-4">Deed of the Day</h1>
      <p className="text-muted-foreground">Today's featured deed challenge coming soon!</p>
    </div>
  ),
});

const kindnessMatchesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/kindness-matches',
  component: () => (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-foreground mb-4">Kindness Matches</h1>
      <p className="text-muted-foreground">Your kindness matches are being calculated...</p>
    </div>
  ),
});

const routeTree = rootRoute.addChildren([
  reelRoute,
  gateRoute,
  feedRoute,
  discoverRoute,
  profileRoute,
  messagesRoute,
  hubRoute,
  liveRoute,
  blogRoute,
  marketplaceRoute,
  spaceRoute,
  adminRoute,
  serviceStatusRoute,
  loveNotesRoute,
  deedOfTheDayRoute,
  kindnessMatchesRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <RouterProvider router={router} />
        <Toaster position="top-center" richColors />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
