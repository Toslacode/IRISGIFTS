'use client';

import { useBuilder } from '@/components/gift-builder/BuilderContext';
import { ProgressRail } from '@/components/gift-builder/ProgressRail';
import { BudgetStep } from '@/components/gift-builder/steps/BudgetStep';
import { BuildingStep } from '@/components/gift-builder/steps/BuildingStep';
import { CustomerStep } from '@/components/gift-builder/steps/CustomerStep';
import { DeliveryStep } from '@/components/gift-builder/steps/DeliveryStep';
import { ExcludeStep } from '@/components/gift-builder/steps/ExcludeStep';
import { GreetingStep } from '@/components/gift-builder/steps/GreetingStep';
import { IncludeStep } from '@/components/gift-builder/steps/IncludeStep';
import { OccasionStep } from '@/components/gift-builder/steps/OccasionStep';
import { PersonalizationStep } from '@/components/gift-builder/steps/PersonalizationStep';
import { RecipientStep } from '@/components/gift-builder/steps/RecipientStep';
import { RecommendationStep } from '@/components/gift-builder/steps/RecommendationStep';
import { StyleStep } from '@/components/gift-builder/steps/StyleStep';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { Logo } from '@/components/ui/Logo';
import { Icon } from '@/components/ui/Icon';
import Link from 'next/link';
import type { StepId } from '@/lib/steps';

const SCREENS: Record<StepId, () => React.JSX.Element> = {
  recipient: RecipientStep,
  occasion: OccasionStep,
  budget: BudgetStep,
  style: StyleStep,
  include: IncludeStep,
  exclude: ExcludeStep,
  personalization: PersonalizationStep,
  building: BuildingStep,
  recommendation: RecommendationStep,
  greeting: GreetingStep,
  delivery: DeliveryStep,
  customer: CustomerStep,
  summary: OrderSummary,
};

export function GiftBuilder() {
  const { step, hydrated, restart } = useBuilder();
  const Screen = SCREENS[step];

  /* Hold the first paint until stored answers are read, so a returning
     customer never sees the empty first question flash past. */
  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-10 rounded-full border-2 border-gold-soft border-t-gold motion-safe:animate-[iris-spin_0.9s_linear_infinite]" />
          <p className="sr-only">טוען</p>
        </div>
      </div>
    );
  }

  const inQuestions = step !== 'building';

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/90 backdrop-blur-md">
        <div className="shell flex flex-col gap-3 py-3.5">
          <div className="flex items-center justify-between gap-4">
            <Logo />

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

          {inQuestions && <ProgressRail />}
        </div>
      </header>

      <main id="main" className="shell flex-1 py-10 sm:py-14">
        <Screen />
      </main>
    </div>
  );
}
