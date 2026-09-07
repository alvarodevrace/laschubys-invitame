import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideHeartHandshake } from '@ng-icons/lucide';

import { DonationService } from '../../../core/services/donation';
import { StaggerChildrenDirective, TextRevealDirective } from '../../../shared/animations';
import type { PublicDonation } from '../../../core/models/donation';

const PAGE_SIZE = 12;

/**
 * Public "collaborators" wall.
 * SSR-safe: the server renders the shell; data is fetched client-side
 * (so the page always returns 200 even if the BFF is unavailable).
 */
@Component({
  selector: 'app-wall',
  standalone: true,
  imports: [NgIcon, StaggerChildrenDirective, TextRevealDirective],
  providers: [provideIcons({ lucideHeartHandshake })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative">
      <div class="text-center mb-10">
        <h2
          class="text-h2 font-extrabold uppercase tracking-widest text-foreground mb-2 flex items-center justify-center gap-1.5"
        >
          <ng-icon name="lucideHeartHandshake" class="w-5 h-5 md:w-6 md:h-6" />
          <span appTextReveal splitBy="word" [duration]="0.5" [staggerDelay]="0.08">
            Nuestros colaboradores
          </span>
        </h2>
        <p class="text-base md:text-lg font-bold text-muted-foreground">
          Gracias a quienes hacen posible el universo Chuby
        </p>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (i of [1, 2, 3, 4, 5, 6]; track i) {
            <div class="rounded-[2.5rem] bg-white p-6 h-40 animate-pulse"></div>
          }
        </div>
      } @else if (error()) {
        <div class="text-center py-10">
          <p class="text-body font-semibold text-muted-foreground mb-4">{{ error() }}</p>
          <button
            type="button"
            (click)="retry()"
            class="rounded-full bg-primary text-primary-foreground px-6 py-2 font-bold transition-colors hover:bg-primary/80"
          >
            Reintentar
          </button>
        </div>
      } @else if (items().length === 0) {
        <div class="text-center py-10">
          <p class="text-body font-semibold text-muted-foreground">
            Aún no hay colaboradores. ¡Sé el primero!
          </p>
        </div>
      } @else {
        <div
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          appStaggerChildren
          childSelector="article"
          [staggerDelay]="0.08"
          [duration]="0.5"
          [y]="20"
        >
          @for (item of items(); track item.id) {
            <article
              class="group relative overflow-hidden rounded-[2.5rem] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl p-6 flex flex-col gap-3"
            >
              <div class="flex items-center gap-3">
                <span
                  class="w-12 h-12 rounded-full grid place-items-center text-lg font-extrabold text-white"
                  [style.background]="avatarColor(item.donorName)"
                >
                  {{ avatarLetter(item.donorName) }}
                </span>
                <div>
                  <p class="font-bold text-foreground">{{ item.donorName || 'Colaborador' }}</p>
                  <p class="text-xs font-semibold text-primary uppercase tracking-wider">
                    {{ tierLabel(item.tier) }} · \${{ item.amountUsd }} USD
                  </p>
                </div>
              </div>
              @if (item.message) {
                <p class="text-body text-muted-foreground leading-relaxed">{{ item.message }}</p>
              }
            </article>
          }
        </div>

        @if (totalPages() > 1) {
          <div class="flex items-center justify-center gap-4 mt-10">
            <button
              type="button"
              [disabled]="page() <= 1"
              (click)="goToPage(page() - 1)"
              class="rounded-full border border-border px-4 py-2 font-semibold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
            >
              ← Anterior
            </button>
            <span class="text-base font-semibold text-muted-foreground">
              Página {{ page() }} de {{ totalPages() }}
            </span>
            <button
              type="button"
              [disabled]="page() >= totalPages()"
              (click)="goToPage(page() + 1)"
              class="rounded-full border border-border px-4 py-2 font-semibold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
            >
              Siguiente →
            </button>
          </div>
        }
      }
    </div>
  `,
})
export class WallComponent {
  private readonly donation = inject(DonationService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly items = signal<PublicDonation[]>([]);
  protected readonly page = signal(1);
  protected readonly totalPages = signal(1);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId)) {
        void this.load();
      }
    });
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const response = await this.donation.fetchPublic(this.page(), PAGE_SIZE);
      this.items.set(response.items);
      this.totalPages.set(Math.max(Math.ceil(response.total / PAGE_SIZE), 1));
    } catch {
      this.items.set([]);
      this.totalPages.set(1);
      this.error.set('No pudimos cargar el muro. Intenta de nuevo.');
    } finally {
      this.loading.set(false);
    }
  }

  protected retry(): void {
    void this.load();
  }

  protected goToPage(target: number): void {
    if (target < 1 || target > this.totalPages()) return;
    this.page.set(target);
    void this.load();
  }

  protected avatarLetter(name: string | null): string {
    return ((name ?? '').trim().charAt(0) || '?').toUpperCase();
  }

  protected avatarColor(name: string | null): string {
    const safe = name ?? '';
    const palette = [
      'var(--color-iris)',
      'var(--color-rubi)',
      'var(--color-human)',
      'var(--color-cga)',
    ];
    const idx = safe.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return palette[idx % palette.length];
  }

  protected tierLabel(tier: string): string {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  }
}
