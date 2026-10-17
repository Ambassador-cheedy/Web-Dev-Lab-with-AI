import type { Metadata } from 'next';
import { TextPage } from '@/components/ui/TextPage';

export const metadata: Metadata = { title: 'Delivery & returns', description: 'Complimentary UK delivery, 30-day returns and lifetime alterations on made-to-measure.', alternates: { canonical: '/delivery-returns' } };

export default function DeliveryPage() {
  return (
    <TextPage eyebrow="Client services" title="Delivery & returns" intro="Every order is wrapped by hand and sent tracked.">
      <h2>Delivery</h2>
      <ul>
        <li><strong>UK:</strong> complimentary tracked delivery, 2–4 working days. Next-day delivery £15.</li>
        <li><strong>Europe:</strong> £25, 3–6 working days, duties paid.</li>
        <li><strong>Rest of world:</strong> from £35, 4–8 working days. Duties may apply.</li>
        <li><strong>Made to measure:</strong> delivered free worldwide when your piece is finished.</li>
      </ul>
      <h2>Returns</h2>
      <p>
        Return unworn pieces, with their tags, within 30 days for a full refund to your original payment method. UK returns
        are free: request a label from your account or by writing to us. Refunds are made within 5 working days of the
        piece reaching us.
      </p>
      <h2>Made-to-measure pieces</h2>
      <p>
        Because they are made for you alone, made-to-measure pieces cannot be returned. Instead, we alter them free of
        charge until they are right, and for the life of the piece where the change is within the seam allowance.
      </p>
    </TextPage>
  );
}
