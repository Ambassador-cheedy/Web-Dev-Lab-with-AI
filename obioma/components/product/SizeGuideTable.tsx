'use client';

import type { Product } from '@/lib/catalog/types';
import type { Zone } from '@/lib/fit/types';
import { useMeasurements } from '@/lib/store/measurements';
import { toDisplay } from '@/lib/units';
import { UnitToggle } from '@/components/ui/UnitToggle';

export const ZONE_LABELS: Record<Zone, string> = {
  shoulder: 'Shoulder',
  bust: 'Bust / chest',
  waist: 'Waist',
  hip: 'Hip',
  length: 'Length',
  sleeve: 'Sleeve',
  inseam: 'Inseam',
};

const ORDER: Zone[] = ['shoulder', 'bust', 'waist', 'hip', 'sleeve', 'length', 'inseam'];

export function SizeGuideTable({ product }: { product: Product }) {
  const unit = useMeasurements((s) => s.unit);
  const setUnit = useMeasurements((s) => s.setUnit);
  const sizes = product.fitStudio.sizes;
  const zones = ORDER.filter((z) => sizes.some((s) => s.measurements[z] != null));
  const lengthNote =
    product.fitStudio.garmentType === 'skirt' ? 'Length is measured from the waist.' : 'Length is measured from the high point of the shoulder.';
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-xs">Garment measurements ({unit})</p>
        <UnitToggle unit={unit} onChange={setUnit} />
      </div>
      <div className="-mx-1 overflow-x-auto px-1">
        <table className="w-full min-w-[22rem] border-collapse text-left text-sm">
          <caption className="sr-only">Garment measurements for {product.name} in {unit}</caption>
          <thead>
            <tr className="border-b border-sand">
              <th scope="col" className="py-2 pr-3 font-medium text-obsidian">Size</th>
              {zones.map((z) => (
                <th key={z} scope="col" className="py-2 pr-3 font-medium text-obsidian">
                  {ZONE_LABELS[z]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sizes.map((s) => (
              <tr key={s.label} className="border-b border-sand/60">
                <th scope="row" className="py-2 pr-3 font-medium text-obsidian">{s.label}</th>
                {zones.map((z) => (
                  <td key={z} className="py-2 pr-3 tabular-nums">
                    {s.measurements[z] != null ? toDisplay(s.measurements[z]!, unit) : '–'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs">
        These are measurements of the finished garment, not body measurements. {zones.includes('length') && lengthNote} For a
        personal recommendation, use the Fit Studio.
      </p>
    </div>
  );
}
