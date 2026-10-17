'use client';

import { useMeasurements } from '@/lib/store/measurements';
import { toDisplay } from '@/lib/units';
import { UnitToggle } from '@/components/ui/UnitToggle';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const CHARTS = {
  Womenswear: {
    uk: ['6', '8–10', '12', '14–16', '18', '20'],
    rows: { Bust: [80, 86, 92, 99, 106, 113], Waist: [62, 68, 74, 81, 88, 95], Hips: [87, 93, 99, 106, 113, 120] },
  },
  Menswear: {
    uk: ['34', '36', '38–40', '42', '44', '46'],
    rows: { Chest: [86, 92, 98, 104, 110, 116], Waist: [72, 78, 84, 90, 96, 102], Hips: [88, 94, 100, 106, 112, 118] },
  },
};

export function BodySizeChart() {
  const unit = useMeasurements((s) => s.unit);
  const setUnit = useMeasurements((s) => s.setUnit);
  return (
    <div className="space-y-12">
      <div className="flex justify-end">
        <UnitToggle unit={unit} onChange={setUnit} />
      </div>
      {Object.entries(CHARTS).map(([name, chart]) => (
        <div key={name} className="overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
            <caption className="mb-4 text-left font-serif text-2xl text-obsidian">
              {name} <span className="font-sans text-xs text-stone-deep">body measurements, {unit}</span>
            </caption>
            <thead>
              <tr className="border-b border-obsidian">
                <th scope="col" className="py-3 pr-4 font-medium">Size</th>
                {SIZES.map((s) => (
                  <th key={s} scope="col" className="py-3 pr-4 font-medium">{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-sand">
                <th scope="row" className="py-3 pr-4 font-medium">UK</th>
                {chart.uk.map((u) => (
                  <td key={u} className="py-3 pr-4">{u}</td>
                ))}
              </tr>
              {Object.entries(chart.rows).map(([label, values]) => (
                <tr key={label} className="border-b border-sand">
                  <th scope="row" className="py-3 pr-4 font-medium">{label}</th>
                  {values.map((v, i) => (
                    <td key={i} className="py-3 pr-4 tabular-nums">{toDisplay(v, unit, unit === 'cm' ? 0 : 1)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
