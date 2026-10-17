'use client';

import { useEffect } from 'react';
import { useBag } from '@/lib/store/bag';
import { useWishlist } from '@/lib/store/wishlist';
import { useMeasurements } from '@/lib/store/measurements';
import { useConsent } from '@/lib/store/consent';
import { useAuth } from '@/lib/auth';
import { useOrders } from '@/lib/store/orders';
import { useHydrationFlag } from '@/lib/store/hydration';

export function StoreHydrator() {
  useEffect(() => {
    Promise.all([
      useBag.persist.rehydrate(),
      useWishlist.persist.rehydrate(),
      useMeasurements.persist.rehydrate(),
      useConsent.persist.rehydrate(),
      useAuth.persist.rehydrate(),
      useOrders.persist.rehydrate(),
    ]).finally(() => useHydrationFlag.getState().set());
  }, []);
  return null;
}
