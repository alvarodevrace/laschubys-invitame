import { isPlatformBrowser } from '@angular/common';

/**
 * Returns true if the current device reports touch capability.
 * SSR-safe: always returns false on the server.
 */
export function isTouchDevice(platformId: object): boolean {
  if (!isPlatformBrowser(platformId)) return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}
