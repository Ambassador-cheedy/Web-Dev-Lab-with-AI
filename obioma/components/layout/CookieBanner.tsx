'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useConsent } from '@/lib/store/consent';
import { useHydrated } from '@/lib/store/hydration';
import { Button } from '@/components/ui/Button';

export function CookieBanner() {
  const hydrated = useHydrated();
  const choice = useConsent((s) => s.choice);
  const decide = useConsent((s) => s.decide);
  const show = hydrated && choice === null;

  return (
    <AnimatePresence>
      {show && (
        <motion.section
          role="region"
          aria-label="Cookie preferences"
          className="border-sand bg-ivory text-obsidian fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-xl border p-5 shadow-[0_20px_60px_-30px_rgba(17,16,16,0.4)] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:p-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="font-serif text-xl sm:text-2xl">A note on cookies</h2>
          <p className="text-stone-deep mt-2 text-[0.8125rem] leading-relaxed sm:text-sm">
            We use essential storage to keep your bag, wishlist and measurements on this device.
            With your permission we would also use analytics to understand how the site is used.
            Read our{' '}
            <Link href="/cookies" className="decoration-gold underline underline-offset-4">
              cookie policy
            </Link>
            .
          </p>
          <div className="mt-4 flex gap-3">
            <Button onClick={() => decide('all')} className="flex-1 px-3">
              Accept all
            </Button>
            <Button variant="secondary" onClick={() => decide('essential')} className="flex-1 px-3">
              Essential only
            </Button>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

export function CookieSettingsLink() {
  const reset = useConsent((s) => s.reset);
  return (
    <button
      type="button"
      onClick={reset}
      className="link-luxe text-ivory/80 hover:text-ivory text-left text-sm"
    >
      Cookie settings
    </button>
  );
}
