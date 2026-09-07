import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideCat,
  lucideHeart,
  lucideHeartHandshake,
} from '@ng-icons/lucide';

import type { Tier } from '../../core/models/donation';
import { tierColor as tierColorFor } from '../../shared/ui/tier-visuals';
import {
  ParallaxDirective,
  ScrollRevealDirective,
  StaggerChildrenDirective,
  TextRevealDirective,
} from '../../shared/animations';
import { WallComponent } from './components/wall';
import { CollaborationModalComponent } from './components/collaboration-modal';

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
    CollaborationModalComponent,
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
          class="grid grid-cols-1 md:grid-cols-3 gap-6"
          appStaggerChildren
          childSelector="article"
          [staggerDelay]="0.1"
          [y]="30"
          [duration]="0.5"
        >
          @for (tier of tiers; track tier.key) {
            <article
              class="group relative block h-full rounded-[2.5rem] overflow-hidden transition-all duration-500 ease-bounce hover:-translate-y-3 hover:scale-[1.02] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.2)]"
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
                  (click)="openModal(tier)"
                  class="mt-4 w-full rounded-full bg-primary text-primary-foreground py-3 font-bold text-lg transition-all ease-bounce hover:bg-primary/80 active:translate-y-[2px]"
                >
                  Colaborar
                </button>
              </div>
            </article>
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

    <!-- Collaboration modal -->
    @if (selectedTier()) {
      <app-collaboration-modal
        [tier]="selectedTier()!"
        (closed)="closeModal()"
      />
    }
  `,
})
export class LandingComponent {
  readonly tiers: readonly Tier[] = TIER_LIST;

  protected readonly tierColor = tierColorFor;

  protected readonly selectedTier = signal<Tier | null>(null);

  protected openModal(tier: Tier): void {
    this.selectedTier.set(tier);
  }

  protected closeModal(): void {
    this.selectedTier.set(null);
  }
}
