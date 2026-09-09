import { beforeEach, describe, expect, it } from 'vitest';

import type { PendingCollaboration } from '../models/donation';
import {
  PENDING_COLLAB_KEY,
  clearPendingCollab,
  readPendingCollab,
  savePendingCollab,
} from './pending-collab';

describe('pending-collab (sessionStorage)', () => {
  const collab: PendingCollaboration = {
    orderId: 'ORDER-1',
    donorName: 'Ana',
    message: 'Hola chubys',
    tier: 'churu',
    createdAt: 1_700_000_000_000,
  };

  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('saves and reads a valid pending collaboration', () => {
    savePendingCollab(collab);
    expect(readPendingCollab()).toEqual(collab);
  });

  it('returns null when nothing is stored', () => {
    expect(readPendingCollab()).toBeNull();
  });

  it('clears the pending collaboration', () => {
    savePendingCollab(collab);
    clearPendingCollab();
    expect(readPendingCollab()).toBeNull();
  });

  it('returns null for malformed JSON', () => {
    window.sessionStorage.setItem(PENDING_COLLAB_KEY, 'not-json');
    expect(readPendingCollab()).toBeNull();
  });

  it('returns null when the payload shape is invalid', () => {
    window.sessionStorage.setItem(PENDING_COLLAB_KEY, JSON.stringify({ orderId: 1 }));
    expect(readPendingCollab()).toBeNull();
  });

  it('rejects an unknown tier value', () => {
    window.sessionStorage.setItem(
      PENDING_COLLAB_KEY,
      JSON.stringify({ ...collab, tier: 'pizza' }),
    );
    expect(readPendingCollab()).toBeNull();
  });

  it('writes the raw payload under the expected storage key', () => {
    savePendingCollab(collab);
    const raw = window.sessionStorage.getItem(PENDING_COLLAB_KEY);
    expect(raw).toBe(JSON.stringify(collab));
  });
});
