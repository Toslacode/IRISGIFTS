'use client';

import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from 'react';

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

/* ==========================================================================
   Word-by-word headline.

   Each word gets its own mask and its own delay, so the line assembles rather
   than appearing. Kept to headlines: the DOM cost is one element per word,
   and a paragraph animated this way reads as a novelty rather than as craft.

   `now` plays on mount (the hero, which is already on screen); otherwise the
   surrounding Reveal's `data-reveal` attribute triggers it on scroll.
   ========================================================================== */

export function SplitWords({
  text,
  now = false,
  className,
}: {
  text: string;
  now?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  /* A class present at first paint transitions nothing — the browser has no
     earlier value to move from. Flipping it later is what makes the words
     actually travel. */
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    /* Watches itself rather than reading an ancestor's reveal state, so a
       heading that happens not to sit inside a Reveal still animates instead
       of staying invisible forever. */
    if (
      now ||
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      const frame = requestAnimationFrame(() => setPlaying(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setPlaying(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -6% 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [now]);

  const words = text.split(' ');

  return (
    <span ref={ref} className={cn('words', playing && 'words-now', className)}>
      {words.map((word, index) => (
        <span
          className="w"
          key={`${word}-${index}`}
          style={{ '--w': index } as React.CSSProperties}
        >
          <span>{word}</span>
          {/* A real space between the masks, so the line still wraps and
              copies as ordinary text. */}
          {index < words.length - 1 ? '\u00a0' : ''}
        </span>
      ))}
    </span>
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
      <h2 className="text-title max-w-3xl">
        <SplitWords text={title} />
      </h2>
      {description && (
        <p className="max-w-2xl text-lg leading-relaxed text-ink-muted">
          {description}
        </p>
      )}
    </Reveal>
  );
}
