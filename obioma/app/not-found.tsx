import { ButtonLink } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <section className="container-luxe flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow text-stone-deep">404</p>
      <h1 className="text-display mt-4 font-light">This page has been unpicked.</h1>
      <p className="text-stone-deep mt-4">It may have moved, or never existed.</p>
      <ButtonLink href="/collections" className="mt-10">
        Explore the collection
      </ButtonLink>
    </section>
  );
}
