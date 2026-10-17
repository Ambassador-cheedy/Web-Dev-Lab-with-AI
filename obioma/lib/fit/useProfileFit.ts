'use client';

import { useMemo } from 'react';
import type { Product } from '@/lib/catalog/types';
import { useActiveProfile } from '@/lib/store/measurements';
import { useHydrated } from '@/lib/store/hydration';
import { evaluateFit } from './engine';

/** Fit report for the active saved profile, or null when there is no profile or the piece isn't fit-enabled. */
export function useProfileFit(product: Product) {
  const hydrated = useHydrated();
  const profile = useActiveProfile();
  const report = useMemo(
    () =>
      hydrated && profile && product.fitStudio.enabled
        ? evaluateFit(profile, product.fitStudio)
        : null,
    [hydrated, profile, product],
  );
  return { profile: hydrated ? profile : null, report };
}
