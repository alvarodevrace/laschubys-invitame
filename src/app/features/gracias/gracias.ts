import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCat, lucideHeart } from '@ng-icons/lucide';

import { ScrollRevealDirective, TextRevealDirective } from '../../shared/animations';

/**
 * Thank-you page shown after a successful collaboration.
 */
@Component({
  selector: 'app-gracias',
  standalone: true,
  imports: [RouterLink, NgIcon, ScrollRevealDirective, TextRevealDirective],
  providers: [provideIcons({ lucideCat, lucideHeart })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bg-surface min-h-[60vh] flex items-center justify-center">
      <div class="max-w-2xl mx-auto px-4 py-16 text-center">
        <div class="mb-6 flex justify-center">
          <div
            class="w-20 h-20 rounded-full bg-primary/10 grid place-items-center"
          >
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
      </div>
    </section>
  `,
})
export class GraciasComponent {}
