'use client';

import { useEffect, useRef, useState } from 'react';

import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { SplitWords } from '@/components/ui/Reveal';

/* ==========================================================================
   The opening film, driven by the scroll.

   The shop's own footage — a couple under warm bokeh, hands meeting, the ring
   going on — cut into a frame sequence and drawn to a canvas. The visitor
   scrubs it: scrolling forward advances the film, scrolling back rewinds it.
   That is the whole first screen, so it has to feel like a film the page is
   playing rather than a video someone pasted in.

   Why frames and not a <video>: seeking a compressed video by scroll position
   stalls on every keyframe boundary, and on iOS it barely works at all. A
   sequence of stills has no seek cost — each scroll position is just the next
   drawImage.

   The warm, dark footage sits above a cream page, so the treatment runs the
   other way from the rest of the site: light type on the film, and a scrim
   that dissolves the last stretch into the ivory ground rather than cutting.
   ========================================================================== */

/* Kept in step with public/frames/manifest.json by the media script; this is
   only the value used before the manifest lands. */
const FALLBACK_COUNT = 80;

interface Manifest {
  count: number;
}

export function Opening() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /* Drives the copy out of the way over the last stretch, so the film gets
     the screen to itself before the page continues. */
  const [exit, setExit] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let count = FALLBACK_COUNT;
    let frames: HTMLImageElement[] = new Array(count);
    let current = -1;
    let shown = 0;
    let running = false;
    let raf = 0;
    let cancelled = false;

    const src = (i: number) => {
      /* The inlined preview swaps the whole set in as data URIs. */
      const inlined = (window as unknown as { __IRIS_FRAMES__?: string[] })
        .__IRIS_FRAMES__;
      if (inlined) return inlined[i];
      return `/frames/frame-${String(i).padStart(3, '0')}.webp`;
    };

    /* Cover-fit. The backing store is sized to the display box times DPR —
       a fixed width/height stretches a small buffer across the screen and
       reads as "low quality video" no matter how good the frames are. */
    function draw(value: number) {
      const i = Math.max(0, Math.min(count - 1, Math.round(value)));
      if (i === current) return;
      const image = frames[i];
      if (!image || !image.complete || !image.naturalWidth) return;
      current = i;
      const scale = Math.max(
        canvas!.width / image.naturalWidth,
        canvas!.height / image.naturalHeight
      );
      const w = image.naturalWidth * scale;
      const h = image.naturalHeight * scale;
      context!.drawImage(image, (canvas!.width - w) / 2, (canvas!.height - h) / 2, w, h);
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas!.clientWidth * dpr);
      const h = Math.round(canvas!.clientHeight * dpr);
      if (!w || !h || (w === canvas!.width && h === canvas!.height)) return;
      canvas!.width = w;
      canvas!.height = h;
      current = -1; /* the buffer was cleared */
      draw(shown);
    }

    /* Every fourth frame first, then the rest. The scrub becomes usable after
       about a fifth of the bytes; the gaps fill in behind it. */
    function load() {
      const order: number[] = [];
      for (let i = 0; i < count; i += 4) order.push(i);
      for (let i = 0; i < count; i++) if (i % 4 !== 0) order.push(i);

      for (const i of order) {
        if (frames[i]) continue;
        const image = new Image();
        image.decoding = 'async';
        if (i === 0) image.onload = () => draw(0);
        image.src = src(i);
        frames[i] = image;
      }
    }

    function progress() {
      const rect = section!.getBoundingClientRect();
      const runway = rect.height - window.innerHeight;
      if (runway <= 0) return 0;
      return Math.max(0, Math.min(1, -rect.top / runway));
    }

    function tick() {
      const p = progress();
      const target = p * (count - 1);
      /* Lerp, so a flick of the wheel arrives as a glide rather than a jump. */
      shown += (target - shown) * 0.18;
      if (Math.abs(target - shown) < 0.4) shown = target;
      draw(shown);
      /* Copy holds until three quarters through, then clears the frame. */
      setExit(p < 0.72 ? 0 : Math.min(1, (p - 0.72) / 0.22));
      if (running) raf = requestAnimationFrame(tick);
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    /* The count lives with the files, not in this component. */
    fetch('/frames/manifest.json')
      .then((r) => (r.ok ? (r.json() as Promise<Manifest>) : null))
      .then((m) => {
        if (cancelled || !m?.count || m.count === count) return;
        count = m.count;
        frames = new Array(count);
        current = -1;
        if (reduce) still();
        else load();
      })
      .catch(() => {});

    function still() {
      const image = new Image();
      image.onload = () => {
        frames[count - 1] = image;
        shown = count - 1;
        current = -1;
        draw(shown);
      };
      image.src = src(count - 1);
    }

    if (reduce) {
      /* No scrub: one frame of the moment the film is about. */
      still();
      return () => {
        cancelled = true;
        observer.disconnect();
      };
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            load();
            if (!running) {
              running = true;
              raf = requestAnimationFrame(tick);
            }
          } else if (running) {
            running = false;
            cancelAnimationFrame(raf);
          }
        }
      },
      { rootMargin: '60% 0px 60% 0px' }
    );
    io.observe(section);

    return () => {
      cancelled = true;
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="opening"
      aria-label="סרטון הפתיחה של איריס מתנות"
      /* The runway the film plays across. Shorter on phones, where a scroll
         gesture covers far more of the page per flick.

         Pulled up under the sticky header so the film starts at the very top
         of the window — in flow it would begin below the bar and leave a
         cream strip above it, which is exactly the pasted-in look. */
      className="relative -mt-(--nav-h) h-[calc(240vh+var(--nav-h))] motion-reduce:h-dvh sm:h-[calc(300vh+var(--nav-h))]"
    >
      <div className="sticky top-0 h-dvh overflow-hidden bg-[#141014]">
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="block size-full"
          /* Sharpened frames on a warm-gold set; a touch off full saturation
             keeps the bokeh from going orange against the champagne. */
          style={{ filter: 'saturate(0.94) contrast(1.03)' }}
        />

        {/* Legibility, and the seam. The last band is the page's own ivory,
            so the film dissolves into the section below instead of ending. */}
        {/* Legibility, and the seam. The middle stays clear so the film is the
            film; the weight sits at the foot where the copy lives, and the
            last band is the page's own ivory, so the film dissolves into the
            section below instead of stopping at an edge. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(20,16,20,0.46)_0%,rgba(20,16,20,0.12)_22%,rgba(20,16,20,0.10)_44%,rgba(20,16,20,0.62)_74%,rgba(20,16,20,0.86)_90%,var(--color-canvas)_100%)]"
        />

        {/* The copy sits in the lower third rather than the middle. The shop's
            own mark and its caption are burned into the top and right of the
            footage, and a centred headline runs straight through them — two
            sets of type fighting over one frame is the surest way to make a
            film look pasted onto a page. */}
        <div
          className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 px-5 pb-20 text-center sm:gap-5 sm:pb-24"
          style={{
            opacity: 1 - exit,
            transform: `translate3d(0, ${-exit * 40}px, 0)`,
            pointerEvents: exit > 0.6 ? 'none' : undefined,
          }}
        >
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

        {/* Says the film answers to the scroll — the one thing a still frame
            cannot communicate on its own. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 transition-opacity duration-500"
          style={{ opacity: 1 - exit }}
        >
          <span className="flex h-11 w-7 items-start justify-center rounded-pill border border-gold-soft/60 bg-white/10 pt-2 backdrop-blur-[2px]">
            <span className="block size-1.5 rounded-full bg-gold-soft motion-safe:animate-[iris-float_2.4s_ease-in-out_infinite]" />
          </span>
        </div>
      </div>
    </section>
  );
}
