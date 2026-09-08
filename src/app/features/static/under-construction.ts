import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideConstruction } from '@ng-icons/lucide';

/**
 * Pre-launch placeholder shown in production until the app is ready.
 * Replicates LasChubys-Front's under-construction screen using NgIcon
 * (this app does not use Spartan NG, so icons come from @ng-icons/core).
 */
@Component({
  selector: 'app-under-construction',
  standalone: true,
  imports: [NgIcon],
  providers: [provideIcons({ lucideConstruction })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main
      class="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center"
      aria-labelledby="uc-title"
    >
      <ng-icon
        name="lucideConstruction"
        class="size-40 md:size-56 text-primary mb-8"
        aria-hidden="true"
      />
      <h1 id="uc-title" class="text-4xl md:text-6xl font-extrabold text-foreground mb-4">
        En construcción
      </h1>
      <p class="text-lg md:text-xl text-muted-foreground max-w-md">
        Estamos preparando algo especial. Volvemos pronto.
      </p>
    </main>
  `,
})
export class UnderConstructionComponent {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  constructor() {
    this.title.setTitle('En construcción | Invítame un Churu');
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
  }
}
