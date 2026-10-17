'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/ui/Logo';
import { BagIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon } from '@/components/ui/Icons';
import { primaryNav } from '@/lib/nav';
import { bagCount, useBag } from '@/lib/store/bag';
import { useWishlist } from '@/lib/store/wishlist';
import { useHydrated } from '@/lib/store/hydration';
import { cn } from '@/lib/utils';
import { MobileMenu } from './MobileMenu';
import { SearchOverlay } from './SearchOverlay';
import { AnnouncementBar } from './AnnouncementBar';

/** Routes that open with a full-bleed dark hero, so the header starts transparent. */
const OVERLAY_ROUTES = ['/', '/atelier', '/lookbook'];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const hydrated = useHydrated();
  const count = useBag((s) => bagCount(s.lines));
  const openBag = useBag((s) => s.open);
  const wishCount = useWishlist((s) => s.ids.length);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close overlays on navigation; this syncs UI state to the router (an external system).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const overlay = OVERLAY_ROUTES.includes(pathname);
  const transparent = overlay && !scrolled && !menuOpen;

  const iconBtn =
    'relative h-11 w-11 items-center justify-center transition-colors duration-500 hover:text-gold';

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40">
      <AnnouncementBar hidden={scrolled} />
      <header
        className={cn(
          'border-b transition-[background-color,color,border-color] duration-700 ease-luxe',
          transparent
            ? 'border-transparent bg-transparent text-ivory'
            : 'border-sand bg-ivory/95 text-obsidian backdrop-blur-sm',
        )}
      >
        <div className="container-luxe grid h-16 grid-cols-[1fr_auto_1fr] items-center lg:h-20">
          <div className="flex items-center">
            <button
              type="button"
              className={cn(iconBtn, '-ml-3 inline-flex lg:hidden')}
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <MenuIcon />
            </button>
            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="flex items-center gap-8">
                {primaryNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'eyebrow link-luxe',
                        pathname.startsWith(item.href) && 'bg-[length:100%_1px]',
                      )}
                      aria-current={pathname.startsWith(item.href) ? 'page' : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <Link href="/" aria-label="Obioma home" className="justify-self-center">
            <Logo />
          </Link>

          <div className="flex items-center justify-end gap-0 sm:gap-1">
            <button type="button" className={cn(iconBtn, 'hidden sm:inline-flex')} aria-label="Search" onClick={() => setSearchOpen(true)}>
              <SearchIcon />
            </button>
            <Link href="/account" className={cn(iconBtn, 'hidden sm:inline-flex')} aria-label="Account">
              <UserIcon />
            </Link>
            <Link
              href="/account?tab=wishlist"
              className={cn(iconBtn, 'hidden md:inline-flex')}
              aria-label={`Wishlist${hydrated && wishCount ? `, ${wishCount} items` : ''}`}
            >
              <HeartIcon />
              {hydrated && wishCount > 0 && <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-gold" />}
            </Link>
            <button
              type="button"
              className={cn(iconBtn, '-mr-3 inline-flex')}
              onClick={openBag}
              aria-label={`Shopping bag, ${hydrated ? count : 0} items`}
            >
              <BagIcon />
              <span
                className={cn(
                  'absolute right-1 bottom-1.5 min-w-4 text-center text-[10px] font-semibold tabular-nums',
                  !(hydrated && count > 0) && 'sr-only',
                )}
                aria-hidden="true"
              >
                {hydrated ? count : 0}
              </span>
            </button>
          </div>
        </div>
      </header>
      </div>
      {!overlay && <div aria-hidden="true" className="h-[100px] lg:h-[116px]" />}
      <AnimatePresence>
        {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} onSearch={() => { setMenuOpen(false); setSearchOpen(true); }} />}
      </AnimatePresence>
      <AnimatePresence>{searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}</AnimatePresence>
    </>
  );
}
