import type { MeasurementKey } from '@/lib/fit/measurements';

/**
 * Small line drawing showing where to take a measurement. A simplified figure
 * in sand with the tape position drawn in gold.
 */
const TAPES: Record<MeasurementKey, React.ReactNode> = {
  height: (
    <>
      <line x1="92" y1="8" x2="92" y2="192" />
      <path d="M86 8h12M86 192h12" />
    </>
  ),
  bust: <ellipse cx="50" cy="62" rx="22" ry="4" />,
  waist: <ellipse cx="50" cy="80" rx="16" ry="3.5" />,
  hip: <ellipse cx="50" cy="98" rx="23" ry="4" />,
  shoulder: <path d="M28 46 Q50 41 72 46" />,
  arm: <path d="M74 47 L82 78 L86 108" />,
  inseam: <line x1="54" y1="112" x2="58" y2="190" />,
  neck: <ellipse cx="50" cy="36" rx="7" ry="2.5" />,
  thigh: <ellipse cx="60" cy="118" rx="10" ry="3" />,
  upperArm: <ellipse cx="77" cy="62" rx="6" ry="2.5" />,
};

export function MeasureIllustration({
  field,
  className,
}: {
  field: MeasurementKey;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 100 200" className={className} aria-hidden="true">
      <g fill="var(--color-bone)" stroke="var(--color-sand)" strokeWidth="1">
        <ellipse cx="50" cy="20" rx="9" ry="12" />
        <path d="M44 32h12l2 10 16 4 8 30 6 32-6 2-8-30-4-12 2 34 6 6-2 82h-10l-4-74-4 74H43l-2-82 6-6 2-34-4 12-8 30-6-2 6-32 8-30 16-4z" />
      </g>
      <g fill="none" stroke="var(--color-gold)" strokeWidth="2" strokeLinecap="round">
        {TAPES[field]}
      </g>
    </svg>
  );
}
