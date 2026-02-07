/**
 * Service Worker Reload Guard
 * Prevents infinite reload loops by tracking and limiting SW-triggered reloads per session
 */

const RELOAD_COUNT_KEY = 'deeds-sw-reload-count';
const MAX_RELOADS_PER_SESSION = 1;

export function getReloadCount(): number {
  const count = sessionStorage.getItem(RELOAD_COUNT_KEY);
  return count ? parseInt(count, 10) : 0;
}

export function incrementReloadCount(): number {
  const current = getReloadCount();
  const next = current + 1;
  sessionStorage.setItem(RELOAD_COUNT_KEY, next.toString());
  return next;
}

export function resetReloadCount(): void {
  sessionStorage.removeItem(RELOAD_COUNT_KEY);
}

export function isReloadAllowed(): boolean {
  return getReloadCount() < MAX_RELOADS_PER_SESSION;
}

export function shouldBlockReload(): boolean {
  return !isReloadAllowed();
}
