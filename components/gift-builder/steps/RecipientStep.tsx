'use client';

import { useBuilder } from '@/components/gift-builder/BuilderContext';
import { StepShell } from '@/components/gift-builder/StepShell';
import { ChoiceCard } from '@/components/ui/ChoiceCard';
import { Icon, type IconName } from '@/components/ui/Icon';
import { recipients } from '@/data/taxonomy';
import type { RecipientId } from '@/types';

const ICONS: Record<RecipientId, IconName> = {
  woman: 'woman',
  man: 'man',
  couple: 'couple',
  bride: 'bride',
  groom: 'groom',
  'new-mother': 'baby',
  family: 'family',
  other: 'sparkle',
};

export function RecipientStep() {
  const { state, dispatch, next } = useBuilder();

  return (
    <StepShell blockedHint="בחרו למי מיועדת המתנה כדי להמשיך">
      {/* radiogroup: one answer, and screen readers announce it as such */}
      <div
        role="radiogroup"
        aria-label="למי המתנה"
        className="stagger grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4"
      >
        {recipients.map((option) => (
          <ChoiceCard
            key={option.id}
            label={option.label}
            tone={option.tone}
            selected={state.recipient === option.id}
            icon={<Icon name={ICONS[option.id]} size={26} />}
            onSelect={() => {
              dispatch({ type: 'setRecipient', value: option.id });
              /* Selecting is the answer — move on without a second tap. */
              window.setTimeout(next, 220);
            }}
          />
        ))}
      </div>
    </StepShell>
  );
}
