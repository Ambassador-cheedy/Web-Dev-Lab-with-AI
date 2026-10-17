'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Category, Product, SortKey } from '@/lib/catalog/types';
import { CATEGORY_LABELS, COLOUR_FAMILIES, FAMILY_SWATCH, filterProducts } from '@/lib/catalog';
import { STANDARD_SIZES } from '@/data/products';
import { cn } from '@/lib/utils';
import { ChevronIcon, CloseIcon } from '@/components/ui/Icons';
import { ProductCard } from './ProductCard';

const PRICE_BANDS = [
  { id: 'all', label: 'Any price' },
  { id: 'u500', label: 'Under £500', max: 499 },
  { id: '500-1000', label: '£500 – £1,000', min: 500, max: 1000 },
  { id: 'o1000', label: 'Over £1,000', min: 1001 },
] as const;

const SORTS: { id: SortKey; label: string }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'newest', label: 'Newest' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
];

export function CollectionView({
  products,
  activeCategory,
}: {
  products: Product[];
  activeCategory?: Category;
}) {
  const [sizes, setSizes] = useState<string[]>([]);
  const [colours, setColours] = useState<string[]>([]);
  const [price, setPrice] = useState<(typeof PRICE_BANDS)[number]['id']>('all');
  const [sort, setSort] = useState<SortKey>('featured');
  const [fitOnly, setFitOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const band = PRICE_BANDS.find((b) => b.id === price)!;
  const visible = useMemo(
    () =>
      filterProducts(products, {
        sizes,
        colours,
        sort,
        fitStudioOnly: fitOnly,
        minPrice: 'min' in band ? band.min : undefined,
        maxPrice: 'max' in band ? band.max : undefined,
      }),
    [products, sizes, colours, sort, fitOnly, band],
  );

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const activeCount = sizes.length + colours.length + (price !== 'all' ? 1 : 0) + (fitOnly ? 1 : 0);
  const clear = () => {
    setSizes([]);
    setColours([]);
    setPrice('all');
    setFitOnly(false);
  };

  const chip = (active: boolean) =>
    cn(
      'min-h-10 border px-3 text-xs tracking-wide transition-colors duration-300',
      active ? 'border-obsidian bg-obsidian text-ivory' : 'border-sand hover:border-obsidian',
    );

  return (
    <div>
      <nav
        aria-label="Categories"
        className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0"
      >
        <ul className="border-sand flex min-w-max gap-6 border-b">
          <li>
            <Link
              href="/collections"
              className={cn(
                'eyebrow inline-block py-4',
                !activeCategory
                  ? 'border-gold text-obsidian border-b'
                  : 'text-stone-deep hover:text-obsidian',
              )}
              aria-current={!activeCategory ? 'page' : undefined}
            >
              All
            </Link>
          </li>
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
            <li key={c}>
              <Link
                href={`/collections/${c}`}
                className={cn(
                  'eyebrow inline-block py-4',
                  activeCategory === c
                    ? 'border-gold text-obsidian border-b'
                    : 'text-stone-deep hover:text-obsidian',
                )}
                aria-current={activeCategory === c ? 'page' : undefined}
              >
                {CATEGORY_LABELS[c]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center justify-between gap-4 py-5">
        <button
          type="button"
          onClick={() => setFiltersOpen((o) => !o)}
          aria-expanded={filtersOpen}
          aria-controls="filters"
          className="eyebrow inline-flex min-h-11 items-center gap-2"
        >
          Filter {activeCount > 0 && <span className="text-gold">({activeCount})</span>}
          <ChevronIcon
            className={cn('h-4 w-4 transition-transform duration-500', filtersOpen && 'rotate-180')}
          />
        </button>
        <p className="text-stone-deep hidden text-sm sm:block" aria-live="polite">
          {visible.length} {visible.length === 1 ? 'piece' : 'pieces'}
        </p>
        <label className="flex items-center gap-2">
          <span className="eyebrow text-stone-deep">Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="focus-visible:ring-gold min-h-11 border-0 bg-transparent pr-1 text-sm outline-none focus-visible:ring-2"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <AnimatePresence initial={false}>
        {filtersOpen && (
          <motion.div
            id="filters"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-sand grid gap-8 border-y py-8 md:grid-cols-4">
              <fieldset>
                <legend className="eyebrow text-stone-deep mb-3">Size</legend>
                <div className="flex flex-wrap gap-2">
                  {STANDARD_SIZES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={sizes.includes(s)}
                      onClick={() => toggle(sizes, setSizes, s)}
                      className={chip(sizes.includes(s))}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="eyebrow text-stone-deep mb-3">Colour</legend>
                <div className="flex flex-wrap gap-2">
                  {COLOUR_FAMILIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={colours.includes(c)}
                      onClick={() => toggle(colours, setColours, c)}
                      className={cn(chip(colours.includes(c)), 'inline-flex items-center gap-2')}
                    >
                      <span
                        aria-hidden="true"
                        className="border-sand h-3 w-3 rounded-full border"
                        style={{ background: FAMILY_SWATCH[c] }}
                      />
                      {c}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="eyebrow text-stone-deep mb-3">Price</legend>
                <div className="flex flex-wrap gap-2">
                  {PRICE_BANDS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      aria-pressed={price === b.id}
                      onClick={() => setPrice(b.id)}
                      className={chip(price === b.id)}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="eyebrow text-stone-deep mb-3">Fit Studio</legend>
                <button
                  type="button"
                  aria-pressed={fitOnly}
                  onClick={() => setFitOnly((v) => !v)}
                  className={chip(fitOnly)}
                >
                  Try-on enabled only
                </button>
                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={clear}
                    className="eyebrow text-stone-deep hover:text-obsidian mt-6 flex min-h-11 items-center gap-2"
                  >
                    <CloseIcon className="h-4 w-4" /> Clear all
                  </button>
                )}
              </fieldset>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {visible.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-serif text-3xl">Nothing matches just yet.</p>
          <button type="button" onClick={clear} className="eyebrow link-luxe mt-6">
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-12 pt-6 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
          {visible.map((p, i) => (
            <motion.li
              key={p.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: Math.min(i, 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProductCard product={p} priority={i < 4} />
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
