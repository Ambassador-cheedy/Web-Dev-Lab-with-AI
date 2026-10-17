'use client';

import { useEffect, useRef } from 'react';
import { useBag, bagSubtotal, type BagLine } from '@/lib/store/bag';
import { useOrders } from '@/lib/store/orders';
import { useHydrated } from '@/lib/store/hydration';
import { PENDING_ORDER_KEY } from '@/lib/payments/client';
import { ButtonLink } from '@/components/ui/Button';
import { Monogram } from '@/components/ui/Logo';

export function OrderConfirmation({
  reference,
  mock,
  email,
}: {
  reference: string;
  mock: boolean;
  email: string | null;
}) {
  const hydrated = useHydrated();
  const done = useRef(false);

  useEffect(() => {
    if (!hydrated || done.current) return;
    done.current = true;
    try {
      const raw = sessionStorage.getItem(PENDING_ORDER_KEY);
      if (raw) {
        const lines = JSON.parse(raw) as BagLine[];
        useOrders.getState().addOrder({
          id: reference,
          createdAt: new Date().toISOString(),
          lines,
          total: bagSubtotal(lines),
          status: 'Processing',
        });
        sessionStorage.removeItem(PENDING_ORDER_KEY);
      }
    } catch {
      // ignore unreadable storage
    }
    useBag.getState().clear();
  }, [hydrated, reference]);

  return (
    <section className="container-luxe flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <Monogram className="text-obsidian h-14 w-14" />
      <p className="eyebrow text-stone-deep mt-10">Order {reference}</p>
      <h1 className="text-display mt-4 font-light">Thank you.</h1>
      <p className="text-stone-deep mt-6 max-w-lg">
        Your order is with the atelier.{' '}
        {email
          ? `A confirmation is on its way to ${email}.`
          : 'A confirmation will follow by email.'}{' '}
        We will write again when it is on its way to you.
      </p>
      {mock && (
        <p className="border-sand text-stone-deep mt-6 max-w-lg border px-4 py-3 text-xs">
          Demo mode: no payment was taken. Add a Stripe test key (STRIPE_SECRET_KEY) to use Stripe
          Checkout.
        </p>
      )}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/account?tab=orders" variant="secondary">
          View your orders
        </ButtonLink>
        <ButtonLink href="/collections">Continue browsing</ButtonLink>
      </div>
    </section>
  );
}
