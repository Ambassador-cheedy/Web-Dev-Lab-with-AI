import { ButtonLink } from '@/components/ui/Button';

export default function Home() {
  return (
    <section className="flex min-h-dvh items-center bg-obsidian text-ivory">
      <div className="container-luxe">
        <p className="eyebrow text-gold-light">Obioma</p>
        <h1 className="mt-6 text-hero font-light">Made for the body you live in.</h1>
        <div className="mt-10 flex gap-4">
          <ButtonLink href="/collections" variant="light">Explore the Collection</ButtonLink>
          <ButtonLink href="/fit-studio" variant="outline-light">Try the Fit Studio</ButtonLink>
        </div>
      </div>
    </section>
  );
}
