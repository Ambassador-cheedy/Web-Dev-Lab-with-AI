'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { bagSubtotal, useBag } from '@/lib/store/bag';
import { useHydrated } from '@/lib/store/hydration';
import { CloseIcon } from '@/components/ui/Icons';
import { ButtonLink, buttonClass } from '@/components/ui/Button';
import { BagLineItem } from '@/components/product/BagLineItem';
import { formatPrice } from '@/lib/utils';
import { useDialog } from './useDialog';

export function BagDrawer() {
  const isOpen = useBag((s) => s.isOpen);
  const hydrated = useHydrated();
  return <AnimatePresence>{hydrated && isOpen && <Drawer />}</AnimatePresence>;
}

function Drawer() {
  const lines = useBag((s) => s.lines);
  const close = useBag((s) => s.close);
  const ref = useDialog<HTMLDivElement>(close);
  const subtotal = bagSubtotal(lines);
  return (
    <div className="fixed inset-0 z-[55]">
      <motion.div
        className="absolute inset-0 bg-obsidian/40"
        onClick={close}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        aria-hidden="true"
      />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bag-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-ivory"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between border-b border-sand px-6 py-5">
          <h2 id="bag-title" className="font-serif text-2xl">
            Your bag
          </h2>
          <button type="button" onClick={close} aria-label="Close bag" className="-mr-3 inline-flex h-11 w-11 items-center justify-center">
            <CloseIcon />
          </button>
        </div>
        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
            <p className="font-serif text-2xl italic">Your bag is empty.</p>
            <ButtonLink href="/collections" variant="secondary" onClick={close}>
              Explore the collection
            </ButtonLink>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-6">
              {lines.map((l) => (
                <BagLineItem key={l.key} line={l} onNavigate={close} />
              ))}
            </ul>
            <div className="border-t border-sand px-6 py-6">
              <div className="flex items-center justify-between">
                <span className="eyebrow">Subtotal</span>
                <span className="tabular-nums">{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-stone-deep">Complimentary UK delivery. Taxes included.</p>
              <Link href="/bag" onClick={close} className={buttonClass('primary', 'mt-5 w-full')}>
                View bag & checkout
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
