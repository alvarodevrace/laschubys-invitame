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
import type { EasingDefinition } from './animations.model';

/**
 * Scroll-reveal directive.
 *
 * Hides the element initially and animates it in when it enters the viewport.
 * SSR-safe and respects `prefers-reduced-motion`.
 */
@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly motion = inject(MotionService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  duration = input(0.6, { transform: numberAttribute });
  delay = input(0, { transform: numberAttribute });
  y = input(40, { transform: numberAttribute });
  x = input(0, { transform: numberAttribute });
  scale = input(1, { transform: numberAttribute });
  opacity = input(0, { transform: numberAttribute });
  easing = input<EasingDefinition>('easeOut');
  once = input(true);
  amount = input<'some' | 'all' | number>('some');

  private inViewCleanup?: () => void;
  private currentAnimation?: ReturnType<typeof this.motion.animate>;

  constructor() {
    afterNextRender(async () => {
      if (!isPlatformBrowser(this.platformId)) {
        this.reveal();
        return;
      }

      await this.motion.init();

      if (this.motion.prefersReducedMotion()) {
        this.reveal();
        return;
      }

      this.setup();
    });

    this.destroyRef.onDestroy(() => this.cleanup());
  }

  private setup(): void {
    const element = this.el.nativeElement;
    this.setInitialState(element);

    this.inViewCleanup = this.motion.inView(
      element,
      () => {
        this.animateIn(element);

        if (this.once()) {
          this.inViewCleanup?.();
          this.inViewCleanup = undefined;
          return;
        }

        // When `once` is false, return a callback that resets the element
        // when it leaves the viewport so it can re-animate on re-entry.
        return () => this.setInitialState(element);
      },
      { amount: this.amount() },
    );
  }

  private setInitialState(element: HTMLElement): void {
    element.style.opacity = String(this.opacity());
    element.style.transform = `translate3d(${this.x()}px, ${this.y()}px, 0) scale(${this.scale()})`;
    element.style.willChange = 'transform, opacity';
  }

  private animateIn(element: HTMLElement): void {
    this.currentAnimation = this.motion.animate(
      element,
      {
        opacity: 1,
        transform: 'translate3d(0px, 0px, 0) scale(1)',
      },
      {
        duration: this.duration(),
        delay: this.delay(),
        ease: this.easing(),
      },
    );
  }

  private reveal(): void {
    const element = this.el.nativeElement;
    element.style.opacity = '1';
    element.style.transform = 'none';
  }

  private cleanup(): void {
    this.currentAnimation?.stop();
    this.inViewCleanup?.();

    const element = this.el.nativeElement;
    element.style.willChange = '';
    element.style.transform = '';
    element.style.opacity = '';
  }
}
