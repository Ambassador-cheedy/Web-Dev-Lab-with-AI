'use client';

import { useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Horizontal scroller: native swipe on touch, click-and-drag with a mouse, arrow keys when focused. */
export function DragScroller({ children, className, label }: { children: ReactNode; className?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  return (
    <div
      ref={ref}
      role="region"
      aria-label={label}
      tabIndex={0}
      className={cn('no-scrollbar cursor-grab overflow-x-auto overscroll-x-contain active:cursor-grabbing', className)}
      onPointerDown={(e) => {
        if (e.pointerType !== 'mouse' || !ref.current) return;
        drag.current = { x: e.clientX, left: ref.current.scrollLeft, moved: false };
      }}
      onPointerMove={(e) => {
        if (!drag.current || !ref.current) return;
        const dx = e.clientX - drag.current.x;
        if (Math.abs(dx) > 4) drag.current.moved = true;
        ref.current.scrollLeft = drag.current.left - dx;
      }}
      onPointerUp={() => {
        setTimeout(() => (drag.current = null), 0);
      }}
      onPointerLeave={() => (drag.current = null)}
      onClickCapture={(e) => {
        if (drag.current?.moved) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      onDragStart={(e) => e.preventDefault()}
    >
      {children}
    </div>
  );
}
