import { AccordionItem } from './Accordion';

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="border-sand border-t">
      {items.map((f) => (
        <AccordionItem key={f.q} title={f.q}>
          <p className="max-w-2xl text-base">{f.a}</p>
        </AccordionItem>
      ))}
    </div>
  );
}
