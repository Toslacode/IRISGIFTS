'use client';

import { useCallback, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

/* ==========================================================================
   The "liquid" half of liquid glass.

   The specular highlight on a control tracks the pointer, so light appears to
   travel under the surface as you move across it — the difference between a
   button that looks like glass and one that behaves like it.

   Only a custom property changes, so the browser repaints one gradient and
   never touches layout. Reads are batched into a frame; on touch the highlight
   simply lands where the finger did.
   ========================================================================== */

export function useGlassPointer<T extends HTMLElement>() {
  const frame = useRef<number | null>(null);

  const onPointerMove = useCallback((event: ReactPointerEvent<T>) => {
    const node = event.currentTarget;
    const x = event.clientX;
    /* currentTarget is cleared before the frame runs, so capture it now. */
    if (frame.current !== null) return;

    frame.current = window.requestAnimationFrame(() => {
      frame.current = null;
      const rect = node.getBoundingClientRect();
      if (!rect.width) return;
      const ratio = Math.min(1, Math.max(0, (x - rect.left) / rect.width));
      node.style.setProperty('--gx', `${(ratio * 100).toFixed(1)}%`);
    });
  }, []);

  const onPointerLeave = useCallback((event: ReactPointerEvent<T>) => {
    if (frame.current !== null) {
      window.cancelAnimationFrame(frame.current);
      frame.current = null;
    }
    /* Back to centre, so the next hover starts from a neutral highlight. */
    event.currentTarget.style.removeProperty('--gx');
  }, []);

  return { onPointerMove, onPointerLeave };
}
