import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideAlertTriangle, lucideCat, lucideHeart } from '@ng-icons/lucide';

import { DonationService } from '../../core/services/donation';
import { clearPendingCollab, readPendingCollab } from '../../core/services/pending-collab';
import { ScrollRevealDirective, TextRevealDirective } from '../../shared/animations';
import { TIER_PRICES } from '../../core/models/donation';
import type { PendingCollaboration } from '../../core/models/donation';

type GraciasStatus = 'idle' | 'processing' | 'confirmed' | 'error';

const CAPTURE_TIMEOUT_MS = 15_000;

/**
 * Thank-you page. In the PayPal redirect flow this is the `return_url`, so it
 * can receive a `?token=<orderId>` query param after the payer approves. It
 * then captures the approved order and confirms the collaboration. Without a
 * token it keeps the original static thank-you content.
 *
 * SSR-safe: all sessionStorage + capture work runs client-side in
 * `afterNextRender`.
 */
@Component({
  selector: 'app-gracias',
  standalone: true,
  imports: [RouterLink, NgIcon, ScrollRevealDirective, TextRevealDirective],
  providers: [provideIcons({ lucideAlertTriangle, lucideCat, lucideHeart })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bg-surface min-h-[60vh] flex items-center justify-center">
      <div class="max-w-2xl mx-auto px-4 py-16 text-center">
        @switch (status()) {
          @case ('processing') {
            <div class="mb-6 flex justify-center">
              <div class="w-20 h-20 rounded-full bg-primary/10 grid place-items-center">
                <span
                  class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"
                  aria-hidden="true"
                ></span>
              </div>
            </div>
            <h1 class="text-h1 md:text-h2 font-extrabold uppercase tracking-widest text-foreground mb-4">
              Confirmando tu colaboración...
            </h1>
            <p class="text-body text-muted-foreground mb-8" appScrollReveal [y]="24">
              Estamos verificando tu pago con PayPal. Esto toma unos segundos.
            </p>
          }

          @case ('confirmed') {
            <div class="mb-6 flex justify-center">
              <div class="w-20 h-20 rounded-full bg-primary/10 grid place-items-center">
                <ng-icon name="lucideHeart" class="w-10 h-10 text-primary" />
              </div>
            </div>
            <h1
              class="text-h1 md:text-h2 font-extrabold uppercase tracking-widest text-foreground mb-4"
            >
              <span appTextReveal splitBy="word" [duration]="0.5" [staggerDelay]="0.08">
                ¡Gracias por tu colaboración!
              </span>
            </h1>
            <p class="text-body text-muted-foreground mb-8" appScrollReveal [y]="24">
              @if (confirmed()?.donorName) {
                <strong>{{ confirmed()!.donorName }}</strong>,
              }
              tu regalo llega a Iris y Rubí, y tu mensaje ya está en camino al muro
              de colaboradores. Las chubys te lo agradecen con ronroneos.
              @if (confirmed(); as c) {
                <span class="block mt-3 text-sm font-extrabold text-primary uppercase tracking-wider">
                  {{ tierLabel(c.tier) }} · \${{ TIER_PRICES[c.tier] }} USD
                </span>
              }
            </p>
            <a
              routerLink="/"
              class="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-4 font-bold text-lg transition-all ease-bounce hover:bg-primary/80 hover:-translate-y-1 hover:shadow-xl"
            >
              <ng-icon name="lucideCat" class="w-5 h-5" />
              Volver a la página
            </a>
          }

          @case ('error') {
            <div class="mb-6 flex justify-center">
              <div class="w-20 h-20 rounded-full bg-destructive/10 grid place-items-center">
                <ng-icon name="lucideAlertTriangle" class="w-10 h-10 text-destructive" />
              </div>
            </div>
            <h1 class="text-h1 md:text-h2 font-extrabold uppercase tracking-widest text-foreground mb-4">
              No pudimos confirmar tu colaboración
            </h1>
            <p class="text-body text-muted-foreground mb-8" appScrollReveal [y]="24">
              {{ errorMessage() }} Si el cobro se realizó, escríbenos y lo resolvemos.
            </p>
            <a
              routerLink="/"
              class="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-4 font-bold text-lg transition-all ease-bounce hover:bg-primary/80 hover:-translate-y-1 hover:shadow-xl"
            >
              <ng-icon name="lucideCat" class="w-5 h-5" />
              Volver a la página
            </a>
          }

          @default {
            <div class="mb-6 flex justify-center">
              <div class="w-20 h-20 rounded-full bg-primary/10 grid place-items-center">
                <ng-icon name="lucideHeart" class="w-10 h-10 text-primary" />
              </div>
            </div>

            <h1
              class="text-h1 md:text-h2 font-extrabold uppercase tracking-widest text-foreground mb-4"
            >
              <span appTextReveal splitBy="word" [duration]="0.5" [staggerDelay]="0.08">
                ¡Gracias por tu colaboración!
              </span>
            </h1>

            <p class="text-body text-muted-foreground mb-8" appScrollReveal [y]="24">
              Tu regalo llega a Iris y Rubí, y tu mensaje ya está en camino al muro de
              colaboradores. Las chubys te lo agradecen con ronroneos.
            </p>

            <a
              routerLink="/"
              class="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-4 font-bold text-lg transition-all ease-bounce hover:bg-primary/80 hover:-translate-y-1 hover:shadow-xl"
            >
              <ng-icon name="lucideCat" class="w-5 h-5" />
              Volver a la página
            </a>
          }
        }
      </div>
    </section>
  `,
})
export class GraciasComponent {
  protected readonly TIER_PRICES = TIER_PRICES;

  private readonly route = inject(ActivatedRoute);
  private readonly donation = inject(DonationService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly status = signal<GraciasStatus>('idle');
  protected readonly confirmed = signal<PendingCollaboration | null>(null);
  protected readonly errorMessage = signal('No pudimos confirmar tu colaboración.');

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      void this.confirmIfNeeded();
    });
  }

  protected tierLabel(tier: string): string {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  }

  /** BFF calls must not hang forever: race the promise against a timeout. */
  private withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms)),
    ]);
  }

  /**
   * On the PayPal return (`?token=<orderId>`), captures the approved order using
   * the pending collaboration stashed in sessionStorage. Without a token, keeps
   * the static thank-you content.
   */
  private async confirmIfNeeded(): Promise<void> {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.status.set('idle');
      return;
    }

    const pending = readPendingCollab();
    if (!pending || pending.orderId !== token) {
      this.status.set('error');
      this.errorMessage.set('No pudimos confirmar tu colaboración.');
      return;
    }

    this.status.set('processing');
    try {
      const result = await this.withTimeout(
        this.donation.capture(token, pending.donorName, pending.message),
        CAPTURE_TIMEOUT_MS,
      );
      if (result.status === 'COMPLETED') {
        clearPendingCollab();
        this.confirmed.set(pending);
        this.status.set('confirmed');
      } else {
        this.status.set('error');
        this.errorMessage.set('No pudimos confirmar tu colaboración.');
      }
    } catch {
      // Leave the pending collaboration intact so a retry (reload) can still work.
      this.status.set('error');
      this.errorMessage.set('No pudimos confirmar tu colaboración.');
    }
  }
}
