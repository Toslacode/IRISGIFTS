'use client';

import { useEffect, useRef, useState } from 'react';

import { Icon, type IconName } from '@/components/ui/Icon';

/* ==========================================================================
   The scroll-driven opening.

   The visitor drives this section: scrolling advances one continuous
   transformation — the basket opens and its contents rise out.

   Two renderers, one progress value:
   • Frames exist (public/frames/manifest.json, written by `npm run media`)
     → canvas frame-scrub of the real footage.
   • They don't → a composed scene animated off the same 0–1 progress.

   Both are sampled in a rAF loop rather than a scroll listener, which janks.
   ========================================================================== */

/** Where the runway is measured from. 320vh over ~120 frames feels unhurried. */
const RUNWAY = 'h-[320vh]';

interface Manifest {
  count: number;
  pattern: string;
}

export function BasketUnfold() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [checked, setChecked] = useState(false);

  /* Is there real footage to scrub? */
  useEffect(() => {
    let alive = true;

    fetch('/frames/manifest.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Manifest | null) => {
        if (!alive) return;
        if (data && typeof data.count === 'number' && data.count > 1) {
          setManifest(data);
        }
        setChecked(true);
      })
      .catch(() => {
        if (alive) setChecked(true);
      });

    return () => {
      alive = false;
    };
  }, []);

  /* The progress loop, shared by both renderers. */
  useEffect(() => {
    if (!checked) return;

    const section = sectionRef.current;
    const scene = sceneRef.current;
    const canvas = canvasRef.current;
    if (!section) return;

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    /* --- canvas path ---------------------------------------------------- */
    const ctx = canvas?.getContext('2d') ?? null;
    const frameCount = manifest?.count ?? 0;
    const frames: HTMLImageElement[] = new Array(frameCount);
    let current = -1;
    let shown = 0;

    const frameSrc = (i: number) =>
      (manifest?.pattern ?? '/frames/frame-{i}.webp').replace(
        '{i}',
        String(i).padStart(3, '0')
      );

    function draw(value: number) {
      if (!ctx || !canvas || frameCount === 0) return;
      const i = Math.max(0, Math.min(frameCount - 1, Math.round(value)));
      if (i === current) return;
      const img = frames[i];
      if (!img?.complete || !img.naturalWidth) return;
      current = i;

      /* Cover-fit into the backing store, which is sized in `resize()`. */
      const s = Math.max(
        canvas.width / img.naturalWidth,
        canvas.height / img.naturalHeight
      );
      const w = img.naturalWidth * s;
      const h = img.naturalHeight * s;
      ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    }

    /* Backing store at CSS size × DPR. A fixed width/height stretches a small
       buffer across the screen and reads as "low quality footage". */
    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (w === canvas.width && h === canvas.height) return;
      canvas.width = w;
      canvas.height = h;
      current = -1; /* the buffer was cleared — force a redraw */
      draw(shown);
    }

    let loaded = false;
    function loadFrames() {
      if (loaded || frameCount === 0) return;
      loaded = true;
      for (let i = 0; i < frameCount; i += 1) {
        const img = new Image();
        if (i === 0) img.onload = () => draw(0);
        img.src = frameSrc(i);
        frames[i] = img;
      }
    }

    let observer: ResizeObserver | null = null;
    if (canvas && 'ResizeObserver' in window) {
      observer = new ResizeObserver(resize);
      observer.observe(canvas);
    }
    resize();

    /* --- progress ------------------------------------------------------- */
    function progress(): number {
      if (!section) return 0;
      const rect = section.getBoundingClientRect();
      const runway = rect.height - window.innerHeight;
      if (runway <= 0) return 0;
      return Math.max(0, Math.min(1, -rect.top / runway));
    }

    function paintScene(p: number) {
      if (scene) scene.style.setProperty('--p', p.toFixed(4));
    }

    if (reduce) {
      /* One still of the end state, no scrub. */
      paintScene(1);
      if (frameCount > 0) {
        const still = new Image();
        still.onload = () => {
          frames[frameCount - 1] = still;
          shown = frameCount - 1;
          draw(shown);
        };
        still.src = frameSrc(frameCount - 1);
      }
      return () => observer?.disconnect();
    }

    let running = false;
    let rafId = 0;

    function tick() {
      const p = progress();
      paintScene(p);

      if (frameCount > 0) {
        const target = p * (frameCount - 1);
        shown += (target - shown) * 0.2; /* lerp smooths fast scrolling */
        if (Math.abs(target - shown) < 0.4) shown = target;
        draw(shown);
      }

      if (running) rafId = requestAnimationFrame(tick);
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            loadFrames();
            if (!running) {
              running = true;
              rafId = requestAnimationFrame(tick);
            }
          } else if (running) {
            running = false;
            cancelAnimationFrame(rafId);
          }
        }
      },
      { rootMargin: '60% 0px 60% 0px' }
    );

    io.observe(section);

    return () => {
      io.disconnect();
      observer?.disconnect();
      running = false;
      cancelAnimationFrame(rafId);
    };
  }, [checked, manifest]);

  return (
    <section
      ref={sectionRef}
      className={`relative ${RUNWAY} motion-reduce:h-dvh`}
      aria-label="מארז מתנה נפתח, והמוצרים שבתוכו מתגלים"
    >
      <div className="sticky top-0 h-dvh overflow-hidden bg-canvas-deep">
        {manifest ? (
          <canvas ref={canvasRef} className="block size-full media-tone" />
        ) : (
          <UnfoldScene ref={sceneRef} />
        )}

        {/* Fades into the page ground at both edges */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,var(--color-canvas)_0%,transparent_16%,transparent_84%,var(--color-canvas)_100%)]"
        />
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
   The composed scene.

   Every element positions itself from a single `--p` custom property that the
   loop above writes. No per-element JS, no layout thrashing — the browser
   composites transforms and opacity only.
   -------------------------------------------------------------------------- */

