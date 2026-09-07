import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
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

  /** Creates a pending order for a tier (amount is fixed server-side). */
  async createOrder(tier: TierKey): Promise<CreateOrderResponse> {
    const body: CreateOrderRequest = { tier };
    return firstValueFrom(
      this.http.post<CreateOrderResponse>(`${environment.apiUrl}/donations/mock/create-order`, body),
    );
  }

  /** Captures the simulated payment and records the donor name + message. */
  async capture(orderId: string, donorName: string, message: string): Promise<CaptureResponse> {
    const body: CaptureRequest = { orderId, donorName, message };
    return firstValueFrom(
      this.http.post<CaptureResponse>(`${environment.apiUrl}/donations/mock/capture`, body),
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
   * Runs the full create-order + capture flow with a timeout and single-flight
   * semantics (the caller is responsible for the idempotency guard).
   */
  async createCollaboration(
    tier: TierKey,
    donorName: string,
    message: string,
  ): Promise<CaptureResponse> {
    const order = await Promise.race([this.createOrder(tier), timeout(MUTATION_TIMEOUT)]);
    return Promise.race([this.capture(order.orderId, donorName, message), timeout(MUTATION_TIMEOUT)]);
  }

  /** Fetches the wall with a read timeout. */
  async fetchPublic(page = 1, pageSize = 12): Promise<PublicDonationsResponse> {
    return Promise.race([this.getPublic(page, pageSize), timeout(READ_TIMEOUT)]);
  }
}
