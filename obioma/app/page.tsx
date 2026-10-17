import Link from 'next/link';
import { getProductBySlug, getProducts } from '@/lib/catalog';
import { Hero } from '@/components/home/Hero';
import { FitTeaser } from '@/components/home/FitTeaser';
import { DragScroller } from '@/components/home/DragScroller';
import { Testimonials } from '@/components/home/Testimonials';
import { ProductCard } from '@/components/product/ProductCard';
import { EditorialImage } from '@/components/ui/EditorialImage';
import { MaskReveal, Reveal } from '@/components/ui/Reveal';
import { ButtonLink, Arrow } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { NewsletterForm } from '@/components/forms/NewsletterForm';
import { lookbook } from '@/data/content';
import { img } from '@/data/images';
import { cn } from '@/lib/utils';

export default async function Home() {
  const featured = await getProducts({ collection: 'harmattan' });
  const teaserProduct = (await getProductBySlug('nneka-wrap-dress'))!;

  return (
    <>
      <Hero />

      <FitTeaser product={teaserProduct} />

      {/* Featured collection */}
      <section aria-labelledby="featured-title" className="py-24 lg:py-36">
        <div className="container-luxe flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <Reveal>
            <Eyebrow rule className="text-stone-deep">Featured</Eyebrow>
            <h2 id="featured-title" className="mt-5 text-display font-light">
              The Harmattan Collection
            </h2>
            <p className="mt-4 max-w-lg text-stone-deep">Dry-season tailoring in sand, oxblood and obsidian. Drag to browse.</p>
          </Reveal>
          <Link href="/collections/harmattan" className="eyebrow link-luxe self-start sm:self-end">
            View the collection
          </Link>
        </div>
        <DragScroller label="Featured pieces" className="mt-12">
          <ul className="flex w-max gap-4 px-[clamp(1rem,0.5rem+2.5vw,3.5rem)] pb-4 sm:gap-6">
            {featured.map((p, i) => (
              <li key={p.id} className="w-[68vw] shrink-0 sm:w-[38vw] lg:w-[24vw] xl:w-[21vw]">
                <Reveal delay={Math.min(i, 4) * 0.08}>
                  <ProductCard product={p} sizes="(min-width: 1024px) 24vw, 68vw" />
                </Reveal>
              </li>
            ))}
          </ul>
        </DragScroller>
      </section>

      {/* Atelier */}
      <section aria-labelledby="atelier-title" className="bg-bone">
        <div className="container-luxe grid items-center gap-12 py-24 lg:grid-cols-[1.1fr_1fr] lg:gap-24 lg:py-36">
          <MaskReveal className="relative aspect-[4/5] lg:aspect-[5/6]">
            <EditorialImage src={img.workshop} alt="Hands pinning a toile on a tailor’s dummy in the Obioma workroom" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </MaskReveal>
          <Reveal>
            <Eyebrow rule className="text-stone-deep">The atelier</Eyebrow>
            <h2 id="atelier-title" className="mt-5 text-display font-light">
              Slow hands, kind hearts.
            </h2>
            <div className="mt-8 max-w-lg space-y-5 text-base leading-relaxed text-stone-deep">
              <p>
                Obioma means “kind heart” in Igbo. It is how we try to make clothes: patiently, honestly, and with care for
                the person who will wear them.
              </p>
              <p>
                Every piece is cut in our London studio and finished by hand, with embroidery from our atelier in Lagos.
                We make in small runs, from cloth we can trace to the mill.
              </p>
            </div>
            <ButtonLink href="/atelier" variant="secondary" className="mt-10">
              Inside the atelier <Arrow />
            </ButtonLink>
          </Reveal>
        </div>
      </section>

      {/* Made to measure */}
      <section aria-labelledby="mtm-title" className="container-luxe py-24 lg:py-36">
        <div className="grid gap-12 border-t border-sand pt-16 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
          <Reveal>
            <p className="eyebrow inline-block bg-oxblood px-3 py-1.5 text-ivory">Made to measure</p>
            <h2 id="mtm-title" className="mt-6 text-display font-light">
              Your measurements, our hands.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-lg leading-relaxed text-stone-deep">
              Save your profile once in the Fit Studio and order any marked piece cut to your body alone. We begin from
              your numbers, confirm them with you, and alter until it is right.
            </p>
            <ol className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                ['Profile', 'Your saved Fit Studio measurements travel with the request.'],
                ['Consult', 'An optional virtual or in-person fitting with our cutter.'],
                ['Made', 'Four to six weeks, finished by hand, altered free.'],
              ].map(([t, b], i) => (
                <li key={t} className="border-t border-oxblood/40 pt-4">
                  <span className="font-serif text-xl text-oxblood">0{i + 1}</span>
                  <h3 className="mt-2 font-serif text-xl">{t}</h3>
                  <p className="mt-1 text-sm text-stone-deep">{b}</p>
                </li>
              ))}
            </ol>
            <ButtonLink href="/made-to-measure" variant="oxblood" className="mt-10">
              Begin a made-to-measure order
            </ButtonLink>
          </Reveal>
        </div>
      </section>

      {/* Lookbook strip */}
      <section aria-labelledby="lookbook-title" className="pb-24 lg:pb-36">
        <div className="container-luxe flex items-end justify-between gap-6">
          <Reveal>
            <Eyebrow rule className="text-stone-deep">Lookbook</Eyebrow>
            <h2 id="lookbook-title" className="mt-5 text-display font-light">
              Seen in the light
            </h2>
          </Reveal>
          <Link href="/lookbook" className="eyebrow link-luxe shrink-0">
            The full lookbook
          </Link>
        </div>
        <ul className="container-luxe mt-12 grid auto-rows-[9rem] grid-cols-2 gap-3 sm:auto-rows-[11rem] sm:gap-4 lg:grid-cols-4">
          {lookbook.map((l, i) => {
            const span = ['row-span-3', 'row-span-2', 'row-span-3 lg:row-span-4', 'row-span-2', 'row-span-2 lg:row-span-3', 'row-span-3', 'row-span-2'][i];
            return (
              <li key={l.id} className={cn('relative', span)}>
                <Link href={`/lookbook#${l.id}`} className="group block h-full">
                  <MaskReveal className="h-full">
                    <div className="relative h-full">
                      <EditorialImage src={l.image} alt={`${l.title}: ${l.caption}`} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition-transform duration-[1400ms] ease-luxe group-hover:scale-105" />
                    </div>
                  </MaskReveal>
                  <span className="eyebrow absolute bottom-3 left-3 bg-ivory/90 px-2 py-1 text-[0.6rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                    {l.title}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="border-t border-sand">
        <Testimonials />
      </div>

      {/* Newsletter */}
      <section aria-labelledby="home-newsletter-title" className="bg-bone">
        <div className="container-luxe grid items-end gap-10 py-20 lg:grid-cols-2 lg:py-28">
          <Reveal>
            <h2 id="home-newsletter-title" className="text-title font-light">
              First to know, rarely in touch.
            </h2>
            <p className="mt-3 max-w-md text-stone-deep">New pieces, private fittings and stories from the atelier, at most once a month.</p>
          </Reveal>
          <NewsletterForm tone="light" id="home-newsletter" />
        </div>
      </section>
    </>
  );
}
