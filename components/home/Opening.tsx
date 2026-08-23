'use client';

import { useEffect, useRef, useState } from 'react';

import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { SplitWords } from '@/components/ui/Reveal';

/* ==========================================================================
   The opening film.

   The shop's own footage — a couple under warm bokeh, hands meeting, the ring
   going on. It starts on its own and runs continuously: the moment it ends it
   begins again, with no pause on the last frame and nothing to drag.

   Two cuts, not one picture cropped harder. A 16:9 frame on a phone held
   upright loses everything but a sliver, so phones get a 4:5 window on the
   hands — which is also the only framing where the mark burned into the
   footage does not end up sliced in half. The choice is made in an effect
   rather than with `<source media>`, which browsers evaluate inconsistently
   and which would have phones downloading the 4.7MB desktop cut.

   The footage is warm and dark above a cream page, so the treatment runs the
   other way from the rest of the site: light type on the film, and a scrim
   that dissolves the foot of it into the ivory ground rather than cutting.
   ========================================================================== */

/* Where the frame is held when `cover` has to crop.

   Horizontally this is the usual centre, and on a phone or a laptop — any
   window narrower than 16:9 — that is the only axis that crops, so nothing
   below changes what those visitors see.

   Vertically it is not the centre, and that is the point. A wide, short window
   — a maximised browser on a 16:10 monitor, say, at about 2.2:1 — crops the
   film top and bottom instead, and a centred crop takes two hundred pixels off
   the top. That drags the mark burned into the footage up behind the sticky
   header, which is exactly the pile the shop asked to be rid of. Holding the
   frame near its top keeps the mark where the film put it, and spends the crop
   on the foot of the picture instead, which is dress and floor.

   Ten per cent rather than zero so the very top of the frame still breathes. */
const FRAMING = { objectPosition: '50% 10%' } as const;

type Cut = 'wide' | 'tall';

export function Opening() {
  const videoRef = useRef<HTMLVideoElement>(null);
  /* null until measured, so nothing is fetched before we know which cut. */
  const [cut, setCut] = useState<Cut | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 40rem)');
    setCut(query.matches ? 'tall' : 'wide');
    /* A rotation or a resize past the breakpoint should get the right cut. */
    const onChange = (event: MediaQueryListEvent) =>
      setCut(event.matches ? 'tall' : 'wide');
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const show = () => setReady(true);
    /* A cached reload never fires `loadeddata`, so check the state we may
       already be in before subscribing. */
    if (video.readyState >= 2) show();
    video.addEventListener('loadeddata', show);
    video.addEventListener('error', () => setReady(false));

    /* Autoplay can still be refused (a data-saver setting, an iOS low-power
       mode). The poster stays up in that case, which is a still of the film
       rather than an empty box. */
    video.play().catch(() => {});

    return () => video.removeEventListener('loadeddata', show);
  }, [cut]);

  return (
    <section
      ref={undefined}
      id="opening"
      aria-label="סרטון הפתיחה של איריס מתנות"
      /* Pulled up under the sticky header so the film starts at the very top
         of the window; in flow it would begin below the bar and leave a cream
         strip above it, which is exactly the pasted-in look. */
      className="relative -mt-(--nav-h) overflow-hidden bg-[#141014]"
    >
      <div className="relative h-dvh min-h-[34rem] w-full">
        {cut && (
          <video
            ref={videoRef}
            key={cut}
            className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ease-out-soft ${
              ready ? 'opacity-100' : 'opacity-0'
            }`}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={`/video/opening-${cut}-poster.jpg`}
            style={{ ...FRAMING, filter: 'saturate(0.94) contrast(1.03)' }}
          >
            <source src={`/video/opening-${cut}.webm`} type="video/webm" />
            <source src={`/video/opening-${cut}.mp4`} type="video/mp4" />
          </video>
        )}

        {/* The poster, held under the video so the first paint is the film
            rather than a black box while the first bytes arrive. */}
        {cut && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/video/opening-${cut}-poster.jpg`}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 -z-10 size-full object-cover"
            style={FRAMING}
          />
        )}

        {/* Legibility and the seam. The middle stays clear so the film is the
            film; the weight sits at the foot where the copy lives. The tail
            is graded rather than cut — running from near-opaque straight to
            ivory in the last tenth leaves a dark bar sitting on top of the
            section below, which is the seam this is meant to remove. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(20,16,20,0.46)_0%,rgba(20,16,20,0.12)_22%,rgba(20,16,20,0.10)_44%,rgba(20,16,20,0.60)_72%,rgba(20,16,20,0.78)_87%,rgba(20,16,20,0.34)_95%,var(--color-canvas)_100%)]"
        />

        {/* The copy sits low: the shop's mark and its caption are burned into
            the top and right of the wide cut, and a centred headline runs
            straight through them. */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 px-5 pb-20 text-center sm:gap-5 sm:pb-24">
          <span className="anim-fade text-[0.8125rem] font-semibold tracking-[0.18em] text-gold-lit drop-shadow-[0_1px_10px_rgba(20,16,20,0.9)]">
            איריס מתנות · קריית אתא
          </span>

          <h1 className="max-w-3xl font-display text-[2rem] font-bold leading-[1.1] text-media-text drop-shadow-[0_2px_20px_rgba(20,16,20,0.8)] sm:text-[3.25rem]">
            <SplitWords now text="המתנה המושלמת מתחילה כאן" />
          </h1>

          <p
            className="anim-rise max-w-lg text-[1.0625rem] leading-relaxed text-media-muted drop-shadow-[0_1px_12px_rgba(20,16,20,0.85)] sm:text-lg"
            style={{ '--d': 2 } as React.CSSProperties}
          >
            בואו נרכיב יחד מארז שמתאים בדיוק למי שאתם רוצים לשמח
          </p>

          <div
            className="anim-rise mt-1 flex flex-col gap-3 sm:flex-row"
            style={{ '--d': 3 } as React.CSSProperties}
          >
            <ButtonLink href="#builder" size="lg">
              בואו נבנה מארז
              <Icon name="arrow-left" size={18} />
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
