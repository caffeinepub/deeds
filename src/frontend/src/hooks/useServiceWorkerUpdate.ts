import { useEffect, useState } from 'react';
import { isReloadAllowed, incrementReloadCount, shouldBlockReload } from '../utils/swReloadGuard';

interface ServiceWorkerUpdateState {
  updateAvailable: boolean;
  isStale: boolean;
  registration: ServiceWorkerRegistration | null;
  reloadBlocked: boolean;
}

export function useServiceWorkerUpdate() {
  const [state, setState] = useState<ServiceWorkerUpdateState>({
    updateAvailable: false,
    isStale: false,
    registration: null,
    reloadBlocked: false,
  });

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let registration: ServiceWorkerRegistration | null = null;

    const checkForUpdates = async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        registration = reg || null;
        
        if (!registration) return;

        // Check if there's a waiting service worker
        if (registration.waiting) {
          setState(prev => ({
            ...prev,
            updateAvailable: true,
            registration,
          }));
        }

        // Listen for new service workers
        registration.addEventListener('updatefound', () => {
          const newWorker = registration!.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setState(prev => ({
                ...prev,
                updateAvailable: true,
                registration,
              }));
            }
          });
        });
      } catch (error) {
        console.error('Error checking for service worker updates:', error);
      }
    };

    checkForUpdates();

    // Check for stale cache (if app hasn't been updated in a while)
    const lastUpdateCheck = localStorage.getItem('deeds-last-update-check');
    const now = Date.now();
    if (lastUpdateCheck) {
      const timeSinceLastCheck = now - parseInt(lastUpdateCheck, 10);
      // If more than 1 hour since last check, consider potentially stale
      if (timeSinceLastCheck > 3600000) {
        setState(prev => ({ ...prev, isStale: true }));
      }
    }
    localStorage.setItem('deeds-last-update-check', now.toString());

    // Listen for controller change (new SW activated) with reload guard
    const handleControllerChange = () => {
      console.log('[SW Update] Controller changed');
      
      if (shouldBlockReload()) {
        console.warn('[SW Update] Reload blocked - maximum reloads reached');
        setState(prev => ({ ...prev, reloadBlocked: true }));
        return;
      }

      if (isReloadAllowed()) {
        console.log('[SW Update] Reloading page after SW activation');
        incrementReloadCount();
        window.location.reload();
      }
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  const activateUpdate = async () => {
    if (!state.registration?.waiting) return;

    console.log('[SW Update] Activating waiting service worker');
    // Tell the waiting service worker to skip waiting
    state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  };

  return {
    updateAvailable: state.updateAvailable,
    isStale: state.isStale,
    reloadBlocked: state.reloadBlocked,
    activateUpdate,
  };
}
