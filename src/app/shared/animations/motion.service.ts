import { Injectable, inject, PLATFORM_ID, DestroyRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Thin wrapper around the `motion` library.
 *
 * Usage rules:
 * - Inject `MotionService` where needed.
 * - Call `init()` inside `afterNextRender()` (client-only lifecycle hook).
 * - All helpers are no-ops on the server, so they are SSR-safe.
 * - Cleanup is automatically registered via `DestroyRef`.
 */
@Injectable({ providedIn: 'root' })
export class MotionService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private motionLib?: typeof import('motion');

  /**
   * Lazy-loads the motion library on the browser.
   * Must be called once before using any animation helper.
   */
  async init(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || this.motionLib) return;
    this.motionLib = await import('motion');
  }

  /** Returns true if the user prefers reduced motion. */
  prefersReducedMotion(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  animate(...args: Parameters<(typeof import('motion'))['animate']>) {
    if (!isPlatformBrowser(this.platformId)) return;
    const m = this.assertReady();
    const controls = m.animate(...args);
    this.destroyRef.onDestroy(() => controls.stop());
    return controls;
  }

  scroll(...args: Parameters<(typeof import('motion'))['scroll']>) {
    if (!isPlatformBrowser(this.platformId)) return;
    const m = this.assertReady();
    const cleanup = m.scroll(...args);
    if (cleanup) this.destroyRef.onDestroy(() => cleanup());
    return cleanup;
  }

  inView(...args: Parameters<(typeof import('motion'))['inView']>) {
    if (!isPlatformBrowser(this.platformId)) return;
    const m = this.assertReady();
    const cleanup = m.inView(...args);
    if (cleanup) this.destroyRef.onDestroy(() => cleanup());
    return cleanup;
  }

  hover(...args: Parameters<(typeof import('motion'))['hover']>) {
    if (!isPlatformBrowser(this.platformId)) return;
    const m = this.assertReady();
    const cleanup = m.hover(...args);
    if (cleanup) this.destroyRef.onDestroy(() => cleanup());
    return cleanup;
  }

  private assertReady(): typeof import('motion') {
    if (!this.motionLib) {
      throw new Error(
        'MotionService not initialized. Call init() inside afterNextRender() before animating.',
      );
    }
    return this.motionLib;
  }
}
