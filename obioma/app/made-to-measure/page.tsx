import type { Metadata } from 'next';
import { getProducts } from '@/lib/catalog';
import { PageIntro } from '@/components/ui/PageIntro';
import { Reveal } from '@/components/ui/Reveal';
import { FaqList } from '@/components/ui/Faq';
import { MadeToMeasureForm } from '@/components/forms/MadeToMeasureForm';
import { faqs } from '@/data/content';

export const metadata: Metadata = {
  title: 'Made to Measure',
  description:
    'Order Obioma pieces cut to your own measurements, with an optional virtual or in-person fitting consultation.',
  alternates: { canonical: '/made-to-measure' },
};

type Props = { searchParams: Promise<{ product?: string }> };

const steps = [
  {
    t: 'Send your request',
    b: 'Choose a piece, attach your Fit Studio profile, and tell us about the occasion.',
  },
  {
    t: 'We confirm',
    b: 'A cutter checks your measurements within two working days, by email or in a consultation.',
  },
  {
    t: 'We make',
    b: 'Your piece is cut from your pattern and finished by hand. Typically four to six weeks.',
  },
  { t: 'We perfect', b: 'If anything is not right, we alter it, free of charge, until it is.' },
];

export default async function MadeToMeasurePage({ searchParams }: Props) {
  const { product } = await searchParams;
  const products = (await getProducts()).filter((p) => p.madeToMeasure);
  const mtmFaqs = faqs.find((f) => f.group === 'Made to measure')!.items;

  return (
    <>
      <PageIntro eyebrow="Made to measure" title="Cut for you, and only you.">
        Any piece marked made to measure can be cut to your body. Start from your Fit Studio
        measurements, add a fitting if you would like one, and we will do the rest.
      </PageIntro>

      <section aria-labelledby="how-title" className="container-luxe pb-20">
        <h2 id="how-title" className="sr-only">
          How it works
        </h2>
        <ol className="border-sand grid gap-8 border-t pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.t} delay={i * 0.08}>
              <span className="text-oxblood font-serif text-3xl">0{i + 1}</span>
              <h3 className="mt-3 font-serif text-2xl">{s.t}</h3>
              <p className="text-stone-deep mt-2 text-sm leading-relaxed">{s.b}</p>
            </Reveal>
          ))}
        </ol>
        <div className="bg-bone mt-14 grid gap-6 p-6 text-sm sm:grid-cols-3 sm:p-8">
          <div>
            <p className="eyebrow text-stone-deep">Timeline</p>
            <p className="mt-2">
              4–6 weeks; 8 weeks for hand-embroidered ceremonial pieces. Rush orders by arrangement.
            </p>
          </div>
          <div>
            <p className="eyebrow text-stone-deep">Pricing</p>
            <p className="mt-2">
              From around 35% above the ready-to-wear price, confirmed before we cut. No deposit
              until you approve.
            </p>
          </div>
          <div>
            <p className="eyebrow text-stone-deep">Alterations</p>
            <p className="mt-2">
              Complimentary for the life of the piece where the change is within the seam allowance.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="request-title" className="border-sand border-t">
        <div className="container-luxe grid gap-14 py-20 lg:grid-cols-[1fr_1.4fr] lg:gap-24">
          <div>
            <h2 id="request-title" className="text-title font-light">
              Begin your request
            </h2>
            <p className="text-stone-deep mt-4 max-w-sm">
              It takes a few minutes. Nothing is charged until we have agreed the details with you.
            </p>
            <div className="mt-12">
              <h3 className="eyebrow text-stone-deep mb-2">Questions</h3>
              <FaqList items={mtmFaqs} />
            </div>
          </div>
          <MadeToMeasureForm products={products} initialSlug={product} />
        </div>
      </section>
    </>
  );
}
