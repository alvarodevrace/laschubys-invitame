import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { DonationService } from '../../../core/services/donation';
import type { Tier } from '../../../core/models/donation';

const MAX_MESSAGE_LENGTH = 200;

/**
 * Collaboration modal: optional donor name + optional message (max 200 chars)
 * and a "Colaborar" button protected by an idempotency guard (no double submit).
 */
@Component({
  selector: 'app-collaboration-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      (click)="onOverlayClick($event)"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="'Colaborar con ' + tier().name"
    >
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div class="p-6">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-1">
                Colaboración
              </p>
              <h2 class="text-2xl font-black leading-tight text-foreground">
                Invita {{ tier().name }}
              </h2>
              <p class="text-xl font-extrabold text-primary mt-1">\${{ tier().priceUsd }} USD</p>
            </div>
            <button
              type="button"
              (click)="close()"
              class="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" class="mt-5 space-y-4">
            <div>
              <label for="donor-name" class="block text-sm font-semibold text-foreground mb-1">
                Tu nombre <span class="text-muted-foreground">(opcional)</span>
              </label>
              <input
                id="donor-name"
                type="text"
                formControlName="donorName"
                maxlength="60"
                placeholder="Cómo te llamas"
                class="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label for="message" class="block text-sm font-semibold text-foreground mb-1">
                Mensaje <span class="text-muted-foreground">(opcional)</span>
              </label>
              <textarea
                id="message"
                formControlName="message"
                maxlength="200"
                rows="3"
                placeholder="Unas palabras para las chubys"
                class="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              ></textarea>
              <p class="text-xs text-muted-foreground text-right mt-1">
                {{ messageLength() }}/{{ maxMessageLength }}
              </p>
            </div>

            @if (error()) {
              <p class="text-sm font-semibold text-destructive" role="alert">{{ error() }}</p>
            }

            <button
              type="submit"
              [disabled]="saving()"
              class="w-full rounded-full bg-primary text-primary-foreground py-3 font-bold text-lg transition-all ease-bounce hover:bg-primary/80 active:translate-y-[2px] active:shadow-none disabled:opacity-60"
            >
              {{ saving() ? 'Procesando...' : 'Colaborar' }}
            </button>
            <button
              type="button"
              (click)="close()"
              class="w-full rounded-full py-2 font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class CollaborationModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly donation = inject(DonationService);
  private readonly router = inject(Router);

  readonly tier = input.required<Tier>();
  readonly closed = output<void>();

  protected readonly maxMessageLength = MAX_MESSAGE_LENGTH;
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    donorName: [''],
    message: ['', [Validators.maxLength(MAX_MESSAGE_LENGTH)]],
  });

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
      await this.donation.createCollaboration(this.tier().key, donorName.trim(), message.trim());
      this.closed.emit();
      await this.router.navigate(['/gracias']);
    } catch {
      this.error.set('No pudimos procesar tu colaboración. Intenta de nuevo.');
    } finally {
      this.saving.set(false);
    }
  }

  protected onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  protected close(): void {
    this.closed.emit();
  }
}
