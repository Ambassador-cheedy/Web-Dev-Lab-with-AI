'use client';

import type { BagLine } from '@/lib/store/bag';
import type { CheckoutResponse } from './types';

export const PENDING_ORDER_KEY = 'obioma-pending-order';

export async function startCheckout(lines: BagLine[]) {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: lines.map((l) => ({
        productId: l.productId,
        colour: l.colour,
        size: l.size,
        quantity: l.quantity,
        madeToMeasure: l.madeToMeasure,
      })),
    }),
  });
  const data = (await res.json()) as CheckoutResponse;
  if ('error' in data) throw new Error(data.error);
  try {
    sessionStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(lines));
  } catch {
    // Storage may be unavailable (private mode); the order history is a nicety.
  }
  window.location.assign(data.url);
}
