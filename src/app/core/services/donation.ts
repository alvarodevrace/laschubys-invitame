import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { savePendingCollab } from './pending-collab';
import type {
  CaptureRequest,
  CaptureResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  PublicDonationsResponse,
  TierKey,
} from '../models/donation';

const READ_TIMEOUT = 10_000;
const MUTATION_TIMEOUT = 15_000;

function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms));
}

/**
 * Client for the BFF `donations` module.
 * All endpoints are proxied via `/api` (see proxy.conf.json).
 */
@Injectable({ providedIn: 'root' })
export class DonationService {
  private readonly http = inject(HttpClient);

  /** Creates a pending PayPal order for a tier (amount is fixed server-side). */
  async createOrder(tier: TierKey): Promise<CreateOrderResponse> {
    const body: CreateOrderRequest = { tier };
    return firstValueFrom(
      this.http.post<CreateOrderResponse>(
        `${environment.apiUrl}/donations/paypal/create-order`,
        body,
      ),
    );
  }

  /** Captures an approved PayPal order and records the donor name + message. */
  async capture(orderId: string, donorName: string, message: string): Promise<CaptureResponse> {
    const body: CaptureRequest = { orderId, donorName, message };
    return firstValueFrom(
      this.http.post<CaptureResponse>(`${environment.apiUrl}/donations/paypal/capture`, body),
    );
  }

  /** Fetches the public "collaborators" wall, paginated. */
  async getPublic(page = 1, pageSize = 12): Promise<PublicDonationsResponse> {
    return firstValueFrom(
      this.http.get<PublicDonationsResponse>(
        `${environment.apiUrl}/donations/public?page=${page}&limit=${pageSize}`,
      ),
    );
  }

  /**
   * Starts the real PayPal redirect flow: creates an order, stashes the pending
   * collaboration in `sessionStorage`, then redirects the browser to the PayPal
   * approval page. Returns `true` once the redirect has been initiated.
   *
   * Browser-only (`sessionStorage` + `window.location`). The caller must wrap
   * this in the mutation idempotency guard (button disabled while saving).
   */
  async startPayPalFlow(tier: TierKey, donorName: string, message: string): Promise<boolean> {
    const order = await Promise.race([this.createOrder(tier), timeout(MUTATION_TIMEOUT)]);
    if (!order.approvalUrl) {
      throw new Error('PayPal order did not return an approval URL');
    }
    savePendingCollab({
      orderId: order.orderId,
      donorName,
      message,
      tier,
      createdAt: Date.now(),
    });
    if (typeof window === 'undefined') {
      throw new Error('startPayPalFlow only runs in the browser');
    }
    window.location.href = order.approvalUrl;
    return true;
  }

  /** Fetches the wall with a read timeout. */
  async fetchPublic(page = 1, pageSize = 12): Promise<PublicDonationsResponse> {
    return Promise.race([this.getPublic(page, pageSize), timeout(READ_TIMEOUT)]);
  }
}
