/**
 * Development environment.
 * The API is served by the LasChubys BFF (NestJS) proxied via /api.
 */
export const environment = {
  production: false,
  apiUrl: '/api',
  siteUrl: 'http://localhost:4322',
  // Pre-launch mode: false in dev so the real site stays visible.
  underConstruction: false,
};
