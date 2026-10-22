import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const TRUSTED_FORWARDED_HEADERS: ReadonlySet<string> = new Set([
  'x-forwarded-host',
  'x-forwarded-proto',
]);

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Angular's Node app engine only trusts `x-forwarded-host` and `x-forwarded-proto`
 * by default. Any other `x-forwarded-*` header (Traefik also sends
 * `x-forwarded-for`, `x-forwarded-port` and `x-forwarded-server`) makes the engine
 * downgrade the whole request to CSR, so strip the untrusted ones before rendering.
 */
function stripUntrustedForwardedHeaders(req: express.Request): void {
  for (const header of Object.keys(req.headers)) {
    if (
      header.startsWith('x-forwarded-') &&
      !TRUSTED_FORWARDED_HEADERS.has(header)
    ) {
      delete req.headers[header];
    }
  }
}

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  stripUntrustedForwardedHeaders(req);

  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
