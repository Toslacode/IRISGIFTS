'use client';

import { useBuilder } from '@/components/gift-builder/BuilderContext';
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
import type { StepId } from '@/lib/steps';

/* The twelve screens, and nothing around them. Both shells — the section
   embedded on the home page and the standalone /build route — render this. */
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

export function BuilderStage() {
  const { step } = useBuilder();
  const Screen = SCREENS[step];
  return <Screen />;
}

/** Shown while stored answers are being read, so a returning customer never
    sees the empty first question flash past. */
export function BuilderLoading() {
  return (
    <div className="flex min-h-[22rem] items-center justify-center">
      <div className="size-10 rounded-full border-2 border-gold-soft border-t-gold motion-safe:animate-[iris-spin_0.9s_linear_infinite]" />
      <p className="sr-only">טוען</p>
    </div>
  );
}
