'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Product } from '@/lib/catalog/types';
import { useBag } from '@/lib/store/bag';
import { Button, buttonClass } from '@/components/ui/Button';
import { RulerIcon } from '@/components/ui/Icons';
import { cn, formatPrice } from '@/lib/utils';
import { WishlistButton } from './WishlistButton';
import { InlineFitSummary } from './InlineFitSummary';

export function ProductPurchase({ product }: { product: Product }) {
  const sizes = product.fitStudio.sizes.map((s) => s.label);
  const [colour, setColour] = useState(product.colours[0]!.name);
  const [size, setSize] = useState<string | null>(sizes.length === 1 ? sizes[0]! : null);
  const [error, setError] = useState(false);
  const add = useBag((s) => s.add);

  const addToBag = () => {
    if (!size) {
      setError(true);
      return;
    }
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0]!,
      price: product.price,
      colour,
      size,
    });
  };

  return (
    <div>
      <fieldset>
        <legend className="eyebrow mb-3">
          Colour <span className="ml-2 font-normal tracking-normal normal-case text-stone-deep">{colour}</span>
        </legend>
        <div className="flex flex-wrap gap-3">
          {product.colours.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setColour(c.name)}
              aria-pressed={colour === c.name}
              aria-label={c.name}
              className={cn(
                'h-10 w-10 rounded-full border border-sand transition-shadow duration-300',
                colour === c.name && 'ring-1 ring-obsidian ring-offset-[3px] ring-offset-ivory',
              )}
              style={{ background: c.hex }}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <legend className="eyebrow">Size</legend>
          {product.fitStudio.enabled && (
            <Link href={`/fit-studio?product=${product.slug}`} className="eyebrow link-luxe inline-flex items-center gap-2">
              <RulerIcon className="h-4 w-4 text-gold" /> Find my size
            </Link>
          )}
        </div>
        <div className="grid grid-cols-6 gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setSize(s);
                setError(false);
              }}
              aria-pressed={size === s}
              className={cn(
                'min-h-12 border text-sm transition-colors duration-300',
                sizes.length === 1 && 'col-span-6',
                size === s ? 'border-obsidian bg-obsidian text-ivory' : 'border-sand hover:border-obsidian',
              )}
            >
              {s}
            </button>
          ))}
        </div>
        {error && (
          <p role="alert" className="mt-2 text-sm text-fit-tight">
            Please choose a size.
          </p>
        )}
      </fieldset>

      <InlineFitSummary product={product} selectedSize={size} onPickSize={setSize} />

      <div className="mt-8 flex gap-3">
        <Button onClick={addToBag} className="flex-1">
          Add to bag · {formatPrice(product.price)}
        </Button>
        <WishlistButton productId={product.id} productName={product.name} className="border border-sand px-4 hover:border-obsidian" />
      </div>

      {product.madeToMeasure && (
        <Link
          href={`/made-to-measure?product=${product.slug}`}
          className={buttonClass('oxblood', 'mt-3 w-full')}
        >
          Order made to measure{product.madeToMeasurePrice ? ` · from ${formatPrice(product.madeToMeasurePrice)}` : ''}
        </Link>
      )}
    </div>
  );
}
