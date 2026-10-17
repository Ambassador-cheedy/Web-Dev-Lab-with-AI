import type { Metadata } from 'next';
import { BagView } from '@/components/product/BagView';
import { PageIntro } from '@/components/ui/PageIntro';

export const metadata: Metadata = { title: 'Your bag', robots: { index: false } };

export default function BagPage() {
  return (
    <>
      <PageIntro eyebrow="Shopping bag" title="Your bag" />
      <div className="container-luxe pb-24">
        <BagView />
      </div>
    </>
  );
}
