'use client';

import Link from 'next/link';
import { EditorialImage } from '@/components/ui/EditorialImage';
import { MinusIcon, PlusIcon } from '@/components/ui/Icons';
import { useBag, type BagLine } from '@/lib/store/bag';
import { formatPrice } from '@/lib/utils';

export function BagLineItem({ line, onNavigate }: { line: BagLine; onNavigate?: () => void }) {
  const setQuantity = useBag((s) => s.setQuantity);
  const remove = useBag((s) => s.remove);
  return (
    <li className="flex gap-4 border-b border-sand py-6">
      <Link href={`/product/${line.slug}`} onClick={onNavigate} className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden bg-bone sm:w-28">
        <EditorialImage src={line.image} alt={line.name} fill sizes="112px" className="object-cover" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-lg leading-tight">
            <Link href={`/product/${line.slug}`} onClick={onNavigate} className="link-luxe">
              {line.name}
            </Link>
          </h3>
          <p className="shrink-0 text-sm tabular-nums">{formatPrice(line.price * line.quantity)}</p>
        </div>
        <p className="mt-1 text-xs text-stone-deep">
          {line.colour} · {line.madeToMeasure ? 'Made to measure' : `Size ${line.size}`}
        </p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="flex items-center border border-sand" role="group" aria-label={`Quantity of ${line.name}`}>
            <button
              type="button"
              onClick={() => setQuantity(line.key, line.quantity - 1)}
              className="inline-flex h-10 w-10 items-center justify-center hover:text-gold"
              aria-label="Decrease quantity"
            >
              <MinusIcon className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">
              {line.quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(line.key, line.quantity + 1)}
              className="inline-flex h-10 w-10 items-center justify-center hover:text-gold"
              aria-label="Increase quantity"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
          <button type="button" onClick={() => remove(line.key)} className="eyebrow link-luxe min-h-10 text-stone-deep">
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
