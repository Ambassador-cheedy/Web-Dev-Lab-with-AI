'use client';

import type { Product } from '@/lib/catalog/types';

/** Filled in during integration, once the fit engine exists. */
export function InlineFitSummary(_props: { product: Product; selectedSize: string | null; onPickSize: (s: string) => void }) {
  return null;
}
