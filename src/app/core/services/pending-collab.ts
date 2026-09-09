import type { PendingCollaboration, TierKey } from '../models/donation';
import { TIERS } from '../models/donation';

/**
 * Browser-only helpers around the pending collaboration stored in
 * `sessionStorage` between the create-order step and the PayPal return.
 *
 * All functions are safe to call on the server (they no-op when `window` is
 * unavailable) so the SSR bundle never touches browser storage.
 */

export const PENDING_COLLAB_KEY = 'invitame_pending_collab';

const VALID_TIERS: readonly string[] = Object.values(TIERS);

function isTierKey(value: unknown): value is TierKey {
  return typeof value === 'string' && VALID_TIERS.includes(value);
}

function isPendingCollab(value: unknown): value is PendingCollaboration {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record['orderId'] === 'string' &&
    typeof record['donorName'] === 'string' &&
    typeof record['message'] === 'string' &&
    isTierKey(record['tier']) &&
    typeof record['createdAt'] === 'number'
  );
}

/** Persists the pending collaboration. No-op on the server. */
export function savePendingCollab(collab: PendingCollaboration): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(PENDING_COLLAB_KEY, JSON.stringify(collab));
}

/** Reads and validates the pending collaboration, or `null`. */
export function readPendingCollab(): PendingCollaboration | null {
  if (typeof window === 'undefined') return null;
  const raw = window.sessionStorage.getItem(PENDING_COLLAB_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isPendingCollab(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Removes the pending collaboration. No-op on the server. */
export function clearPendingCollab(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(PENDING_COLLAB_KEY);
}
