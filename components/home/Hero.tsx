'use client';

import { useEffect, useRef, useState } from 'react';

import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

/* ==========================================================================
   The opening screen.

   A full-bleed ambient loop behind the headline. WebM first — some browsers
   ship no H.264 and would render nothing from the mp4 alone. `muted` and
   `playsinline` are both required for autoplay to be allowed.

   Until the footage exists, `hasVideo` stays false and the section falls back
   to a lit champagne ground that carries the same palette. Drop the files in
   at /public/video and the video takes over with no code change.
   ========================================================================== */

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    /* networkState 3 = NETWORK_NO_SOURCE: nothing playable was found, which
       looks identical to a CSS bug unless we check for it explicitly. */
    const check = () => {
      setHasVideo(video.networkState !== video.NETWORK_NO_SOURCE);
    };

    video.addEventListener('loadeddata', () => setHasVideo(true));
    video.addEventListener('error', () => setHasVideo(false));
    const timer = window.setTimeout(check, 900);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-canvas-deep" aria-hidden="true">
        <video
          ref={videoRef}
          className="size-full object-cover media-tone"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/video/hero-poster.jpg"
        >
          <source src="/video/hero.webm" type="video/webm" />
          <source src="/video/hero.mp4" type="video/mp4" />
        </video>

        {/* The designed fallback: warm light rising through champagne, so an
            absent clip still looks intentional rather than broken. */}
        {!hasVideo && (
          <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_15%,#fdf8f0_0%,#f6ead6_38%,#eddcc2_66%,#e2cdb0_100%)]">
            <div className="absolute inset-0 bg-[conic-gradient(from_210deg_at_50%_45%,transparent_0deg,rgba(255,255,255,0.5)_60deg,transparent_130deg,rgba(200,168,107,0.16)_240deg,transparent_320deg)]" />
          </div>
        )}

        {/* Legibility scrim plus a fade into the page ground at the bottom.
            Lighter over the fallback, which is already pale. */}
        <div
          className={
            hasVideo
              ? 'absolute inset-0 bg-[linear-gradient(to_bottom,rgba(22,25,42,0.34)_0%,rgba(22,25,42,0.18)_42%,var(--color-canvas)_100%)]'
              : 'absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,253,250,0.34)_0%,rgba(255,253,250,0.12)_45%,var(--color-canvas)_100%)]'
          }
        />
      </div>

      <div className="shell flex min-h-[calc(100dvh-var(--nav-h))] flex-col items-center justify-center gap-8 py-24 text-center">
        <span
          className="anim-fade eyebrow"
          style={{ '--d': 0 } as React.CSSProperties}
        >
          מארזי מתנה בהתאמה אישית
        </span>

        <h1
          className={`anim-rise text-display max-w-4xl ${
            hasVideo ? 'text-media-text' : 'text-ink'
          }`}
          style={{ '--d': 1 } as React.CSSProperties}
        >
          המתנה המושלמת מתחילה כאן
        </h1>

        <p
          className={`anim-rise max-w-xl text-lg leading-relaxed sm:text-xl ${
            hasVideo ? 'text-media-muted' : 'text-ink-soft'
          }`}
          style={{ '--d': 2 } as React.CSSProperties}
        >
          אנחנו נעזור לכם להרכיב מארז שמתאים בדיוק לאדם, לאירוע ולתקציב שלכם
        </p>

        <div
          className="anim-rise flex flex-col gap-3 sm:flex-row"
          style={{ '--d': 3 } as React.CSSProperties}
        >
          <ButtonLink href="/build" size="lg">
            בואו נתחיל
            <Icon name="arrow-left" size={18} />
          </ButtonLink>
          <ButtonLink href="/baskets" variant="secondary" size="lg">
            לצפייה במארזים מוכנים
          </ButtonLink>
        </div>
      </div>

      {/* Scroll cue — decorative, so it is hidden from the accessibility tree */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-7 left-1/2 -translate-x-1/2 motion-safe:animate-[iris-float_2.6s_ease-in-out_infinite]"
      >
        <span className="flex h-11 w-7 items-start justify-center rounded-pill border border-gold/50 pt-2">
          <span className="block size-1.5 rounded-full bg-gold-deep/70" />
        </span>
      </div>
    </section>
  );
}
