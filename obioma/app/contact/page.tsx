import type { Metadata } from 'next';
import { PageIntro } from '@/components/ui/PageIntro';
import { ContactForm } from '@/components/forms/ContactForm';

export const metadata: Metadata = { title: 'Contact', description: 'Write to Obioma client services, or visit the London studio by appointment.', alternates: { canonical: '/contact' } };

export default function ContactPage() {
  return (
    <>
      <PageIntro eyebrow="Client services" title="We would love to hear from you" />
      <div className="container-luxe grid gap-14 pb-24 lg:grid-cols-[1fr_1.5fr] lg:gap-24">
        <div className="space-y-8 border-t border-sand pt-6 text-sm leading-relaxed">
          <div>
            <h2 className="eyebrow text-stone-deep">Client services</h2>
            <p className="mt-2">
              <a href="mailto:care@obioma.example" className="link-luxe">care@obioma.example</a>
              <br />
              Monday to Saturday, 9:00–18:00 GMT
            </p>
          </div>
          <div>
            <h2 className="eyebrow text-stone-deep">London studio</h2>
            <p className="mt-2">
              By appointment
              <br />
              12 Placeholder Mews, London
            </p>
          </div>
          <div>
            <h2 className="eyebrow text-stone-deep">Lagos atelier</h2>
            <p className="mt-2">Embroidery and ceremonial commissions, by appointment.</p>
          </div>
        </div>
        <ContactForm />
      </div>
    </>
  );
}