const FLOATING: {
  icon: IconName;
  label: string;
  /** Final resting offset, in percentages of the stage. */
  x: number;
  y: number;
  /** When this item starts rising, 0–1 along the runway. */
  start: number;
  size: number;
  tone: string;
  rotate: number;
}[] = [
  { icon: 'robe', label: 'חלוק', x: -30, y: -30, start: 0.30, size: 96, tone: 'bg-pastel-rose', rotate: -8 },
  { icon: 'towel', label: 'מגבות', x: 28, y: -34, start: 0.34, size: 88, tone: 'bg-pastel-sky', rotate: 7 },
  { icon: 'candle', label: 'נר', x: -46, y: -6, start: 0.40, size: 76, tone: 'bg-pastel-sand', rotate: -14 },
  { icon: 'cream', label: 'טיפוח', x: 45, y: -8, start: 0.44, size: 78, tone: 'bg-pastel-mint', rotate: 12 },
  { icon: 'chocolate', label: 'שוקולד', x: -14, y: -52, start: 0.50, size: 70, tone: 'bg-pastel-lilac', rotate: 5 },
  { icon: 'wine', label: 'יין', x: 13, y: -56, start: 0.55, size: 72, tone: 'bg-pastel-sage', rotate: -6 },
];

function UnfoldScene({ ref }: { ref: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      style={{ '--p': 0 } as React.CSSProperties}
      className="relative size-full bg-[radial-gradient(115%_85%_at_50%_38%,#fdf9f2_0%,#f5ecdd_45%,#ecdfc8_100%)]"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative aspect-square w-[min(78vw,30rem)]">
          {/* Halo — widens as the basket opens */}
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.9)_0%,rgba(246,239,225,0)_68%)]"
            style={{
              transform: 'scale(calc(0.6 + var(--p) * 0.75))',
              opacity: 'calc(0.35 + var(--p) * 0.65)',
            }}
          />

          {/* The items, rising out in sequence */}
          {FLOATING.map((item) => (
            <div
              key={item.icon}
              className="absolute left-1/2 top-1/2 flex flex-col items-center gap-2"
              style={
                {
                  /* clamp((p - start) / span, 0, 1) — each item's own 0→1 */
                  '--t': `clamp(0, calc((var(--p) - ${item.start}) / 0.34), 1)`,
                  transform: `translate(-50%, -50%) translate(calc(${item.x} * var(--t) * 1%), calc(${item.y} * var(--t) * 1% + (1 - var(--t)) * 2rem)) rotate(calc(${item.rotate} * var(--t) * 1deg)) scale(calc(0.55 + var(--t) * 0.45))`,
                  opacity: 'var(--t)',
                } as React.CSSProperties
              }
            >
              <span
                className={`flex items-center justify-center rounded-full ${item.tone} shadow-lift ring-1 ring-gold/25`}
                style={{ width: item.size, height: item.size }}
              >
                <Icon
                  name={item.icon}
                  size={item.size * 0.44}
                  strokeWidth={1.1}
                  className="text-ink-soft/75"
                />
              </span>
              <span className="whitespace-nowrap rounded-pill bg-surface/85 px-2.5 py-0.5 text-[0.7rem] font-medium text-ink-muted shadow-soft backdrop-blur-sm">
                {item.label}
              </span>
            </div>
          ))}

          {/* Basket body */}
          <div
            className="absolute inset-x-[16%] bottom-[16%] top-[42%]"
            style={{
              transform: 'translateY(calc(var(--p) * 2%)) scale(calc(1 - var(--p) * 0.04))',
            }}
          >
            <div className="size-full rounded-b-[2.5rem] rounded-t-lg border border-gold-soft bg-[linear-gradient(170deg,#f7efe0_0%,#eadcc2_58%,#dcc9a8_100%)] shadow-lift">
              <div className="mt-5 h-px bg-gold/35" />
              <div className="mt-3 h-px bg-gold/25" />
              <div className="mt-3 h-px bg-gold/15" />
            </div>
          </div>

          {/* Lid — lifts, tilts, and fades as the basket opens */}
          <div
            className="absolute inset-x-[11%] top-[33%] h-[14%]"
            style={{
              '--lid': 'clamp(0, calc((var(--p) - 0.06) / 0.32), 1)',
              transform:
                'translateY(calc(var(--lid) * -170%)) rotate(calc(var(--lid) * -9deg)) scale(calc(1 - var(--lid) * 0.06))',
              opacity: 'calc(1 - var(--lid) * 0.75)',
            } as React.CSSProperties}
          >
            <div className="size-full rounded-card border border-gold-soft bg-[linear-gradient(165deg,#fdf7ea_0%,#efe1c8_100%)] shadow-lift" />
            {/* Ribbon across the lid */}
            <div className="absolute inset-y-0 left-1/2 w-4 -translate-x-1/2 bg-[linear-gradient(180deg,#e0c79b,#c8a86b)] opacity-80" />
          </div>
        </div>
      </div>

      {/* Caption — appears once the basket is meaningfully open */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-[14%] flex justify-center px-6"
        style={{
          '--c': 'clamp(0, calc((var(--p) - 0.55) / 0.3), 1)',
          opacity: 'var(--c)',
          transform: 'translateY(calc((1 - var(--c)) * 1.25rem))',
        } as React.CSSProperties}
      >
        <p className="max-w-md text-center font-display text-xl font-medium text-ink sm:text-2xl">
          כל מארז נבנה מהתחלה — לפי האדם, האירוע והתקציב
        </p>
      </div>
    </div>
  );
}
