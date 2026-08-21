'use client';

import { useEffect, useRef, type ElementType, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

/* ==========================================================================
   Scroll reveal.

   One IntersectionObserver per element, disconnected after it fires — the
   content never animates twice, and nothing keeps observing after it has
   done its job. Under `prefers-reduced-motion` the CSS shows everything
   immediately and this becomes a no-op wrapper.
   ========================================================================== */

interface RevealProps {
  children: ReactNode;
  /** Stagger index — each step delays the reveal by 90ms. */
  delay?: number;
  as?: ElementType;
  className?: string;
}

export function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const show = () => node.setAttribute('data-reveal', 'shown');

    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      show();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            show();
            observer.disconnect();
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal=""
      style={{ '--d': delay } as React.CSSProperties}
      className={className}
    >
      {children}
    </Tag>
  );
}

/** Section heading with an eyebrow, used across the marketing page. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'center' | 'start';
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        'flex flex-col gap-4',
        align === 'center' ? 'items-center text-center' : 'items-start text-start',
        className
      )}
    >
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="text-title max-w-3xl">{title}</h2>
      {description && (
        <p className="max-w-2xl text-lg leading-relaxed text-ink-muted">
          {description}
        </p>
      )}
    </Reveal>
  );
}
