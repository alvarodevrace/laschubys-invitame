import {
  Directive,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MotionService } from './motion.service';

/**
 * Parallax directive.
 *
 * Translates the element along the requested axis based on page scroll progress.
 * Disabled on touch devices and when `prefers-reduced-motion` is active.
 */
@Directive({
  selector: '[appParallax]',
  standalone: true,
})
export class ParallaxDirective {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly motion = inject(MotionService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  speed = input(0.5, { transform: numberAttribute });
  axis = input<'x' | 'y'>('y');

  private scrollCleanup?: () => void;

  constructor() {
    afterNextRender(async () => {
      if (
        !isPlatformBrowser(this.platformId) ||
        this.isTouchDevice() ||
        this.motion.prefersReducedMotion()
      ) {
        return;
      }

      await this.motion.init();
      this.setup();
    });

    this.destroyRef.onDestroy(() => this.cleanup());
  }

  private setup(): void {
    const element = this.el.nativeElement;
    element.style.willChange = 'transform';

    this.scrollCleanup = this.motion.scroll((progress: number) => {
      const distance = progress * this.speed() * 300;
      element.style.transform = `translate${this.axis().toUpperCase()}(${distance}px)`;
    });
  }

  private cleanup(): void {
    this.scrollCleanup?.();
    const element = this.el.nativeElement;
    element.style.willChange = '';
    element.style.transform = '';
  }

  private isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }
}
