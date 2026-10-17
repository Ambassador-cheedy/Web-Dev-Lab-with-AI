import { Eyebrow } from './Eyebrow';
import { cn } from '@/lib/utils';

export function PageIntro({
  eyebrow,
  title,
  children,
  className,
  align = 'left',
}: {
  eyebrow?: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  align?: 'left' | 'center';
}) {
  return (
    <header
      className={cn(
        'container-luxe pt-12 pb-10 sm:pt-16 lg:pt-20',
        align === 'center' && 'text-center',
        className,
      )}
    >
      {eyebrow && (
        <Eyebrow
          rule={align === 'left'}
          className={cn('text-stone-deep', align === 'center' && 'justify-center')}
        >
          {eyebrow}
        </Eyebrow>
      )}
      <h1 className={cn('text-display mt-5 font-light', align === 'center' && 'mx-auto max-w-4xl')}>
        {title}
      </h1>
      {children && (
        <div
          className={cn(
            'text-stone-deep mt-6 max-w-2xl text-base leading-relaxed sm:text-lg',
            align === 'center' && 'mx-auto',
          )}
        >
          {children}
        </div>
      )}
    </header>
  );
}
