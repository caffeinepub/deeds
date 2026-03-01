/**
 * Service Worker Recovery Utilities
 * Provides client-side recovery helpers to clear stale caches and unregister service workers
 */

import { resetReloadCount } from './swReloadGuard';

const RECOVERY_COOLDOWN_KEY = 'deeds-recovery-cooldown';
const RECOVERY_COOLDOWN_MS = 5000; // 5 seconds

export async function clearServiceWorkerCaches(): Promise<void> {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('All caches cleared successfully');
    } catch (error) {
      console.error('Error clearing caches:', error);
    }
  }
}

export async function unregisterServiceWorkers(): Promise<void> {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(registration => registration.unregister())
      );
      console.log('All service workers unregistered successfully');
    } catch (error) {
      console.error('Error unregistering service workers:', error);
    }
  }
}

export async function activateWaitingServiceWorker(): Promise<void> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    } catch (error) {
      console.error('Error activating waiting service worker:', error);
    }
  }
}

export function isInRecoveryCooldown(): boolean {
  const cooldownEnd = sessionStorage.getItem(RECOVERY_COOLDOWN_KEY);
  if (!cooldownEnd) return false;
  
  const now = Date.now();
  const end = parseInt(cooldownEnd, 10);
  return now < end;
}

export function setRecoveryCooldown(): void {
  const cooldownEnd = Date.now() + RECOVERY_COOLDOWN_MS;
  sessionStorage.setItem(RECOVERY_COOLDOWN_KEY, cooldownEnd.toString());
}

export async function performFullRecovery(): Promise<void> {
  console.log('[Recovery] Starting full recovery process');
  
  // Set cooldown to prevent immediate re-trigger
  setRecoveryCooldown();
  
  // Clear all caches and service workers
  await clearServiceWorkerCaches();
  await unregisterServiceWorkers();
  
  // Reset reload counter and recovery flag
  resetReloadCount();
  sessionStorage.removeItem('deeds-recovery-attempted');
  
  // Reload the page after cleanup
  window.location.reload();
}

export function hasRecoveryBeenAttempted(): boolean {
  return sessionStorage.getItem('deeds-recovery-attempted') === 'true';
}

export function markRecoveryAttempted(): void {
  sessionStorage.setItem('deeds-recovery-attempted', 'true');
}

export function clearRecoveryAttempted(): void {
  sessionStorage.removeItem('deeds-recovery-attempted');
}
