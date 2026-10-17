import type { Metadata } from 'next';
import { PageIntro } from '@/components/ui/PageIntro';
import { BodySizeChart } from '@/components/product/BodySizeChart';
import { ButtonLink } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Size guide',
  description: 'Obioma UK size charts for womenswear and menswear.',
  alternates: { canonical: '/size-guide' },
};

export default function SizeGuidePage() {
  return (
    <>
      <PageIntro eyebrow="Client services" title="Size guide">
        These are body measurements for our standard sizes. Each product page also lists the
        finished garment measurements, and the Fit Studio compares them with yours, zone by zone.
      </PageIntro>
      <div className="container-luxe max-w-5xl pb-24">
        <BodySizeChart />
        <div className="mt-16 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/fit-studio">Find my size in the Fit Studio</ButtonLink>
          <ButtonLink href="/how-to-measure" variant="secondary">
            How to measure
          </ButtonLink>
        </div>
      </div>
    </>
  );
}
