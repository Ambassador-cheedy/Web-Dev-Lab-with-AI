import { PageIntro } from './PageIntro';

export function TextPage({
  eyebrow,
  title,
  intro,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: React.ReactNode;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <PageIntro eyebrow={eyebrow} title={title}>
        {intro}
      </PageIntro>
      <div className="container-luxe pb-24">
        <div className="prose-luxe border-sand text-stone-deep [&_h2]:text-obsidian [&_h3]:text-obsidian [&_strong]:text-obsidian max-w-3xl border-t pt-6 leading-relaxed">
          {updated && <p className="text-xs">Last updated {updated}</p>}
          {children}
        </div>
      </div>
    </>
  );
}
