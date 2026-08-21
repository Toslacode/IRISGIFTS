'use client';

import { useEffect, useRef } from 'react';

/* ==========================================================================
   Scroll-linked depth.

   An element gets a `--py` custom property in pixels, running from +strength
   while it is still below the fold to -strength once it has passed above it.
   What to do with that is the element's business, but it should always be a
   transform, so the work stays on the compositor.

   Every subscriber shares one scroll listener and one animation frame — a
   grid of six photographs costs the same as one. Elements far outside the
   viewport are skipped, and the whole thing is inert under
   `prefers-reduced-motion`.
   ========================================================================== */

type Subscriber = { node: HTMLElement; strength: number };

const subscribers = new Set<Subscriber>();
let frame: number | null = null;
let listening = false;

function measure() {
  frame = null;
  const viewport = window.innerHeight;

  for (const { node, strength } of subscribers) {
    const rect = node.getBoundingClientRect();
    if (rect.bottom < -240 || rect.top > viewport + 240) continue;

    const centre = rect.top + rect.height / 2;
    const span = (viewport + rect.height) / 2;
    /* -1 once it has travelled past the top, +1 while still below. */
    const progress = Math.max(-1, Math.min(1, (centre - viewport / 2) / span));
    node.style.setProperty('--py', `${(progress * strength).toFixed(1)}px`);
  }
}

function request() {
  if (frame === null) frame = window.requestAnimationFrame(measure);
}

function subscribe(entry: Subscriber) {
  subscribers.add(entry);

  if (!listening) {
    listening = true;
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request, { passive: true });
  }

  request();

  return () => {
    subscribers.delete(entry);
    entry.node.style.removeProperty('--py');

    if (subscribers.size === 0 && listening) {
      listening = false;
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
        frame = null;
      }
    }
  };
}

export function useParallax<T extends HTMLElement>(strength = 48) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    return subscribe({ node, strength });
  }, [strength]);

  return ref;
}
