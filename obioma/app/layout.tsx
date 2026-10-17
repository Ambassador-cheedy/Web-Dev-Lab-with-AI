import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BagDrawer } from '@/components/layout/BagDrawer';
import { CookieBanner } from '@/components/layout/CookieBanner';
import { StoreHydrator } from '@/components/layout/StoreHydrator';
import { siteUrl } from '@/lib/utils';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Obioma · Made for the body you live in',
    template: '%s · Obioma',
  },
  description:
    'Obioma is a fashion house making considered clothing for real bodies. See how every piece fits you in the Fit Studio, or have it made to measure.',
  applicationName: 'Obioma',
  openGraph: {
    type: 'website',
    siteName: 'Obioma',
    locale: 'en_GB',
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: '#111010',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${cormorant.variable} ${manrope.variable}`}>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="bg-obsidian text-ivory sr-only z-[70] px-4 py-3 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <StoreHydrator />
        <Header />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer />
        <BagDrawer />
        <CookieBanner />
      </body>
    </html>
  );
}
