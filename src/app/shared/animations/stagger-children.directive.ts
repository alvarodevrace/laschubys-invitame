import {
  afterNextRender,
  Directive,
  DestroyRef,
  ElementRef,
  inject,
  input,
  numberAttribute,
  PLATFORM_ID,
} from '@angular/core';
import { MotionService } from './motion.service';
import { isTouchDevice } from './is-touch-device';

/**
 * Reveals child elements with a staggered animation when the container
 * enters the viewport.
 *
 * Usage:
 * ```html
 * <ul appStaggerChildren [staggerDelay]="0.1" childSelector="li">
 *   <li>Item 1</li>
 *   <li>Item 2</li>
 * </ul>
 * ```
 */
@Directive({
  selector: '[appStaggerChildren]',
  standalone: true,
})
export class StaggerChildrenDirective {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly motion = inject(MotionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  staggerDelay = input(0.1, { transform: numberAttribute });
  childSelector = input<string>('*');
  duration = input(0.5, { transform: numberAttribute });
  y = input(30, { transform: numberAttribute });
  opacity = input(0, { transform: numberAttribute });

  private inViewCleanup?: () => void;
  private animations: NonNullable<ReturnType<typeof this.motion.animate>>[] = [];
  private children: HTMLElement[] = [];
  private stateApplied = false;

  constructor() {
    afterNextRender(async () => {
      await this.motion.init();
      this.setup();
    });

    this.destroyRef.onDestroy(() => this.cleanup());
  }

  private setup(): void {
    const parent = this.el.nativeElement;
    this.children = Array.from(parent.querySelectorAll(this.childSelector())) as HTMLElement[];

    if (this.motion.prefersReducedMotion() || isTouchDevice(this.platformId)) {
      this.revealAll();
      return;
    }

    this.children.forEach((child) => {
      child.style.opacity = String(this.opacity());
      child.style.transform = `translateY(${this.y()}px)`;
      child.style.willChange = 'transform, opacity';
    });
    this.stateApplied = true;

    this.inViewCleanup = this.motion.inView(parent, () => {
      this.children.forEach((child, index) => {
        const controls = this.motion.animate(
          child,
          { opacity: 1, transform: 'translateY(0px)' },
          {
            duration: this.duration(),
            delay: index * this.staggerDelay(),
            ease: 'easeOut',
          },
        );

        if (controls) {
          this.animations.push(controls);
        }
      });

      this.inViewCleanup?.();
      this.inViewCleanup = undefined;
    });

    if (this.inViewCleanup) {
      this.destroyRef.onDestroy(() => this.inViewCleanup?.());
    }
  }

  private revealAll(): void {
    this.children.forEach((child) => {
      child.style.opacity = '1';
      child.style.transform = 'none';
    });
  }

  private cleanup(): void {
    this.inViewCleanup?.();
    this.animations.forEach((animation) => animation.stop());
    this.animations = [];

    if (this.stateApplied) {
      this.children.forEach((child) => {
        child.style.opacity = '';
        child.style.transform = '';
        child.style.willChange = '';
      });
    }
  }
}
