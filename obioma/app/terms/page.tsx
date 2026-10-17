import type { Metadata } from 'next';
import { TextPage } from '@/components/ui/TextPage';

export const metadata: Metadata = { title: 'Terms', alternates: { canonical: '/terms' } };

/* Placeholder terms. Replace with terms reviewed by legal counsel. */
export default function TermsPage() {
  return (
    <TextPage eyebrow="Legal" title="Terms of sale" updated="17 October 2026" intro="Placeholder terms for development. To be replaced before launch.">
      <h2>Ordering</h2>
      <p>Your order is an offer to buy. A contract is formed when we email to confirm dispatch. Prices are in pounds sterling and include VAT.</p>
      <h2>The Fit Studio</h2>
      <p>The Fit Studio gives guidance, not a guarantee. The avatar is an illustration based on the measurements you provide. Our returns policy applies to ready-to-wear pieces whatever size you choose.</p>
      <h2>Made to measure</h2>
      <p>Made-to-measure pieces are made to your specification and are excluded from the statutory 14-day cancellation right once cutting has begun. We will alter them free of charge until they fit as agreed.</p>
      <h2>Returns</h2>
      <p>See Delivery &amp; returns. Your statutory rights are not affected.</p>
      <h2>Law</h2>
      <p>These terms are governed by the law of England and Wales.</p>
    </TextPage>
  );
}
