'use client';

import { useEffect, useRef } from 'react';

import { useBuilder } from '@/components/gift-builder/BuilderContext';
import {
  BuilderLoading,
  BuilderStage,
} from '@/components/gift-builder/BuilderStage';
import { ProgressRail } from '@/components/gift-builder/ProgressRail';

/* ==========================================================================
   Where the browsing stops and the building starts.

   The same page, but a different surface: the ground darkens a shade, a gold
   hairline rules the top edge, and the column narrows. The intro line only
   exists on the very first question — from the second answer onward this is
   an application, and a marketing heading above it would undercut that.
   ========================================================================== */

export function HomeBuilder() {
  const { step, hydrated, registerStage } = useBuilder();
  const stageRef = useRef<HTMLDivElement>(null);

  /* Hand the container to the context so advancing a step moves this area
     into view rather than jumping the whole page to the top. */
  useEffect(() => {
    registerStage(stageRef.current);
    return () => registerStage(null);
  }, [registerStage]);

  const atStart = step === 'recipient';

  return (
    <section
      id="builder"
      ref={stageRef}
      /* Clears the sticky header, plus a little air, when the hero CTA jumps
         here. Uses a plain spacing step rather than a custom-property
         reference: Tailwind scans raw file content, so the v3 bracket form
         emits an invalid declaration even when it only appears in a comment. */
      className="scroll-mt-20 border-y border-gold-soft bg-canvas-deep"
    >
      {/* A single champagne rule marks the threshold */}
      <div
        aria-hidden="true"
        className="h-px w-full bg-linear-to-l from-transparent via-gold to-transparent"
      />

      <div className="shell py-6 sm:py-10 lg:py-12">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 sm:gap-6">
          {atStart && (
            <header className="anim-rise flex flex-col items-center gap-1.5 text-center sm:gap-2">
              <h2 className="font-display text-[1.6rem] font-semibold leading-tight text-ink sm:text-[2.125rem]">
                בואו נבנה את המתנה שלכם
              </h2>
              <p className="text-[0.9375rem] text-ink-muted sm:text-[1.0625rem]">
                כמה שאלות קצרות ואנחנו כבר נדע מה להציע לכם
              </p>
            </header>
          )}

          {/* The app surface itself */}
          <div className="rounded-panel border border-line bg-surface px-3.5 py-5 shadow-soft sm:px-8 sm:py-8">
            {hydrated ? (
              <div className="flex flex-col gap-5 sm:gap-6">
                {step !== 'building' && <ProgressRail />}
                <BuilderStage />
              </div>
            ) : (
              <BuilderLoading />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
