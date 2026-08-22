'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

/* ==========================================================================
   Where you are on the page, as a line down the side.

   Fixed while you scroll, with a champagne thread that fills as the page
   passes beneath it. What makes it read as an instrument rather than a menu
   is that nothing about it snaps: the marker holds a fractional position and
   travels between the marks, stretching a little when you scroll fast and
   settling when you stop; the marks swell as it approaches and subside as it
   leaves; and only the section you are actually in is spelled out, unless you
   put the pointer on the rail, at which point the whole list introduces
   itself.

   It is a position indicator, not a route — the header owns navigation — but
   the marks are still real buttons, because something that shows a position
   and cannot be used to change it is a frustration.

   Hidden below the extra-large breakpoint: on a narrower screen there is no
   margin to put it in without it sitting over the content.
   ========================================================================== */

const sections = [
  { id: 'opening', label: 'סרטון פתיחה' },
  { id: 'film', label: 'המארז' },
  { id: 'inspiration', label: 'השראה' },
  { id: 'builder', label: 'בניית מארז' },
  { id: 'about', label: 'אודותינו' },
  { id: 'visit', label: 'צרו קשר' },
];

export function SectionRail() {
  const listRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);

  /* Only the things that change the tree live in state. Position, stretch and
     dot scale are written straight to style, every frame — routing those
     through React would re-render the whole rail sixty times a second. */
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const list = listRef.current;
    const marker = markerRef.current;
    const fill = fillRef.current;
    if (!list || !marker || !fill) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let frame: number | null = null;
    /* The eased position the marker is actually drawn at, chasing `target`. */
    let drawn = 0;
    let previous = 0;
    let last = 0;

    /* Centres of the marks, relative to the list. Re-measured on resize, not
       per frame — a getBoundingClientRect per dot per frame is exactly the
       layout thrash this is supposed to avoid. */
    let centres: number[] = [];
    let extent = 0;

    const measureDots = () => {
      const base = list.getBoundingClientRect().top;
      centres = dotRefs.current.map((dot) => {
        if (!dot) return 0;
        const rect = dot.getBoundingClientRect();
        return rect.top - base + rect.height / 2;
      });
      extent = centres.length ? centres[centres.length - 1] - centres[0] : 0;
    };

    /* Two different numbers. `index` is the section you are in, which names
       the label; `fraction` adds how far through it you are, which is where
       the marker rides. Half a viewport into the opening is still the
       opening, even though the marker has already set off for the next mark. */
    const measurePosition = () => {
      const middle = window.scrollY + window.innerHeight / 2;
      const nodes = sections.map((s) => document.getElementById(s.id));

      let index = 0;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node && node.offsetTop <= middle) index = i;
      }

      const current = nodes[index];
      if (!current) return { index: 0, fraction: 0 };

      const within = current.offsetHeight
        ? (middle - current.offsetTop) / current.offsetHeight
        : 0;
      const fraction = Math.max(
        0,
        Math.min(sections.length - 1, index + Math.max(0, Math.min(1, within)))
      );
      return { index, fraction };
    };

    const paint = (now: number) => {
      frame = null;
      const { index, fraction: target } = measurePosition();

      /* Chase rather than jump. The lerp is what turns a scroll into a glide. */
      drawn += (target - drawn) * (reduce ? 1 : 0.16);
      if (Math.abs(target - drawn) < 0.002) drawn = target;

      if (!centres.length) measureDots();

      const y = centres[0] + (drawn / (sections.length - 1 || 1)) * extent;

      /* Squash and stretch: the faster it is travelling, the longer and
         thinner the marker gets, the way a real moving thing would blur. */
      const dt = Math.max(16, now - last);
      last = now;
      const velocity = Math.abs(drawn - previous) / (dt / 16);
      previous = drawn;
      const stretch = reduce ? 1 : Math.min(3.4, 1 + velocity * 9);

      marker.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) scaleY(${stretch.toFixed(2)})`;
      marker.style.opacity = String(Math.min(1, 0.55 + velocity * 6));

      fill.style.height = `${((drawn / (sections.length - 1 || 1)) * 100).toFixed(1)}%`;

      /* Marks swell as the marker nears them and subside as it leaves. */
      dotRefs.current.forEach((dot, i) => {
        if (!dot) return;
        const distance = Math.abs(drawn - i);
        const near = Math.max(0, 1 - distance);
        dot.style.transform = `scale(${(1 + near * 0.55).toFixed(3)})`;
      });

      setActive((prev) => (prev === index ? prev : index));

      /* Keep running while there is still travel left in the lerp. */
      if (drawn !== target) frame = requestAnimationFrame(paint);
    };

    const request = () => {
      if (frame === null) frame = requestAnimationFrame(paint);
    };

    measureDots();
    drawn = measurePosition().fraction;
    previous = drawn;
    request();

    const onResize = () => {
      measureDots();
      request();
    };

    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const go = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ block: 'start' });
  }, []);

  /* The opening and the basket film are both footage; the cream sections are
     not. The rail changes coat rather than sitting unreadable over one. */
  const onFilm = active <= 1;

  return (
    <div
      aria-hidden="true"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={cn(
        'pointer-events-none fixed end-4 top-1/2 z-30 hidden -translate-y-1/2 xl:block',
        'transition-colors duration-500',
        onFilm ? 'text-media-text' : 'text-ink'
      )}
    >
      {/* A wider hit area than the marks themselves, so the labels do not
          require aiming at a five-pixel dot. */}
      <div ref={listRef} className="pointer-events-auto relative flex flex-col items-end gap-7 py-2 pe-1 ps-8">
        <span
          className={cn(
            'absolute inset-y-0 end-[5px] w-px transition-colors duration-500',
            onFilm ? 'bg-white/25' : 'bg-line-strong/50'
          )}
        />
        <span
          ref={fillRef}
          className={cn(
            'absolute top-0 end-[5px] w-px origin-top bg-linear-to-b transition-colors duration-500',
            onFilm ? 'from-gold-lit/70 to-gold' : 'from-gold-soft to-gold-deep'
          )}
        />

        {/* The travelling marker. Centred on the thread and drawn above it. */}
        <span
          ref={markerRef}
          className="pointer-events-none absolute end-[2.5px] top-0 -mt-2.5 h-5 w-1.5 rounded-pill bg-gold-lit shadow-[0_0_12px_rgba(220,189,133,0.9)] will-change-transform"
        />

        {sections.map((section, index) => {
          const isActive = index === active;
          return (
            <button
              key={section.id}
              type="button"
              tabIndex={-1}
              onClick={() => go(section.id)}
              className="group relative flex cursor-pointer items-center justify-end gap-3"
            >
              <span
                className={cn(
                  'whitespace-nowrap text-[0.8125rem] transition-[opacity,transform,color] duration-300 ease-out-soft',
                  isActive || hovering
                    ? 'translate-x-0 opacity-100'
                    : 'translate-x-1.5 opacity-0',
                  isActive ? 'font-semibold' : 'font-normal',
                  isActive
                    ? onFilm
                      ? 'text-media-text'
                      : 'text-ink'
                    : onFilm
                      ? 'text-media-muted'
                      : 'text-ink-muted',
                  onFilm && 'drop-shadow-[0_1px_8px_rgba(20,16,20,0.9)]'
                )}
                /* Under a hover the list introduces itself top to bottom
                   rather than all at once. */
                style={{ transitionDelay: hovering && !isActive ? `${index * 40}ms` : '0ms' }}
              >
                {section.label}
              </span>

              <span
                ref={(node) => {
                  dotRefs.current[index] = node;
                }}
                className="flex size-[11px] items-center justify-center will-change-transform"
              >
                <span
                  className={cn(
                    'size-[5px] rounded-full transition-colors duration-300',
                    /* The mark stays put and stays visible: the marker has
                       usually travelled past it by the time you are properly
                       inside a section, and a hole where the active mark
                       should be reads as a rendering fault. */
                    isActive
                      ? onFilm
                        ? 'bg-gold-lit'
                        : 'bg-gold-deep'
                      : onFilm
                        ? 'bg-white/55 group-hover:bg-gold-lit'
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
