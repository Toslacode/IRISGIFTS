'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

/* ==========================================================================
   Where you are on the page, as a line down the side.

   Fixed while you scroll, with a champagne thread that fills as the page
   passes beneath it and a dot that travels to whichever section you are in.
   The label of the active section is the only one spelled out; the rest stay
   as marks, so the rail reads as a progress indicator rather than a second
   navigation.

   It is a convenience, not a route — the header owns navigation — but the
   marks are still real buttons, because something that shows a position and
   cannot be used to change it is a frustration.

   Hidden below the large breakpoint: on a phone there is no margin to put it
   in without it sitting over the content.
   ========================================================================== */

const sections = [
  { id: 'opening', label: 'סרטון פתיחה' },
  { id: 'inspiration', label: 'השראה' },
  { id: 'builder', label: 'בניית מארז' },
  { id: 'about', label: 'אודותינו' },
  { id: 'visit', label: 'צרו קשר' },
];

export function SectionRail() {
  const [active, setActive] = useState(0);
  /* 0 at the top of the first section, 1 at the end of the last. Drives the
     thread and the dot, so both move with the scroll rather than snapping
     between sections. */
  const [progress, setProgress] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const measure = () => {
      frame.current = null;

      const nodes = sections.map((s) => document.getElementById(s.id));
      const middle = window.scrollY + window.innerHeight / 2;

      /* The last section whose top the viewport's middle has passed. */
      let index = 0;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node && node.offsetTop <= middle) index = i;
      }
      setActive(index);

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!first || !last) return;

      const start = first.offsetTop;
      const end = last.offsetTop + last.offsetHeight;
      const span = end - start;
      if (span <= 0) return;
      setProgress(Math.max(0, Math.min(1, (middle - start) / span)));
    };

    const request = () => {
      if (frame.current === null) frame.current = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request, { passive: true });
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
    };
  }, []);

  const go = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ block: 'start' });

  /* The opening is dark footage and everything after it is cream, so the rail
     has to change coat rather than sit unreadable over one of them. */
  const onFilm = active === 0;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed end-5 top-1/2 z-30 hidden -translate-y-1/2 xl:block"
    >
      <div className="relative flex flex-col items-end gap-7 py-2">
        {/* The thread. A hairline the full height, with the travelled part
            drawn over it in champagne. */}
        <span
          className={cn(
            'absolute inset-y-0 end-[5px] w-px transition-colors duration-500',
            onFilm ? 'bg-white/25' : 'bg-line-strong/50'
          )}
        />
        <span
          className={cn(
            'absolute top-0 end-[5px] w-px origin-top bg-linear-to-b transition-colors duration-500',
            onFilm ? 'from-gold-lit to-gold' : 'from-gold-soft to-gold-deep'
          )}
          style={{ height: `${progress * 100}%` }}
        />

        {sections.map((section, index) => {
          const isActive = index === active;
          return (
            <button
              key={section.id}
              type="button"
              tabIndex={-1}
              onClick={() => go(section.id)}
              className="pointer-events-auto group relative flex cursor-pointer items-center justify-end gap-3"
            >
              {/* The label only exists for the section you are in; the others
                  arrive on hover so the rail stays quiet. */}
              <span
                className={cn(
                  'whitespace-nowrap text-[0.8125rem] transition-[opacity,transform] duration-400 ease-out-soft',
                  isActive ? 'translate-x-0 font-semibold opacity-100' : 'translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100',
                  onFilm
                    ? 'text-media-text drop-shadow-[0_1px_8px_rgba(20,16,20,0.9)]'
                    : isActive
                      ? 'text-ink'
                      : 'text-ink-muted'
                )}
              >
                {section.label}
              </span>

              <span className="relative flex size-[11px] items-center justify-center">
                {/* A ring that opens up around the active mark. */}
                <span
                  className={cn(
                    'absolute inset-0 rounded-full border transition-[opacity,transform] duration-400 ease-out-soft',
                    onFilm ? 'border-gold-lit' : 'border-gold',
                    isActive ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                  )}
                />
                <span
                  className={cn(
                    'rounded-full transition-[background-color,width,height] duration-300 ease-out-soft',
                    'size-[5px]',
                    isActive
                      ? onFilm
                        ? 'bg-gold-lit'
                        : 'bg-gold-deep'
                      : onFilm
                        ? 'bg-white/45 group-hover:bg-gold-lit'
                        : 'bg-line-strong group-hover:bg-gold'
                  )}
                />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
