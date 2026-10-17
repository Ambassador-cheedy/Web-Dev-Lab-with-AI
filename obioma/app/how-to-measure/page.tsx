import type { Metadata } from 'next';
import { PageIntro } from '@/components/ui/PageIntro';
import { MeasureIllustration } from '@/components/fit-studio/MeasureIllustration';
import { MEASUREMENT_FIELDS } from '@/lib/fit/measurements';
import { ButtonLink } from '@/components/ui/Button';

export const metadata: Metadata = { title: 'How to measure', description: 'Illustrated guide to taking your measurements for the Obioma Fit Studio.', alternates: { canonical: '/how-to-measure' } };

export default function HowToMeasurePage() {
  return (
    <>
      <PageIntro eyebrow="Client services" title="How to measure">
        Use a soft tape measure, wear light clothing, and stand naturally. Ask someone to help if you can: it is quicker and
        more accurate. Keep the tape snug, never tight.
      </PageIntro>
      <div className="container-luxe pb-24">
        <ul className="grid gap-px bg-sand sm:grid-cols-2 lg:grid-cols-3">
          {MEASUREMENT_FIELDS.map((f) => (
            <li key={f.key} className="flex gap-6 bg-ivory p-6">
              <MeasureIllustration field={f.key} className="h-36 w-18 shrink-0" />
              <div>
                <h2 className="font-serif text-2xl">
                  {f.label}
                  {f.menLabel && <span className="text-stone-deep"> / {f.menLabel.toLowerCase()}</span>}
                </h2>
                <p className="eyebrow mt-1 text-[0.6rem] text-stone-deep">{f.required ? 'Required' : 'Optional'}</p>
                <p className="mt-3 text-sm leading-relaxed text-stone-deep">{f.how}</p>
              </div>
            </li>
          ))}
        </ul>
        <ButtonLink href="/fit-studio" className="mt-12">
          Enter them in the Fit Studio
        </ButtonLink>
      </div>
    </>
  );
}
