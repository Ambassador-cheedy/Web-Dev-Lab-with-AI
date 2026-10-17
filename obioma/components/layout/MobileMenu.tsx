'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Logo } from '@/components/ui/Logo';
import { CloseIcon } from '@/components/ui/Icons';
import { primaryNav } from '@/lib/nav';
import { useDialog } from './useDialog';

const secondary = [
  { href: '/lookbook', label: 'Lookbook' },
  { href: '/account', label: 'Account' },
  { href: '/account?tab=wishlist', label: 'Wishlist' },
  { href: '/contact', label: 'Client services' },
];

export function MobileMenu({ onClose, onSearch }: { onClose: () => void; onSearch: () => void }) {
  const ref = useDialog<HTMLDivElement>(onClose);
  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="fixed inset-0 z-50 flex flex-col bg-obsidian text-ivory"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="container-luxe flex h-16 items-center justify-between">
        <Logo />
        <button type="button" onClick={onClose} aria-label="Close menu" className="-mr-3 inline-flex h-11 w-11 items-center justify-center">
          <CloseIcon />
        </button>
      </div>
      <nav aria-label="Mobile" className="container-luxe flex flex-1 flex-col justify-center gap-10 pb-16">
        <ul className="space-y-3">
          {primaryNav.map((item, i) => (
            <motion.li
              key={item.href}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href={item.href} onClick={onClose} className="font-serif text-5xl font-light leading-tight hover:text-gold-light sm:text-6xl">
                {item.label}
              </Link>
            </motion.li>
          ))}
        </ul>
        <span aria-hidden="true" className="h-px w-16 bg-gold-light" />
        <ul className="grid grid-cols-2 gap-4">
          {secondary.map((item) => (
            <li key={item.href}>
              <Link href={item.href} onClick={onClose} className="eyebrow text-ivory/80 hover:text-gold-light">
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <button type="button" onClick={onSearch} className="eyebrow text-ivory/80 hover:text-gold-light">
              Search
            </button>
          </li>
        </ul>
      </nav>
    </motion.div>
  );
}
