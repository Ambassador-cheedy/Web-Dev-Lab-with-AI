'use client';

import { useState } from 'react';
import { bagSubtotal, useBag } from '@/lib/store/bag';
import { useHydrated } from '@/lib/store/hydration';
import { Button, ButtonLink } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { startCheckout } from '@/lib/payments/client';
import { BagLineItem } from './BagLineItem';

export function BagView() {
  const hydrated = useHydrated();
  const lines = useBag((s) => s.lines);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!hydrated) return <div className="h-64" aria-busy="true" />;

  if (lines.length === 0) {
    return (
      <div className="border-t border-sand py-24 text-center">
        <p className="font-serif text-3xl italic">Your bag is empty.</p>
        <ButtonLink href="/collections" variant="secondary" className="mt-8">
          Explore the collection
        </ButtonLink>
      </div>
    );
  }

  const subtotal = bagSubtotal(lines);

  const checkout = async () => {
    setPending(true);
    setError(null);
    try {
      await startCheckout(lines);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
      setPending(false);
    }
  };

  return (
    <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-20">
      <ul className="border-t border-sand">
        {lines.map((l) => (
          <BagLineItem key={l.key} line={l} />
        ))}
      </ul>
      <aside aria-labelledby="summary-title" className="h-fit bg-bone p-6 sm:p-8 lg:sticky lg:top-32">
        <h2 id="summary-title" className="font-serif text-2xl">
          Summary
        </h2>
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>UK delivery</dt>
            <dd>Complimentary</dd>
          </div>
          <div className="flex justify-between border-t border-sand pt-3 text-base">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs text-stone-deep">Prices include VAT.</p>
        <Button onClick={checkout} disabled={pending} className="mt-6 w-full">
          {pending ? 'Preparing checkout…' : 'Checkout securely'}
        </Button>
        {error && (
          <p role="alert" className="mt-3 text-sm text-fit-tight">
            {error}
          </p>
        )}
        <p className="mt-4 text-xs text-stone-deep">Payments are processed by Stripe. We never see your card details.</p>
      </aside>
    </div>
  );
}
