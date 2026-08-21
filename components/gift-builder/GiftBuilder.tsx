'use client';

import Link from 'next/link';

import { useBuilder } from '@/components/gift-builder/BuilderContext';
import {
  BuilderLoading,
  BuilderStage,
} from '@/components/gift-builder/BuilderStage';
import { ProgressRail } from '@/components/gift-builder/ProgressRail';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { useEffect, useRef } from 'react';

/* ==========================================================================
   The standalone /build route.

   The home page carries the same flow inline; this is the focused version for
   anyone arriving on a direct link — from Instagram, a message, the
   catalogue — who should land on question one without scrolling past a film
   first. Both render the same <BuilderStage>.
   ========================================================================== */

export function GiftBuilder() {
  const { step, hydrated, restart, registerStage } = useBuilder();
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerStage(stageRef.current);
    return () => registerStage(null);
  }, [registerStage]);

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/90 backdrop-blur-md">
        <div className="shell flex items-center justify-between gap-4 py-3">
          <Logo compact />

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={restart}
              className="min-h-11 cursor-pointer rounded-pill px-3 text-[0.875rem] text-ink-muted transition-colors duration-200 hover:bg-canvas-deep hover:text-ink"
            >
              להתחיל מחדש
            </button>
            <Link
              href="/"
              className="flex size-11 items-center justify-center rounded-full text-ink-muted transition-colors duration-200 hover:bg-canvas-deep hover:text-ink"
            >
              <Icon name="close" size={19} label="יציאה מבניית המארז" />
            </Link>
          </div>
        </div>
      </header>

      <main id="main" ref={stageRef} className="shell flex-1 py-6 sm:py-14">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 sm:gap-8">
          {hydrated ? (
            <>
              {step !== 'building' && <ProgressRail />}
              <BuilderStage />
            </>
          ) : (
            <BuilderLoading />
          )}
        </div>
      </main>
    </div>
  );
}
