import { cn } from '@/lib/utils';

export function Eyebrow({
  children,
  className,
  rule = false,
}: {
  children: React.ReactNode;
  className?: string;
  rule?: boolean;
}) {
  return (
    <p className={cn('eyebrow flex items-center gap-3', className)}>
      {rule && <span aria-hidden="true" className="h-px w-8 bg-gold" />}
      {children}
    </p>
  );
}
