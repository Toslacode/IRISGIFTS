'use client';

import { useEffect, useRef, useState } from 'react';

import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

/* ==========================================================================
   The opening screen.

   Behind the headline: the studio clip's calm head, slowed and mirrored so it
   loops without a cut — the basket sitting packed, breathing. It bursts open
   in the section below, which gives the page its narrative: closed, then
   scrolled open.

   The footage is a near-white studio set, so the treatment is a light wash
   with ink text rather than the usual dark scrim with white text. A dark
   scrim over this clip would leave a muddy grey band where the mask should
   dissolve into the cream.

   WebM first: some browsers ship no H.264 and would render nothing from the
   mp4 alone. `muted` and `playsinline` are both required for autoplay.
   ========================================================================== */

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const show = () => setReady(true);
    const hide = () => setReady(false);

    /* Already buffered by the time this runs — a cached reload never fires
       `loadeddata`, so the page would sit on the fallback forever. */
    if (video.readyState >= 2) show();

    video.addEventListener('loadeddata', show);
    video.addEventListener('error', hide);

    return () => {
      video.removeEventListener('loadeddata', show);
      video.removeEventListener('error', hide);
    };
  }, []);

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-canvas-deep" aria-hidden="true">
        {/* The designed ground. Stays behind the video so a slow connection
            or a failed source still looks intentional rather than empty. */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_15%,#fdf8f0_0%,#f6ead6_38%,#eddcc2_66%,#e2cdb0_100%)]" />

        <video
          ref={videoRef}
          /* Absolute, like the layers around it: a statically positioned
             video paints *below* its absolutely positioned siblings, so the
             fallback ground would cover the footage entirely. */
          className={`absolute inset-0 size-full object-cover object-center transition-opacity duration-1000 ease-out-soft ${
            ready ? 'opacity-100' : 'opacity-0'
          }`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/video/hero-poster.jpg"
        >
          <source src="/video/hero.webm" type="video/webm" />
          <source src="/video/hero.mp4" type="video/mp4" />
        </video>

        {/* Two layers instead of one heavy wash. A flat scrim strong enough
            to carry ink text would erase the basket entirely, so the frame
            stays mostly clear and only the area behind the copy is lifted. */}

        {/* Two layers, both kept light. The footage is the point, and ink
            text on a near-white set needs far less scrim than white text on
            a dark one — an earlier, heavier wash washed the basket out. */}

        {/* 1. Edge treatment only: a touch at the top, dissolving into the
               page ground at the bottom so the section has no seam. */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(250,246,240,0.38)_0%,rgba(250,246,240,0.06)_24%,transparent_48%,rgba(250,246,240,0.52)_84%,var(--color-canvas)_100%)]" />

        {/* 2. A feathered bloom behind the copy. Enough to hold the type off
               the lace detail, not enough to flatten the set. */}
        <div className="absolute inset-0 bg-[radial-gradient(56%_44%_at_50%_52%,rgba(250,246,240,0.74)_0%,rgba(250,246,240,0.52)_44%,rgba(250,246,240,0.18)_74%,transparent_100%)]" />
      </div>

      {/* Short of full height on phones: a hero that fills the screen edge
          to edge hides the fact that anything follows it. */}
      <div className="shell flex min-h-[min(86dvh,calc(100dvh-var(--nav-h)))] flex-col items-center justify-center gap-7 py-20 text-center sm:min-h-[calc(100dvh-var(--nav-h))] sm:gap-8 sm:py-24">
        <span
          className="anim-fade eyebrow"
          style={{ '--d': 0 } as React.CSSProperties}
        >
          מארזי מתנה בהתאמה אישית
        </span>

        <h1
          className="anim-rise text-display max-w-4xl text-ink"
          style={{ '--d': 1 } as React.CSSProperties}
        >
          המתנה המושלמת מתחילה כאן
        </h1>

        <p
          className="anim-rise max-w-xl text-lg font-medium leading-relaxed text-ink sm:text-xl"
          style={{ '--d': 2 } as React.CSSProperties}
        >
          בואו נרכיב יחד מארז שמתאים בדיוק למי שאתם רוצים לשמח
        </p>

        <div
          className="anim-rise flex flex-col gap-3 sm:flex-row"
          style={{ '--d': 3 } as React.CSSProperties}
        >
          {/* Same page — this drops the customer straight into question one. */}
          <ButtonLink href="#builder" size="lg">
            בואו נבנה מארז
            <Icon name="arrow-left" size={18} />
          </ButtonLink>
        </div>
      </div>

      {/* Scroll cue — decorative, so it is hidden from the accessibility tree */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-7 left-1/2 -translate-x-1/2 motion-safe:animate-[iris-float_2.6s_ease-in-out_infinite]"
      >
        <span className="flex h-11 w-7 items-start justify-center rounded-pill border border-gold/50 bg-canvas/40 pt-2 backdrop-blur-[2px]">
          <span className="block size-1.5 rounded-full bg-gold-deep/70" />
        </span>
      </div>
    </section>
  );
}
