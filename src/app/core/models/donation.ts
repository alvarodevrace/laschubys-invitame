/**
 * Domain models for the collaboration ("Invítame un Churu") flow.
 * Contracts mirror the BFF `donations` module (PayPal gateway, Sprint 2).
 */

export const TIERS = {
  CROQUETA: 'croqueta',
  CHURU: 'churu',
  SALMON: 'salmon',
} as const;

export type TierKey = (typeof TIERS)[keyof typeof TIERS];

/** Amounts are fixed server-side; this map mirrors the BFF for display only. */
export const TIER_PRICES: Record<TierKey, number> = {
  croqueta: 5,
  churu: 10,
  salmon: 15,
};

export interface Tier {
  key: TierKey;
  name: string;
  priceUsd: number;
  description: string;
  image: string;
}

export interface CreateOrderRequest {
  tier: TierKey;
}

/** Response from `POST /api/donations/paypal/create-order`. */
export interface CreateOrderResponse {
  orderId: string;
  approvalUrl: string;
}

export interface CaptureRequest {
  orderId: string;
  donorName: string;
  message: string;
}

/** Response from `POST /api/donations/paypal/capture`. */
export interface CaptureResponse {
  status: 'COMPLETED';
  donationId: string;
}

/**
 * Pending collaboration stashed in `sessionStorage` between the create-order
 * step and the PayPal return redirect. It carries the data needed to capture
 * the order once the payer returns to the app.
 */
export interface PendingCollaboration {
  orderId: string;
  donorName: string;
  message: string;
  tier: TierKey;
  createdAt: number;
}

export interface PublicDonation {
  id: string;
  tier: TierKey;
  amountUsd: number;
  currency: string;
  donorName: string | null;
  message: string | null;
  createdAt: string;
}

/**
 * Raw response shape from `GET /api/donations/public` (BFF contract).
 * The BFF returns `{ items, page, total }` and takes `page` + `limit` params.
 */
export interface PublicDonationsResponse {
  items: PublicDonation[];
  page: number;
  total: number;
}
