import { afterNextRender, Directive, DestroyRef, ElementRef, inject, input } from '@angular/core';

import { MotionService } from './motion.service';

/**
 * Reveals text word-by-word or line-by-line when the element enters the viewport.
 *
 * Usage:
 *   <h1 appTextReveal splitBy="word">Hello world</h1>
 *   <p appTextReveal splitBy="line" [duration]="0.8" [staggerDelay]="0.08">
 *     Multi-line paragraph that reveals line by line.
 *   </p>
 */
@Directive({
  selector: '[appTextReveal]',
  standalone: true,
})
export class TextRevealDirective {
  private readonly motion = inject(MotionService);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  /** Split text by words or detected lines. */
  readonly splitBy = input<'word' | 'line'>('word');
  /** Animation duration for each word/line in seconds. */
  readonly duration = input<number>(0.6);
  /** Delay between consecutive words/lines in seconds. */
  readonly staggerDelay = input<number>(0.05);
  /** Vertical offset in px before reveal. */
  readonly y = input<number>(20);

  private originalText = '';
  private spans: HTMLSpanElement[] = [];
  private inViewCleanup?: () => void;
  private animations: ReturnType<typeof this.motion.animate>[] = [];

  constructor() {
    afterNextRender(async () => {
      await this.motion.init();

      if (this.motion.prefersReducedMotion()) {
        return;
      }

      this.originalText = this.el.nativeElement.textContent || '';
      if (!this.originalText.trim()) {
        return;
      }

      this.wrap();
      this.setupInView();
    });

    this.destroyRef.onDestroy(() => this.cleanup());
  }

  private cleanup(): void {
    this.inViewCleanup?.();
    this.animations.forEach((controls) => controls?.stop());
    this.animations = [];

    if (this.originalText) {
      this.el.nativeElement.textContent = this.originalText;
    }
    this.spans = [];
  }

  private wrap(): void {
    const container = this.el.nativeElement;
    const text = this.originalText;

    const parts =
      this.splitBy() === 'line' ? this.detectLines(text) : text.trim().split(/\s+/).filter(Boolean);

    if (!parts.length) {
      return;
    }

    container.innerHTML = '';
    this.spans = [];

    const isLineMode = this.splitBy() === 'line';

    parts.forEach((part, index) => {
      const span = document.createElement('span');
      span.textContent = part;
      span.style.display = isLineMode ? 'block' : 'inline-block';
      span.style.opacity = '0';
      span.style.transform = `translateY(${this.y()}px)`;
      span.style.willChange = 'transform, opacity';

      container.appendChild(span);
      this.spans.push(span);

      if (!isLineMode && index < parts.length - 1) {
        container.appendChild(document.createTextNode(' '));
      }
    });
  }

  private detectLines(text: string): string[] {
    const container = this.el.nativeElement;
    const words = text.trim().split(/\s+/).filter(Boolean);

    if (words.length <= 1) {
      return words.length ? [words[0]] : [text];
    }

    // Temporarily wrap each word so we can detect line breaks via getClientRects().
    container.innerHTML = '';
    const wordSpans: { word: string; top: number }[] = [];

    words.forEach((word, index) => {
      if (index > 0) {
        container.appendChild(document.createTextNode(' '));
      }
      const span = document.createElement('span');
      span.textContent = word;
      span.style.display = 'inline';
      container.appendChild(span);

      const rect = span.getClientRects()[0];
      wordSpans.push({ word, top: rect ? rect.top : 0 });
    });

    const lines: string[] = [];
    let currentLine: string[] = [];
    let currentTop: number | null = null;

    wordSpans.forEach(({ word, top }) => {
      if (currentTop === null || Math.abs(top - currentTop) < 1) {
        currentLine.push(word);
      } else {
        lines.push(currentLine.join(' '));
        currentLine = [word];
      }
      currentTop = top;
    });

    if (currentLine.length) {
      lines.push(currentLine.join(' '));
    }

    return lines.length ? lines : [text];
  }

  private setupInView(): void {
    if (!this.spans.length) {
      return;
    }

    this.inViewCleanup = this.motion.inView(
      this.el.nativeElement,
      () => {
        this.animate();
        // Reveal only once.
        this.inViewCleanup?.();
        this.inViewCleanup = undefined;
      },
      { amount: 'some' },
    );
  }

  private animate(): void {
    this.spans.forEach((span, index) => {
      const controls = this.motion.animate(
        span,
        { opacity: 1, y: 0 },
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
  }
}
