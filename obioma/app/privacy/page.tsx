import type { Metadata } from 'next';
import { TextPage } from '@/components/ui/TextPage';

export const metadata: Metadata = { title: 'Privacy', description: 'How Obioma handles your personal data, including body measurements.', alternates: { canonical: '/privacy' } };

/* Plain-English draft for UK GDPR. Review with legal counsel before launch. */
export default function PrivacyPage() {
  return (
    <TextPage eyebrow="Legal" title="Privacy" updated="17 October 2026" intro="In plain English: what we collect, why, and the choices you have.">
      <h2>Who we are</h2>
      <p>Obioma (“we”) is the data controller for personal data collected through this website. Contact our privacy lead at privacy@obioma.example.</p>

      <h2 id="measurements">Your body measurements</h2>
      <p>
        Measurements are personal, and we treat them carefully. <strong>By default they stay on your device.</strong> When you
        use the Fit Studio, your measurements, skin-tone choice and saved looks are stored in your browser’s local storage.
        They are not sent to our servers, and we cannot see them.
      </p>
      <ul>
        <li><strong>Calculating fit happens in your browser.</strong> The size recommendation is worked out on your device.</li>
        <li><strong>Saving to your account</strong> is optional. If you do, we store your measurement profiles with your account so you can use them on other devices.</li>
        <li><strong>Made-to-measure requests</strong> include the profile you choose, so our cutters can make your piece. We use them for that order only.</li>
        <li><strong>We never sell</strong> your measurements, use them for advertising, or share them with anyone except the people making your clothes.</li>
        <li><strong>Deleting them:</strong> use “Delete my measurements” in the Fit Studio or your account. On this device they are removed immediately; for account or made-to-measure data, write to us and we will delete it within 30 days unless we must keep order records by law.</li>
      </ul>
      <p>Our lawful basis is your consent (for storing measurements in your account) and contract (for made-to-measure orders). You can withdraw consent at any time.</p>

      <h2>Other data we collect</h2>
      <ul>
        <li><strong>Orders:</strong> name, address, email and order details, to deliver your purchases (contract). Payments are processed by Stripe; we never see your full card details.</li>
        <li><strong>Newsletter:</strong> your email, only if you subscribe (consent). Unsubscribe from any email.</li>
        <li><strong>Messages and consultations:</strong> what you send us, to reply and book fittings (legitimate interests).</li>
        <li><strong>Analytics:</strong> only if you accept analytics cookies (consent).</li>
      </ul>

      <h2>How long we keep it</h2>
      <p>Order records for six years (UK tax law). Account data until you close your account. Newsletter data until you unsubscribe.</p>

      <h2>Your rights</h2>
      <p>
        Under UK GDPR you can ask to access, correct, delete or export your data, object to or restrict how we use it, and
        withdraw consent. Write to privacy@obioma.example. If you are unhappy with our response, you can complain to the
        Information Commissioner’s Office (ico.org.uk).
      </p>
    </TextPage>
  );
}
