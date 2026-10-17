'use client';

import Link from 'next/link';
import type { Product } from '@/lib/catalog/types';
import type { FitReport, SizeResult, ZoneStatus } from '@/lib/fit/types';
import { ZONE_LABELS } from '@/components/product/SizeGuideTable';
import { formatEase, formatLength, type Unit } from '@/lib/units';
import { cn } from '@/lib/utils';
import { buttonClass } from '@/components/ui/Button';

const STATUS_BG: Record<ZoneStatus, string> = {
  tight: 'bg-fit-tight',
  ideal: 'bg-fit-ideal',
  loose: 'bg-fit-loose',
};

export function zoneLine(z: SizeResult['zones'][number], unit: Unit, base: 'womenswear' | 'menswear') {
  const name = z.zone === 'bust' && base === 'menswear' ? 'Chest' : ZONE_LABELS[z.zone].split(' /')[0];
  if (z.zone === 'length') {
    const where = z.hem
      ? z.hem.landmark === 'the floor'
        ? 'touches the floor'
        : Math.abs(z.hem.offset) <= 1
          ? `lands at ${z.hem.landmark}`
          : `falls ${formatLength(Math.abs(z.hem.offset), unit)} ${z.hem.offset > 0 ? 'below' : 'above'} ${z.hem.landmark}`
      : '';
    return { name, verdict: z.label, detail: where };
  }
  return { name, verdict: z.label, detail: `${formatEase(z.ease, unit)} ${z.zone === 'sleeve' || z.zone === 'inseam' ? 'vs your measurement' : 'ease'}` };
}

export function ScoreRing({ score, className }: { score: number; className?: string }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const tone = score >= 80 ? 'var(--color-fit-ideal)' : score >= 60 ? 'var(--color-gold)' : 'var(--color-fit-tight)';
  return (
    <svg viewBox="0 0 64 64" className={cn('h-16 w-16 -rotate-90', className)} aria-hidden="true">
      <circle cx="32" cy="32" r={r} fill="none" stroke="var(--color-sand)" strokeWidth="2" />
      <circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        stroke={tone}
        strokeWidth="2.5"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - score / 100)}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.22,1,0.36,1)' }}
      />
    </svg>
  );
}

type Props = {
  product: Product;
  report: FitReport;
  size: string;
  unit: Unit;
  base: 'womenswear' | 'menswear';
  onMadeToMeasure: () => void;
};

export function FitReportCard({ product, report, size, unit, base, onMadeToMeasure }: Props) {
  const current = report.sizes.find((s) => s.size === size) ?? report.sizes[0]!;
  return (
    <section aria-labelledby="fit-report-title" className="bg-bone p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="fit-report-title" className="eyebrow text-stone-deep">
            Recommended size
          </h2>
          <p className="mt-1 font-serif text-7xl leading-none font-light" aria-live="polite">
            {report.suggestMadeToMeasure ? '—' : report.recommendedSize}
          </p>
        </div>
        <div className="relative shrink-0 text-center">
          <ScoreRing score={current.score} />
          <span className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg leading-none tabular-nums">{current.score}</span>
            <span className="text-[0.55rem] tracking-widest text-stone-deep uppercase">fit</span>
          </span>
        </div>
      </div>
      <p className="mt-4 font-serif text-xl leading-snug italic" aria-live="polite">
        {report.summary}
      </p>

      <h3 className="eyebrow mt-6 mb-2 text-stone-deep">
        Size {current.size} on you <span className="sr-only">: fit score {current.score} out of 100</span>
      </h3>
      <ul className="divide-y divide-sand/80">
        {current.zones.map((z) => {
          const line = zoneLine(z, unit, base);
          return (
            <li key={z.zone} className="flex items-center gap-3 py-2.5 text-sm">
              <span aria-hidden="true" className={cn('h-2.5 w-2.5 shrink-0 rounded-full', STATUS_BG[z.status])} />
              <span className="w-20 shrink-0 font-medium">{line.name}</span>
              <span className="flex-1">
                {line.verdict}
                <span className="text-stone-deep"> · {line.detail}</span>
                {z.estimated && <span className="text-stone-deep"> (estimated)</span>}
              </span>
            </li>
          );
        })}
      </ul>

      {report.suggestMadeToMeasure && (
        <div className="mt-6 bg-oxblood p-5 text-ivory">
          <p className="font-serif text-xl">This piece would fit you best made to measure.</p>
          <p className="mt-2 text-sm text-ivory/80">
            We will cut it from your measurements, so every zone sits as it was designed to.
          </p>
          {product.madeToMeasure ? (
            <button type="button" onClick={onMadeToMeasure} className={buttonClass('light', 'mt-4 w-full')}>
              Order made to measure
            </button>
          ) : (
            <Link href="/made-to-measure" className={buttonClass('light', 'mt-4 w-full')}>
              Ask about a bespoke piece
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
