import type { Metadata } from 'next';
import { PageIntro } from '@/components/ui/PageIntro';
import { FaqList } from '@/components/ui/Faq';
import { faqs } from '@/data/content';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Answers about the Fit Studio, made to measure, delivery and returns.',
  alternates: { canonical: '/faq' },
};

export default function FaqPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.flatMap((g) =>
      g.items.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    ),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <PageIntro eyebrow="Client services" title="Questions, answered" />
      <div className="container-luxe max-w-4xl space-y-16 pb-24">
        {faqs.map((g) => (
          <section key={g.group} aria-labelledby={`faq-${g.group}`}>
            <h2 id={`faq-${g.group}`} className="mb-4 font-serif text-3xl">
              {g.group}
            </h2>
            <FaqList items={g.items} />
          </section>
        ))}
      </div>
    </>
  );
}
