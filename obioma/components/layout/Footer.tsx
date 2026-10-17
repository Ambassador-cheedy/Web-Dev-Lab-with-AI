import Link from 'next/link';
import { Logo, Monogram } from '@/components/ui/Logo';
import { InstagramIcon, PinterestIcon, TikTokIcon } from '@/components/ui/Icons';
import { NewsletterForm } from '@/components/forms/NewsletterForm';
import { footerNav } from '@/lib/nav';
import { CookieSettingsLink } from './CookieBanner';

const socials = [
  { href: 'https://instagram.com', label: 'Obioma on Instagram', Icon: InstagramIcon },
  { href: 'https://pinterest.com', label: 'Obioma on Pinterest', Icon: PinterestIcon },
  { href: 'https://tiktok.com', label: 'Obioma on TikTok', Icon: TikTokIcon },
];

export function Footer() {
  return (
    <footer className="bg-obsidian text-ivory">
      <div className="container-luxe pt-20 pb-10 lg:pt-28">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_2fr] lg:gap-24">
          <div className="max-w-md">
            <Monogram className="mb-8 h-12 w-12 text-ivory" />
            <h2 className="font-serif text-3xl font-light sm:text-4xl">Letters from the atelier</h2>
            <p className="mt-4 text-sm leading-relaxed text-ivory/75">
              New pieces, fittings and the occasional story from the workroom. Never more than once a month.
            </p>
            <div className="mt-8">
              <NewsletterForm id="footer-newsletter" />
            </div>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {footerNav.map((col) => (
              <div key={col.title}>
                <h3 className="eyebrow mb-5 font-sans text-gold-light">{col.title}</h3>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="link-luxe text-sm text-ivory/80 hover:text-ivory">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                  {col.title === 'Legal' && (
                    <li>
                      <CookieSettingsLink />
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-20 flex flex-col items-center gap-6 border-t border-ivory/15 pt-10 sm:flex-row sm:justify-between">
          <Logo className="text-ivory" />
          <ul className="flex items-center gap-2">
            {socials.map(({ href, label, Icon }) => (
              <li key={href}>
                <a
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 w-11 items-center justify-center text-ivory/80 transition-colors hover:text-gold-light"
                >
                  <Icon />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-8 flex flex-col items-center gap-3">
          <span aria-hidden="true" className="h-px w-10 bg-gold" />
          <p className="text-xs tracking-wide text-ivory/60">© {new Date().getFullYear()} Obioma. Made for the body you live in.</p>
        </div>
      </div>
    </footer>
  );
}
