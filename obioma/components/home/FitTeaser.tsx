import dynamic from 'next/dynamic';
import type { Product } from '@/lib/catalog/types';
import { ButtonLink, Arrow } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';

const AvatarMorph = dynamic(() => import('./AvatarMorph').then((m) => m.AvatarMorph), {
  loading: () => <div className="mx-auto aspect-[480/760] w-full max-w-sm" />,
});

const steps = [
  {
    n: '01',
    title: 'Enter your measurements',
    body: 'Four are enough to begin. Add more and the fit sharpens.',
  },
  {
    n: '02',
    title: 'Choose a piece',
    body: 'Any piece marked for the Fit Studio, in any colour and size.',
  },
  {
    n: '03',
    title: 'See your fit',
    body: 'Your avatar wears it. A fit report shows bust, waist, hip and hem, and recommends your size.',
  },
];

export function FitTeaser({ product }: { product: Product }) {
  return (
    <section
      aria-labelledby="fit-teaser-title"
      className="bg-obsidian text-ivory overflow-hidden py-24 lg:py-36"
    >
      <div className="container-luxe grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
        <div>
          <Reveal>
            <p className="eyebrow text-gold-light flex items-center gap-3">
              <span aria-hidden="true" className="bg-gold-light h-px w-8" /> The Fit Studio
            </p>
            <h2 id="fit-teaser-title" className="text-display mt-6 font-light">
              Try it on a body shaped like yours.
            </h2>
          </Reveal>
          <ol className="mt-12 space-y-8">
            {steps.map((s, i) => (
              <Reveal
                as="li"
                key={s.n}
                delay={0.1 + i * 0.1}
                className="border-ivory/15 grid grid-cols-[3rem_1fr] gap-4 border-t pt-6"
              >
                <span className="text-gold-light font-serif text-2xl">{s.n}</span>
                <div>
                  <h3 className="font-serif text-2xl">{s.title}</h3>
                  <p className="text-ivory/70 mt-2 text-sm leading-relaxed">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
          <Reveal delay={0.4}>
            <ButtonLink href="/fit-studio" variant="light" className="mt-12">
              Open the Fit Studio <Arrow />
            </ButtonLink>
          </Reveal>
        </div>
        <div className="relative rounded-xs bg-[radial-gradient(ellipse_at_50%_40%,var(--color-ivory),var(--color-bone)_60%,var(--color-sand))] px-6 pt-8 pb-6">
          <AvatarMorph product={product} />
        </div>
      </div>
    </section>
  );
}
