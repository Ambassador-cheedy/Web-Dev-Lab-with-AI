import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllProducts } from '@/lib/catalog';
import { DarkHero } from '@/components/ui/DarkHero';
import { EditorialImage } from '@/components/ui/EditorialImage';
import { MaskReveal, Reveal } from '@/components/ui/Reveal';
import { lookbook } from '@/data/content';
import { img } from '@/data/images';
import { formatPrice } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Lookbook',
  description: 'The Harmattan Collection, photographed. Every look links to its pieces.',
  alternates: { canonical: '/lookbook' },
};

export default async function LookbookPage() {
  const products = await getAllProducts();
  return (
    <>
      <DarkHero
        image={img.heroAlt}
        alt="Editorial portrait from the Harmattan lookbook"
        eyebrow="Lookbook"
        title="Harmattan"
      >
        Dry light, warm shadow, and the pieces we made for both.
      </DarkHero>
      <div className="py-16 lg:py-28">
        {lookbook.map((look, i) => {
          const pieces = look.products
            .map((s) => products.find((p) => p.slug === s))
            .filter((p) => !!p);
          const wide = i % 3 === 0;
          return (
            <section
              key={look.id}
              id={look.id}
              aria-labelledby={`${look.id}-title`}
              className="scroll-mt-28"
            >
              <div
                className={`container-luxe grid items-end gap-8 py-10 lg:gap-16 ${wide ? '' : 'lg:grid-cols-[1.2fr_1fr]'} ${i % 2 && !wide ? 'lg:[&>*:first-child]:order-2' : ''}`}
              >
                <MaskReveal
                  className={`relative ${wide ? 'aspect-[4/5] sm:aspect-[16/9]' : 'aspect-[4/5]'}`}
                >
                  <EditorialImage
                    src={look.image}
                    alt={`${look.title}: ${look.caption}`}
                    fill
                    sizes={wide ? '100vw' : '(min-width: 1024px) 55vw, 100vw'}
                    className="object-cover"
                  />
                </MaskReveal>
                <Reveal className={wide ? 'max-w-xl' : ''}>
                  <p className="eyebrow text-stone-deep">Look {String(i + 1).padStart(2, '0')}</p>
                  <h2 id={`${look.id}-title`} className="text-title mt-3 font-light">
                    {look.title}
                  </h2>
                  <p className="text-stone-deep mt-3 font-serif text-xl italic">{look.caption}</p>
                  <ul className="divide-sand border-sand mt-6 divide-y border-y">
                    {pieces.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/product/${p.slug}`}
                          className="group flex items-center justify-between gap-4 py-3"
                        >
                          <span className="link-luxe">{p.name}</span>
                          <span className="text-stone-deep text-sm">{formatPrice(p.price)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
