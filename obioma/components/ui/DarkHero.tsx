import { EditorialImage } from './EditorialImage';

/** Full-bleed editorial header used on Atelier and Lookbook. */
export function DarkHero({
  image,
  alt,
  eyebrow,
  title,
  children,
}: {
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="bg-obsidian text-ivory relative flex min-h-[78svh] items-end overflow-hidden">
      <EditorialImage
        src={image}
        alt={alt}
        fill
        priority
        sizes="100vw"
        tone="dark"
        className="object-cover opacity-70"
      />
      <div
        aria-hidden="true"
        className="from-obsidian via-obsidian/30 to-obsidian/40 absolute inset-0 bg-linear-to-t"
      />
      <div className="container-luxe relative pt-40 pb-16 sm:pb-24">
        <p className="eyebrow text-gold-light flex items-center gap-3">
          <span aria-hidden="true" className="bg-gold-light h-px w-8" /> {eyebrow}
        </p>
        <h1 className="text-hero mt-6 max-w-4xl font-light">{title}</h1>
        {children && (
          <div className="text-ivory/80 mt-6 max-w-xl text-lg leading-relaxed">{children}</div>
        )}
      </div>
    </section>
  );
}
