import type { Metadata } from 'next';
import { DarkHero } from '@/components/ui/DarkHero';
import { EditorialImage } from '@/components/ui/EditorialImage';
import { MaskReveal, Reveal } from '@/components/ui/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { img } from '@/data/images';

export const metadata: Metadata = {
  title: 'Atelier',
  description:
    'The story of Obioma: our founder, our design philosophy, craftsmanship, and how we source and make.',
  alternates: { canonical: '/atelier' },
};

/* PLACEHOLDER COPY: replace with Obioma's own story before launch. */
const chapters = [
  {
    eyebrow: 'The founder',
    title: 'A kind heart, a sharp pair of shears.',
    image: img.tailor,
    alt: 'A tailor marking cloth with chalk',
    body: [
      'Obioma was founded by a designer who grew up between Enugu and London, watching an aunt cut cloth for the whole street on a kitchen table. She learned two things there: that clothes should be made for the person, not the other way round, and that kindness is a craft too.',
      'After a decade in the workrooms of London tailoring houses, she opened Obioma with one question: what would it take for every client to feel the garment was made for them?',
    ],
  },
  {
    eyebrow: 'Philosophy',
    title: 'Fewer pieces. Better fit.',
    image: img.fabric,
    alt: 'Folded lengths of wool cloth in sand and oxblood',
    body: [
      'We design in small collections, cut each piece for the proportions people actually have, and show you honestly how it will fit before you buy. The Fit Studio exists because a beautiful garment that does not fit is not beautiful.',
      'Our silhouettes are quiet on purpose. A clean line, a soft shoulder, a hem in exactly the right place: these outlast any trend.',
    ],
  },
  {
    eyebrow: 'Craft',
    title: 'Finished by hand, in two cities.',
    image: img.workshop,
    alt: 'The Obioma workroom with pattern pieces on the table',
    body: [
      'Tailoring is half-canvassed and finished in our London studio. Ceremonial embroidery is worked by hand in our Lagos atelier, where a single agbada chest panel takes five days.',
      'Every seam allowance is generous, so a piece can be altered as you change. We would rather you wore it for twenty years.',
    ],
  },
  {
    eyebrow: 'Sourcing & sustainability',
    title: 'Cloth we can trace to the mill.',
    image: img.rack,
    alt: 'A rail of finished garments in natural light',
    body: [
      'We buy from family mills in Huddersfield, Biella and Donegal, and from weavers in south-east Nigeria. We make in small runs and to order, so very little is wasted.',
      'Offcuts become linings, facings and the small pouches our pieces travel in. Packaging is recycled and recyclable. We publish our supplier list each season.',
    ],
  },
];

export default function AtelierPage() {
  return (
    <>
      <DarkHero
        image={img.workshop}
        alt="The Obioma workroom"
        eyebrow="The atelier"
        title="Made slowly, with care."
      >
        The people, principles and places behind every Obioma piece.
      </DarkHero>
      <div className="container-luxe py-24 lg:py-36">
        {chapters.map((c, i) => (
          <article
            key={c.title}
            className="border-sand grid items-center gap-12 border-b py-16 first:pt-0 last:border-0 lg:grid-cols-2 lg:gap-24 lg:py-24"
          >
            <MaskReveal className={`relative aspect-[4/5] ${i % 2 ? 'lg:order-2' : ''}`}>
              <EditorialImage
                src={c.image}
                alt={c.alt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </MaskReveal>
            <Reveal>
              <p className="eyebrow text-stone-deep flex items-center gap-3">
                <span aria-hidden="true" className="bg-gold h-px w-8" /> {c.eyebrow}
              </p>
              <h2 className="text-title mt-5 font-light">{c.title}</h2>
              <div className="prose-luxe text-stone-deep mt-6 max-w-lg leading-relaxed">
                {c.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </Reveal>
          </article>
        ))}
        <Reveal className="mx-auto max-w-2xl pt-12 text-center">
          <p className="font-serif text-3xl leading-snug italic sm:text-4xl">
            “Clothes should be made for the person, not the other way round.”
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/made-to-measure" variant="oxblood">
              Made to measure
            </ButtonLink>
            <ButtonLink href="/fit-studio" variant="secondary">
              Try the Fit Studio
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </>
  );
}
