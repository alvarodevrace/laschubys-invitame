import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing').then((m) => m.LandingComponent),
  },
  {
    path: 'gracias',
    loadComponent: () => import('./features/gracias/gracias').then((m) => m.GraciasComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
