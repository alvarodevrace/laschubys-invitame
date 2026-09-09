import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { DonationService } from '../../../core/services/donation';
import { tierColor as tierColorFor } from '../../../shared/ui/tier-visuals';
import type { Tier } from '../../../core/models/donation';

const MAX_MESSAGE_LENGTH = 200;

/**
 * Inline collaboration form panel (replaces the old modal).
 * Optional donor name + optional message (max 200 chars) and a "Colaborar"
 * button protected by an idempotency guard (no double submit).
 * Rendered as a grid sibling of the selected tier card (no overlay/modal).
 */
@Component({
  selector: 'app-collaboration-panel',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form
      [formGroup]="form"
      (ngSubmit)="submit()"
      class="relative flex h-full flex-col overflow-hidden rounded-[2.5rem] bg-white shadow-xl animate-panel-in"
      [attr.aria-label]="'Colaborar con ' + tier().name"
    >
      <div class="h-2 w-full" [style.background]="accent()"></div>

      <div class="flex flex-1 flex-col p-6">
        <div>
          <p class="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-1">
            Colaboración
          </p>
          <h3 class="text-2xl font-black leading-tight text-foreground">
            Invita {{ tier().name }}
          </h3>
          <p class="text-xl font-extrabold mt-1" [style.color]="accent()">\${{ tier().priceUsd }} USD</p>
        </div>

        <div class="mt-5 flex-1 space-y-4">
          <div>
            <label for="collab-donor-name" class="block text-sm font-semibold text-foreground mb-1">
              Tu nombre <span class="text-muted-foreground">(opcional)</span>
            </label>
            <input
              #nameInput
              id="collab-donor-name"
              type="text"
              formControlName="donorName"
              maxlength="60"
              placeholder="Cómo te llamas"
              class="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label for="collab-message" class="block text-sm font-semibold text-foreground mb-1">
              Mensaje <span class="text-muted-foreground">(opcional)</span>
            </label>
            <textarea
              id="collab-message"
              formControlName="message"
              maxlength="200"
              rows="4"
              placeholder="Unas palabras para las chubys"
              class="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            ></textarea>
            <p class="text-xs text-muted-foreground text-right mt-1">
              {{ messageLength() }}/{{ maxMessageLength }}
            </p>
          </div>

          @if (error()) {
            <p class="text-sm font-semibold text-destructive" role="alert" aria-live="polite">
              {{ error() }}
            </p>
          }
        </div>

        <div class="mt-5 space-y-3">
          <button
            type="submit"
            [disabled]="saving()"
            class="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground py-3 font-bold text-lg transition-all ease-bounce hover:bg-primary/80 active:translate-y-[2px] active:shadow-none disabled:opacity-60"
          >
            @if (saving()) {
              <span
                class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                aria-hidden="true"
              ></span>
              Te llevamos a PayPal...
            } @else {
              Colaborar
            }
          </button>
          <button
            type="button"
            (click)="cancel()"
            class="w-full rounded-full py-2 font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </form>
  `,
})
export class CollaborationPanelComponent {
  private readonly fb = inject(FormBuilder);
  private readonly donation = inject(DonationService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly tier = input.required<Tier>();
  readonly cancelled = output<void>();

  protected readonly maxMessageLength = MAX_MESSAGE_LENGTH;
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  /** Tier accent used on the tier name/price and the top strip. */
  protected readonly accent = computed(() => tierColorFor(this.tier().key).accent);

  private readonly nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');

  readonly form = this.fb.nonNullable.group({
    donorName: [''],
    message: ['', [Validators.maxLength(MAX_MESSAGE_LENGTH)]],
  });

  constructor() {
    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.nameInput()?.nativeElement.focus();
      }
    });
  }

  protected messageLength(): number {
    return this.form.controls.message.value.length;
  }

  async submit(): Promise<void> {
    if (this.saving()) return;
    if (this.form.invalid) {
      this.error.set('El mensaje es demasiado largo.');
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    try {
      const { donorName, message } = this.form.getRawValue();
      const redirected = await this.donation.startPayPalFlow(
        this.tier().key,
        donorName.trim(),
        message.trim(),
      );
      // If the browser is navigating to PayPal, keep the button disabled until
      // the page unloads so a double-click can't submit twice. Only reset the
      // guard on the failure path (when the redirect was NOT initiated).
      if (!redirected) {
        this.error.set('No pudimos iniciar el pago con PayPal. Intenta de nuevo.');
        this.saving.set(false);
      }
    } catch {
      this.error.set('No pudimos iniciar el pago con PayPal. Intenta de nuevo.');
      this.saving.set(false);
    }
  }

  protected cancel(): void {
    this.cancelled.emit();
  }
}
