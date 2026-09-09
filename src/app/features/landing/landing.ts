import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  PLATFORM_ID,
  runInInjectionContext,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideCat,
  lucideHeart,
  lucideHeartHandshake,
} from '@ng-icons/lucide';

import type { Tier } from '../../core/models/donation';
import { tierColor as tierColorFor } from '../../shared/ui/tier-visuals';
import { clearPendingCollab, readPendingCollab } from '../../core/services/pending-collab';
import {
  ParallaxDirective,
  ScrollRevealDirective,
  StaggerChildrenDirective,
  TextRevealDirective,
} from '../../shared/animations';
import { WallComponent } from './components/wall';
import { CollaborationPanelComponent } from './components/collaboration-panel';

const TIER_LIST: readonly Tier[] = [
  {
    key: 'croqueta',
    name: 'Croqueta',
    priceUsd: 5,
    description: 'Un snackito para consentir a las chubys.',
    image: '/images/cats/rubi.jpeg',
  },
  {
    key: 'churu',
    name: 'Churu',
    priceUsd: 10,
    description: 'Un churu para mimar a Iris en su siesta.',
    image: '/images/cats/iris.jpeg',
  },
  {
    key: 'salmon',
    name: 'Salmón',
    priceUsd: 15,
    description: 'Un salmón fresco para el festín de Rubí.',
    image: '/images/cats/iris2.jpeg',
  },
];

