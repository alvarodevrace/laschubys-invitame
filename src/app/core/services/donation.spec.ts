import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { DonationService } from './donation';

describe('DonationService', () => {
  let service: DonationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DonationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('creates a PayPal order and returns orderId + approvalUrl', async () => {
    const promise = service.createOrder('churu');
    const req = httpMock.expectOne('/api/donations/paypal/create-order');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ tier: 'churu' });
    req.flush({
      orderId: 'ORDER-1',
      approvalUrl: 'https://paypal.test/checkoutnow?token=ORDER-1',
    });

    const result = await promise;
    expect(result).toEqual({
      orderId: 'ORDER-1',
      approvalUrl: 'https://paypal.test/checkoutnow?token=ORDER-1',
    });
  });

  it('captures an approved PayPal order', async () => {
    const promise = service.capture('ORDER-1', 'Ana', 'Hola');
    const req = httpMock.expectOne('/api/donations/paypal/capture');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ orderId: 'ORDER-1', donorName: 'Ana', message: 'Hola' });
    req.flush({ status: 'COMPLETED', donationId: 'DON-1' });

    const result = await promise;
    expect(result).toEqual({ status: 'COMPLETED', donationId: 'DON-1' });
  });

  it('throws when the order has no approval URL', async () => {
    const promise = service.startPayPalFlow('churu', 'Ana', 'Hola');
    const req = httpMock.expectOne('/api/donations/paypal/create-order');
    req.flush({ orderId: 'ORDER-1', approvalUrl: '' });

    await expect(promise).rejects.toThrow('PayPal order did not return an approval URL');
  });
});
