'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CloseIcon, SearchIcon } from '@/components/ui/Icons';
import { EditorialImage } from '@/components/ui/EditorialImage';
import { formatPrice } from '@/lib/utils';
import { useDialog } from './useDialog';

type Result = { slug: string; name: string; price: number; image: string; tagline: string };

const SUGGESTIONS = ['Dress', 'Suit', 'Agbada', 'Silk', 'Occasion', 'Oxblood'];

export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const ref = useDialog<HTMLDivElement>(onClose);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    if (!q.trim()) return;
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then(setResults)
        .catch(() => {});
    }, 180);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  const shown = q.trim() ? results : [];

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      className="bg-ivory fixed inset-0 z-50 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="container-luxe py-6">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="-mr-3 inline-flex h-11 w-11 items-center justify-center"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="mx-auto mt-8 max-w-3xl">
          <label htmlFor="site-search" className="eyebrow text-stone-deep">
            Search Obioma
          </label>
          <div className="border-obsidian focus-within:border-gold mt-3 flex items-center gap-4 border-b pb-3">
            <SearchIcon className="h-6 w-6 shrink-0" />
            <input
              id="site-search"
              data-autofocus
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Dresses, silk, agbada…"
              className="placeholder:text-stone w-full bg-transparent font-serif text-3xl font-light outline-none sm:text-5xl"
              autoComplete="off"
            />
          </div>
          {!q && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => setQ(s)}
                    className="border-sand hover:border-obsidian min-h-10 border px-4 text-sm"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="sr-only" aria-live="polite">
            {q ? `${shown.length} results` : ''}
          </p>
          <ul className="divide-sand mt-10 divide-y">
            {shown.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/product/${r.slug}`}
                  onClick={onClose}
                  className="group flex items-center gap-5 py-4"
                >
                  <span className="bg-bone relative aspect-[4/5] w-16 shrink-0 overflow-hidden">
                    <EditorialImage
                      src={r.image}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="group-hover:text-gold block font-serif text-xl">{r.name}</span>
                    <span className="text-stone-deep block truncate text-sm">{r.tagline}</span>
                  </span>
                  <span className="text-sm">{formatPrice(r.price)}</span>
                </Link>
              </li>
            ))}
          </ul>
          {q.trim() && shown.length === 0 && (
            <p className="mt-10 font-serif text-2xl italic">Nothing found for “{q}”.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