/**
 * Landing page for the standalone "Invítame un Churu" collaboration app.
 * Follows the Las Chubys design system (tokens, cards, motion).
 */
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    NgIcon,
    WallComponent,
    CollaborationPanelComponent,
    ScrollRevealDirective,
    TextRevealDirective,
    StaggerChildrenDirective,
    ParallaxDirective,
  ],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideCat,
      lucideHeart,
      lucideHeartHandshake,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (cancelled()) {
      <div class="max-w-6xl mx-auto px-4 pt-6">
        <div
          role="status"
          aria-live="polite"
          class="flex items-center justify-between gap-4 rounded-2xl border border-border bg-white px-5 py-4 shadow-sm"
        >
          <p class="text-sm font-semibold text-foreground">
            Colaboración cancelada — no se realizó ningún cobro.
          </p>
          <button
            type="button"
            (click)="dismissCancelled()"
            class="shrink-0 rounded-full border border-border px-4 py-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    }

    <!-- Hero -->
    <section class="relative bg-surface overflow-hidden">
      <div class="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div class="grid md:grid-cols-2 gap-10 items-center">
          <div class="text-center md:text-left">
            <p class="text-xs md:text-sm font-extrabold uppercase tracking-widest text-primary mb-4">
              Colaboración gatuna
            </p>
            <h1
              class="text-h1 md:text-h2 font-extrabold uppercase tracking-widest text-foreground mb-4 flex items-center justify-center md:justify-start gap-2"
            >
              <ng-icon name="lucideCat" class="w-8 h-8 md:w-10 md:h-10 text-primary" />
              <span appTextReveal splitBy="word" [duration]="0.5" [staggerDelay]="0.08">
                Invítame un Churu
              </span>
            </h1>
            <p class="text-body text-muted-foreground mb-6">
              Con tu colaboración, Iris y Rubí siguen creando contenido felino. Elige un regalo
              para las chubys y deja un mensaje en su muro.
            </p>
            <a
              href="#tiers"
              class="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-4 font-bold text-lg transition-all ease-bounce hover:bg-primary/80 hover:-translate-y-1 hover:shadow-xl"
            >
              Invítame un Churu
              <ng-icon name="lucideArrowRight" class="w-5 h-5" />
            </a>
          </div>

          <div class="relative flex justify-center">
            <div class="relative rounded-[2.5rem] overflow-hidden shadow-2xl w-full max-w-sm">
              <img
                src="/images/cats/iris3.jpeg"
                alt="Iris, la chuby"
                class="w-full aspect-[4/3] object-cover"
                width="600"
                height="450"
              />
            </div>
            <div
              appParallax
              [speed]="-0.3"
              class="absolute -bottom-6 -left-6 w-14 h-14 text-primary/15"
              aria-hidden="true"
            >
              <ng-icon name="lucideHeart" class="w-full h-full" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Wave divider -->
    <div class="relative h-16 md:h-20 overflow-hidden bg-surface -mb-1" aria-hidden="true">
      <svg
        class="absolute bottom-0 w-full h-full text-white"
        viewBox="0 0 1200 80"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0 20 Q75 0 150 20 T300 20 T450 20 T600 20 T750 20 T900 20 T1050 20 T1200 20 L1200 80 L0 80 Z"
        />
      </svg>
    </div>

    <!-- Tiers -->
    <section id="tiers" class="py-10 md:py-16 bg-white">
      <div class="max-w-6xl mx-auto px-4">
        <div class="text-center mb-10" appScrollReveal [y]="24">
          <h2
            class="text-h2 font-extrabold uppercase tracking-widest text-foreground mb-1 flex items-center justify-center gap-1.5"
          >
            <ng-icon name="lucideHeartHandshake" class="w-5 h-5 md:w-6 md:h-6" />
            <span appTextReveal splitBy="word" [duration]="0.5" [staggerDelay]="0.08">
              Elige tu colaboración
            </span>
          </h2>
          <p class="text-base md:text-lg font-bold text-muted-foreground mb-3">
            Un regalo para las chubys, un mensaje para el muro
          </p>
        </div>

        <div
          #tiersGrid
          [class]="
            selectedTier()
              ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
              : 'grid grid-cols-1 md:grid-cols-3 gap-6'
          "
          appStaggerChildren
          childSelector="article"
          [staggerDelay]="0.1"
          [y]="30"
          [duration]="0.5"
        >
          @for (tier of visibleTiers(); track tier.key) {
            <article
              [attr.data-tier-key]="tier.key"
              class="group relative block h-full rounded-[2.5rem] overflow-hidden transition-all duration-500 ease-bounce hover:-translate-y-3 hover:scale-[1.02] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.2)]"
              [class.ring-4]="isSelected(tier)"
              [class.ring-offset-2]="isSelected(tier)"
              [class.ring-offset-white]="isSelected(tier)"
              [style.--tw-ring-color]="tierColor(tier.key).accent"
              [style.background]="tierColor(tier.key).light"
            >
              <div class="relative aspect-[4/3] overflow-hidden">
                <img
                  [src]="tier.image"
                  [alt]="tier.name"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[3deg]"
                  width="400"
                  height="300"
                />
              </div>
              <div
                class="relative rounded-[1.75rem] mx-2 mb-2 bg-white p-5 shadow-lg"
              >
                <p
                  class="text-xs font-extrabold uppercase tracking-widest mb-1"
                  [style.color]="tierColor(tier.key).accent"
                >
                  {{ tier.name }}
                </p>
                <p class="text-3xl font-black text-foreground">\${{ tier.priceUsd }}</p>
                <p class="text-xs font-semibold text-muted-foreground">USD</p>
                <p class="text-sm text-muted-foreground leading-relaxed mt-2">
                  {{ tier.description }}
                </p>
                <button
                  type="button"
                  (click)="selectTier(tier, $event)"
                  class="mt-4 w-full rounded-full bg-primary text-primary-foreground py-3 font-bold text-lg transition-all ease-bounce hover:bg-primary/80 active:translate-y-[2px]"
                >
                  Colaborar
                </button>
              </div>
            </article>
          }

          @if (selectedTier(); as tier) {
            <app-collaboration-panel [tier]="tier" (cancelled)="clearSelection()" />
          }
        </div>
      </div>
    </section>

    <!-- Wave divider -->
    <div class="relative h-16 md:h-20 overflow-hidden bg-white -mb-1" aria-hidden="true">
      <svg
        class="absolute bottom-0 w-full h-full text-surface"
        viewBox="0 0 1200 80"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0 20 Q75 0 150 20 T300 20 T450 20 T600 20 T750 20 T900 20 T1050 20 T1200 20 L1200 80 L0 80 Z"
        />
      </svg>
    </div>

    <!-- Wall -->
    <section class="py-10 md:py-16 bg-surface">
      <div class="max-w-6xl mx-auto px-4">
        <app-wall />
      </div>
    </section>

  `,
})
export class LandingComponent {
  readonly tiers: readonly Tier[] = TIER_LIST;

  protected readonly tierColor = tierColorFor;

  protected readonly selectedTier = signal<Tier | null>(null);

  /** Tiers shown in the grid: all by default, or only the selected one inline. */
  protected readonly visibleTiers = computed(() => {
    const selected = this.selectedTier();
    return selected ? [selected] : this.tiers;
  });

  private readonly platformId = inject(PLATFORM_ID);
  private readonly injector = inject(Injector);
  private readonly route = inject(ActivatedRoute);
  private readonly gridEl = viewChild<ElementRef<HTMLElement>>('tiersGrid');

  /** True when the user returned from PayPal via the `cancel_url` (no PayerID). */
  protected readonly cancelled = signal(false);

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      this.handlePaypalCancel();
    });
  }

  /**
   * PayPal redirects to `cancel_url` (the home page) with `?token=<orderId>`
   * and no `PayerID`. When detected, show a subtle banner and drop the pending
   * collaboration so it can't be captured later.
   */
  private handlePaypalCancel(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    const payerId = this.route.snapshot.queryParamMap.get('PayerID');
    if (token && !payerId) {
      const pending = readPendingCollab();
      if (pending && pending.orderId === token) {
        clearPendingCollab();
      }
      this.cancelled.set(true);
    }
  }

  protected dismissCancelled(): void {
    this.cancelled.set(false);
  }

  /** The card currently animating (FLIP / slide-in), so it can be cancelled cleanly. */
  private activeCard: HTMLElement | null = null;
  private onTransitionEnd?: () => void;
  private flipTimeout?: ReturnType<typeof setTimeout>;

  protected isSelected(tier: Tier): boolean {
    return this.selectedTier()?.key === tier.key;
  }

  protected selectTier(tier: Tier, event?: Event): void {
    if (this.selectedTier()?.key === tier.key) return;
    // F(irst): capture the clicked card's original rect BEFORE the layout changes.
    const card = event ? ((event.target as Element).closest('article') as HTMLElement | null) : null;
    const firstRect = card?.getBoundingClientRect() ?? null;
    this.selectedTier.set(tier);
    if (!isPlatformBrowser(this.platformId)) return;
    // L(ast): measure the card after the DOM re-renders, then invert + play.
    // afterNextRender must run in an injection context, so wrap it for event handlers.
    runInInjectionContext(this.injector, () => {
      afterNextRender(() => this.animateTierIn(tier.key, firstRect));
    });
  }

  protected clearSelection(): void {
    // Graceful reset: clear any in-flight transform BEFORE the 3-card row re-renders.
    this.clearActiveCard();
    this.selectedTier.set(null);
  }

  private animateTierIn(key: string, firstRect: DOMRect | null): void {
    const card = this.findCard(key);
    if (!card) return;
    if (this.prefersReducedMotion()) return; // card is already at its final slot
    if (!firstRect) {
      this.slideInFromRight(card);
      return;
    }
    const lastRect = card.getBoundingClientRect();
    const dx = firstRect.left - lastRect.left;
    const dy = firstRect.top - lastRect.top;
    const sw = lastRect.width ? firstRect.width / lastRect.width : 1;
    const sh = lastRect.height ? firstRect.height / lastRect.height : 1;

    this.setActiveCard(card);
    // I(nvert): place the card exactly where it started, with no transition.
    card.style.transition = 'none';
    card.style.willChange = 'transform';
    card.style.transform = `translate(${dx}px, ${dy}px) scale(${sw}, ${sh})`;
    // Force reflow so the inverted state is painted before the transition starts.
    void card.offsetWidth;
    // P(lay): springy slide into the new slot.
    card.style.transition = 'transform 500ms var(--ease-bounce)';
    card.style.transform = 'translate(0px, 0px) scale(1, 1)';
    this.flipTimeout = setTimeout(() => this.clearActiveCard(), 620);
  }

  /** Fallback when we have no first rect (no click event): slide in from the right. */
  private slideInFromRight(card: HTMLElement): void {
    this.setActiveCard(card);
    card.style.transition = 'none';
    card.style.willChange = 'transform, opacity';
    card.style.opacity = '0';
    card.style.transform = 'translateX(120%)';
    void card.offsetWidth;
    card.style.transition = 'transform 500ms var(--ease-bounce), opacity 400ms var(--ease-smooth)';
    card.style.opacity = '1';
    card.style.transform = 'translateX(0)';
    this.flipTimeout = setTimeout(() => this.clearActiveCard(), 620);
  }

  private findCard(key: string): HTMLElement | null {
    return this.gridEl()?.nativeElement.querySelector<HTMLElement>(`[data-tier-key="${key}"]`) ?? null;
  }

  private setActiveCard(card: HTMLElement): void {
    this.clearActiveCard();
    this.activeCard = card;
    this.onTransitionEnd = () => this.clearActiveCard();
    card.addEventListener('transitionend', this.onTransitionEnd);
  }

  private clearActiveCard(): void {
    if (this.flipTimeout) {
      clearTimeout(this.flipTimeout);
      this.flipTimeout = undefined;
    }
    if (this.activeCard && this.onTransitionEnd) {
      this.activeCard.removeEventListener('transitionend', this.onTransitionEnd);
    }
    if (this.activeCard) {
      const card = this.activeCard;
      card.style.transition = '';
      card.style.transform = '';
      card.style.willChange = '';
      card.style.opacity = '';
    }
    this.activeCard = null;
    this.onTransitionEnd = undefined;
  }

  private prefersReducedMotion(): boolean {
    return isPlatformBrowser(this.platformId) && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
