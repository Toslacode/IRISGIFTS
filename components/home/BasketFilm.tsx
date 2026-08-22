'use client';

import { useEffect, useRef, useState } from 'react';

import { Reveal, SplitWords } from '@/components/ui/Reveal';

/* ==========================================================================
   The basket, opening.

   A second, quieter film under the opening: a bridal basket packed, bursting
   open, and settling back — slowed and mirrored by the media script so the
   loop closes on itself with no cut. Where the opening is the occasion, this
   is the work, and it is the last thing the visitor sees before the first
   question.

   It only starts once it is on screen, and stops again when it is not: a
   video decoding behind three sections of scroll costs battery for something
   nobody is looking at.
   ========================================================================== */

export function BasketFilm() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    const show = () => setReady(true);
    if (video.readyState >= 2) show();
    video.addEventListener('loadeddata', show);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) video.play().catch(() => {});
          else video.pause();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(section);

    return () => {
      observer.disconnect();
      video.removeEventListener('loadeddata', show);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="film"
      aria-label="מארז נפתח — סרטון מהחנות"
      className="relative isolate overflow-hidden bg-canvas-deep"
    >
      <div className="relative h-[60vh] min-h-[22rem] w-full sm:h-[68vh] sm:min-h-[28rem]">
        <video
          ref={videoRef}
          className={`absolute inset-0 size-full object-cover object-center transition-opacity duration-1000 ease-out-soft ${
            ready ? 'opacity-100' : 'opacity-0'
          }`}
          muted
          loop
          playsInline
          preload="metadata"
          poster="/video/hero-poster.jpg"
        >
          <source src="/video/hero.webm" type="video/webm" />
          <source src="/video/hero.mp4" type="video/mp4" />
        </video>

        {/* A near-white studio set on a cream page wants a light wash and ink
            type, not the dark scrim the opening needs — a dark scrim here
            leaves a muddy grey band where the edges should dissolve. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,var(--color-canvas)_0%,rgba(250,246,240,0.35)_14%,rgba(250,246,240,0.06)_38%,rgba(250,246,240,0.72)_78%,rgba(250,246,240,0.94)_92%,var(--color-canvas)_100%)]"
        />

        {/* The basket sits dead centre of the frame, so the copy sits under
            it rather than across it — and the band above carries the weight
            the ink type needs to hold on a near-white set. */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 px-5 pb-10 text-center sm:pb-14">
          <Reveal className="flex flex-col items-center gap-2">
            <span className="eyebrow">מה שנכנס פנימה</span>
            <h2 className="font-display text-[1.75rem] font-semibold leading-tight text-ink drop-shadow-[0_1px_14px_rgba(250,246,240,0.9)] sm:text-[2.5rem]">
              <SplitWords text="כל מארז נארז ביד, אצלנו בחנות" />
            </h2>
            <p className="max-w-md text-[0.9375rem] font-medium text-ink-soft drop-shadow-[0_1px_10px_rgba(250,246,240,0.9)] sm:text-[1.0625rem]">
              איריס בוחרת כל פריט, מסדרת ועוטפת — ואז זה יוצא לדרך
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
