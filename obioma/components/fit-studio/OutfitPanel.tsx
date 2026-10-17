'use client';

import { useMemo, useState } from 'react';
import type { Category, Product } from '@/lib/catalog/types';
import type { BodyBase, FitReport } from '@/lib/fit/types';
import { CATEGORY_LABELS } from '@/lib/catalog';
import { EditorialImage } from '@/components/ui/EditorialImage';
import { cn, formatPrice } from '@/lib/utils';

type Props = {
  products: Product[];
  base: BodyBase;
  selected: Product;
  onSelect: (p: Product) => void;
  colour: string;
  onColour: (c: string) => void;
  size: string;
  onSize: (s: string) => void;
  report: FitReport;
};

export function OutfitPanel({ products, base, selected, onSelect, colour, onColour, size, onSize, report }: Props) {
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [allLines, setAllLines] = useState(false);
  const pool = useMemo(() => products.filter((p) => allLines || p.line === base || p.id === selected.id), [products, allLines, base, selected.id]);
  const categories = useMemo(() => Array.from(new Set(pool.map((p) => p.category))), [pool]);
  const visible = pool.filter((p) => category === 'all' || p.category === category);

  const chip = (active: boolean) =>
    cn('min-h-9 shrink-0 border px-3 text-xs transition-colors', active ? 'border-obsidian bg-obsidian text-ivory' : 'border-sand hover:border-obsidian');

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="eyebrow">Choose a piece</h2>
        <label className="flex items-center gap-2 text-xs text-stone-deep">
          <input type="checkbox" checked={allLines} onChange={(e) => setAllLines(e.target.checked)} className="h-4 w-4 accent-[var(--color-obsidian)]" />
          Show all lines
        </label>
      </div>
      <div className="no-scrollbar -mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Filter by category">
        <button type="button" className={chip(category === 'all')} aria-pressed={category === 'all'} onClick={() => setCategory('all')}>
          All
        </button>
        {categories.map((c) => (
          <button key={c} type="button" className={chip(category === c)} aria-pressed={category === c} onClick={() => setCategory(c)}>
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      <ul className="no-scrollbar mt-4 grid auto-cols-[7.5rem] grid-flow-col gap-3 overflow-x-auto pb-2 lg:grid-flow-row lg:grid-cols-3 lg:overflow-visible" aria-label="Fit Studio pieces">
        {visible.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => onSelect(p)}
              aria-pressed={p.id === selected.id}
              className={cn('group block w-full text-left', p.id === selected.id && 'text-obsidian')}
            >
              <span className={cn('relative block aspect-[4/5] overflow-hidden bg-bone ring-offset-2 ring-offset-ivory transition', p.id === selected.id ? 'ring-1 ring-gold' : 'opacity-80 group-hover:opacity-100')}>
                <EditorialImage src={p.images[0]!} alt="" fill sizes="120px" className="object-cover" />
              </span>
              <span className="mt-2 block text-xs leading-snug">{p.name}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 border-t border-sand pt-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-serif text-2xl leading-tight">{selected.name}</p>
          <p className="text-sm">{formatPrice(selected.price)}</p>
        </div>
        <fieldset className="mt-4">
          <legend className="eyebrow mb-2">
            Colour <span className="ml-2 font-normal tracking-normal normal-case text-stone-deep">{colour}</span>
          </legend>
          <div className="flex gap-3">
            {selected.colours.map((c) => (
              <button
                key={c.name}
                type="button"
                aria-label={c.name}
                aria-pressed={c.name === colour}
                onClick={() => onColour(c.name)}
                className={cn('h-9 w-9 rounded-full border border-sand', c.name === colour && 'ring-1 ring-obsidian ring-offset-[3px] ring-offset-ivory')}
                style={{ background: c.hex }}
              />
            ))}
          </div>
        </fieldset>
        <fieldset className="mt-5">
          <legend className="eyebrow mb-2">Size</legend>
          <div className="grid grid-cols-6 gap-1.5">
            {report.sizes.map((s) => {
              const tone = s.score >= 80 ? 'bg-fit-ideal' : s.score >= 60 ? 'bg-gold' : 'bg-fit-tight';
              return (
                <button
                  key={s.size}
                  type="button"
                  onClick={() => onSize(s.size)}
                  aria-pressed={s.size === size}
                  aria-label={`Size ${s.size}, fit score ${s.score}${s.size === report.recommendedSize ? ', recommended' : ''}`}
                  className={cn(
                    'relative flex min-h-12 flex-col items-center justify-center border text-sm transition-colors',
                    s.size === size ? 'border-obsidian bg-obsidian text-ivory' : 'border-sand hover:border-obsidian',
                  )}
                >
                  {s.size}
                  <span aria-hidden="true" className={cn('mt-1 h-0.5 w-5', tone)} style={{ opacity: 0.35 + (s.score / 100) * 0.65 }} />
                  {s.size === report.recommendedSize && (
                    <span aria-hidden="true" className="absolute -top-1.5 -right-1 h-3 w-3 rounded-full border-2 border-ivory bg-gold" />
                  )}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-stone-deep">
            <span aria-hidden="true" className="mr-1 inline-block h-2 w-2 rounded-full bg-gold align-middle" /> Recommended for you
          </p>
        </fieldset>
      </div>
    </div>
  );
}
