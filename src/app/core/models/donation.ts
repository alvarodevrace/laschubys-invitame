/**
 * Domain models for the collaboration ("Invítame un Churu") flow.
 * Contracts mirror the BFF `donations` module (MockGateway in Sprint 1).
 */

export const TIERS = {
  CROQUETA: 'croqueta',
  CHURU: 'churu',
  SALMON: 'salmon',
} as const;

export type TierKey = (typeof TIERS)[keyof typeof TIERS];

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

export interface CreateOrderResponse {
  orderId: string;
}

export interface CaptureRequest {
  orderId: string;
  donorName: string;
  message: string;
}

export interface CaptureResponse {
  status: 'COMPLETED';
  donationId: string;
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
