import { HttpInterceptorFn } from '@angular/common/http';

const CSRF_COOKIE_NAME = 'csrf-token';

/**
 * Reads a cookie value from `document.cookie` (client-side only).
 * Returns `undefined` on the server where `document` is not available.
 */
function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=')[1] ?? '') : undefined;
}

/**
 * CSRF double-submit cookie interceptor.
 *
 * The BFF uses the double-submit-cookie pattern: it sets a non-HttpOnly
 * `csrf-token` cookie and requires the same value in the `X-CSRF-Token`
 * header for non-idempotent (POST/PUT/PATCH/DELETE) requests.
 *
 * - Sends cookies on every request (`withCredentials: true`).
 * - Adds the `X-CSRF-Token` header from the cookie for mutating methods.
 */
export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const method = req.method.toUpperCase();
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];

  const isMutation = !safeMethods.includes(method);
  const token = isMutation ? readCookie(CSRF_COOKIE_NAME) : undefined;

  let headers = req.headers;
  if (token) {
    headers = headers.set('X-CSRF-Token', token);
  }

  const cloned = req.clone({
    withCredentials: true,
    headers,
  });

  return next(cloned);
};
