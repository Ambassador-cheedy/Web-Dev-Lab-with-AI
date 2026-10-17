import type { Metadata } from 'next';
import { TextPage } from '@/components/ui/TextPage';

export const metadata: Metadata = { title: 'Cookies', alternates: { canonical: '/cookies' } };

export default function CookiesPage() {
  return (
    <TextPage eyebrow="Legal" title="Cookies" updated="17 October 2026" intro="What we store in your browser, and why.">
      <h2>Essential storage</h2>
      <p>These are needed for the site to work and are always on. They live in your browser’s local storage, not as tracking cookies:</p>
      <ul>
        <li><strong>obioma-bag</strong>, <strong>obioma-wishlist</strong>: your shopping bag and wishlist.</li>
        <li><strong>obioma-measurements</strong>, <strong>obioma-looks</strong>: your Fit Studio profiles and saved looks.</li>
        <li><strong>obioma-auth</strong>, <strong>obioma-orders</strong>: your sign-in, orders and requests on this device.</li>
        <li><strong>obioma-consent</strong>: your cookie choice.</li>
      </ul>
      <h2>Analytics (optional)</h2>
      <p>With your permission we would use privacy-friendly analytics to understand which pages are useful. None are installed in this version.</p>
      <h2>Changing your mind</h2>
      <p>Use “Cookie settings” in the footer at any time to choose again.</p>
    </TextPage>
  );
}
