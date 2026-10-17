import { EditorialImage } from './EditorialImage';

/** Full-bleed editorial header used on Atelier and Lookbook. */
export function DarkHero({ image, alt, eyebrow, title, children }: { image: string; alt: string; eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <section className="relative flex min-h-[78svh] items-end overflow-hidden bg-obsidian text-ivory">
      <EditorialImage src={image} alt={alt} fill priority sizes="100vw" tone="dark" className="object-cover opacity-70" />
      <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-obsidian via-obsidian/30 to-obsidian/40" />
      <div className="container-luxe relative pt-40 pb-16 sm:pb-24">
        <p className="eyebrow flex items-center gap-3 text-gold-light">
          <span aria-hidden="true" className="h-px w-8 bg-gold-light" /> {eyebrow}
        </p>
        <h1 className="mt-6 max-w-4xl text-hero font-light">{title}</h1>
        {children && <div className="mt-6 max-w-xl text-lg leading-relaxed text-ivory/80">{children}</div>}
      </div>
    </section>
  );
}
