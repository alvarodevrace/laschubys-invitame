import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { environment } from '../environments/environment';
import { UnderConstructionComponent } from './features/static/under-construction';

/**
 * Root shell for the standalone "Invítame un Churu" app.
 * Header + footer follow the Las Chubys design system (see Design-System.md §10),
 * kept intentionally simple for the standalone collaboration page.
 *
 * In production (environment.underConstruction) the whole shell is replaced by the
 * under-construction screen — same gating as LasChubys-Front.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, UnderConstructionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col min-h-screen' },
  template: `
    @if (underConstruction) {
      <app-under-construction />
    } @else {
      <header
        class="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl"
      >
        <div class="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <a routerLink="/" class="flex items-center gap-2" aria-label="Invitame un Churu">
            <img src="/brand/logoLasChubys.png" alt="Las Chubys" class="h-14 w-auto" />
          </a>
          <nav class="flex items-center gap-4">
            <a
              routerLink="/"
              class="text-base font-semibold text-muted-foreground hover:text-primary transition-colors"
            >
              Colaborar
            </a>
            <a
              routerLink="/gracias"
              class="text-base font-semibold text-muted-foreground hover:text-primary transition-colors"
            >
              Gracias
            </a>
          </nav>
        </div>
      </header>

      <main class="flex-1">
        <router-outlet />
      </main>

      <footer class="bg-white border-t border-border">
        <div class="max-w-6xl mx-auto px-4 py-10">
          <div class="flex flex-col md:flex-row items-center justify-between gap-4">
            <img src="/brand/logoLasChubys.png" alt="Las Chubys" class="h-12 w-auto" />
            <p class="text-sm text-muted-foreground">
              Con tu colaboración, Iris y Rubí siguen creando contenido felino.
            </p>
          </div>
          <div class="mt-6 pt-6 border-t border-border text-center">
            <p class="text-xs text-muted-foreground">
              © 2026 Las Chubys · Hecho con cariño para las chubys.
            </p>
          </div>
        </div>
      </footer>
    }
  `,
})
export class App {
  /** Build-time flag: true in production swaps the whole shell for the placeholder. */
  readonly underConstruction = environment.underConstruction;
}
