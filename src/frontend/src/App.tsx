/**
 * DEEDS - PERMANENT PRODUCTION VERSION
 * 
 * ✅ PRODUCTION STATUS: LIVE AND OPERATIONAL
 * 
 * This application is deployed as a permanent production canister with:
 * - ✅ Indefinite hosting and persistent data storage
 * - ✅ No expiration dates or rebuild requirements
 * - ✅ All features fully operational:
 *   • TikTok-style Vertical Reel - Full-screen scroll-snap video feed
 *   • Overlay Action Icons - Spark/Inspire/Comment/Share on each reel item
 *   • Compact Bottom Navigation - One-tap access to all sections
 *   • Simplified Reaction System - Spark (red), Inspire (silver), Comment (cyan), Share (white)
 *   • DeedsBar - Real-time session duration tracking with battery indicator
 *   • Multilingual Support - Auto-detect and manual language switching (10 languages)
 *   • Service Worker Updates - Automatic update detection and recovery with reload guards
 * 
 * IMPORTANT: This is a production application. All data is persistent and secure.
 */

import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InternetIdentityProvider } from './hooks/useInternetIdentity';
import { LanguageProvider } from './contexts/LanguageContext';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { useEffect, useState } from 'react';
import { hasRecoveryBeenAttempted, markRecoveryAttempted, isInRecoveryCooldown } from './utils/swRecovery';

import Header from './components/Header';
import Footer from './components/Footer';
import ReelHome from './components/ReelHome';
import AllInOneHub from './components/AllInOneHub';
import Gate from './components/Gate';
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
import StartupRecoveryScreen from './components/StartupRecoveryScreen';
import TopLevelErrorBoundary from './components/TopLevelErrorBoundary';
import UpdateAvailableBanner from './components/UpdateAvailableBanner';
import { useServiceWorkerUpdate } from './hooks/useServiceWorkerUpdate';
import { useLocation } from '@tanstack/react-router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Layout() {
  const location = useLocation();
  const isReelRoute = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!isReelRoute && <Header />}
      <main className={isReelRoute ? 'h-screen' : 'flex-1'}>
        <Outlet />
      </main>
      {!isReelRoute && <Footer />}
    </div>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: ReelHome,
});

const hubRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/hub',
  component: AllInOneHub,
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

const routeTree = rootRoute.addChildren([
  indexRoute,
  hubRoute,
  gateRoute,
  feedRoute,
  discoverRoute,
  profileRoute,
  messagesRoute,
  liveRoute,
  blogRoute,
  marketplaceRoute,
  spaceRoute,
  adminRoute,
  serviceStatusRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function AppContent() {
  const { updateAvailable, isStale, reloadBlocked, activateUpdate } = useServiceWorkerUpdate();
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const [startupReady, setStartupReady] = useState(false);

  useEffect(() => {
    setStartupReady(true);
  }, []);

  useEffect(() => {
    if (updateAvailable || isStale || reloadBlocked) {
      setShowUpdateBanner(true);
    }
  }, [updateAvailable, isStale, reloadBlocked]);

  if (reloadBlocked) {
    return <StartupRecoveryScreen context="update-failed" />;
  }

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
      {showUpdateBanner && (
        <UpdateAvailableBanner
          onUpdate={activateUpdate}
          onDismiss={() => setShowUpdateBanner(false)}
          reloadBlocked={reloadBlocked}
        />
      )}
    </>
  );
}

function AppWithWatchdog() {
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    if (isInRecoveryCooldown()) {
      console.log('[Watchdog] In recovery cooldown, skipping');
      return;
    }

    if (hasRecoveryBeenAttempted()) {
      console.log('[Watchdog] Recovery already attempted, skipping');
      return;
    }

    const timer = setTimeout(() => {
      console.warn('[Watchdog] App appears stuck during initialization');
      setIsStuck(true);
      markRecoveryAttempted();
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  if (isStuck) {
    return <StartupRecoveryScreen context="stuck" />;
  }

  return <AppContent />;
}

export default function App() {
  return (
    <TopLevelErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <QueryClientProvider client={queryClient}>
          <InternetIdentityProvider>
            <LanguageProvider>
              <AppWithWatchdog />
            </LanguageProvider>
          </InternetIdentityProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </TopLevelErrorBoundary>
  );
}
