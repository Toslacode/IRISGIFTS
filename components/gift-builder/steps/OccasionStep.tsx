'use client';

import { useBuilder } from '@/components/gift-builder/BuilderContext';
import { StepShell } from '@/components/gift-builder/StepShell';
import { ChoiceCard } from '@/components/ui/ChoiceCard';
import { Icon, type IconName } from '@/components/ui/Icon';
import { TextField } from '@/components/ui/Field';
import { occasions } from '@/data/taxonomy';
import type { OccasionId } from '@/types';

const ICONS: Record<OccasionId, IconName> = {
  birthday: 'cake',
  wedding: 'rings',
  engagement: 'heart',
  hina: 'henna',
  'shabbat-hatan': 'candle',
  birth: 'baby',
  holiday: 'gift',
  thanks: 'thanks',
  'no-occasion': 'sparkle',
  other: 'tag',
};

export function OccasionStep() {
  const { state, dispatch, next } = useBuilder();
  const isOther = state.occasion === 'other';

  return (
    <StepShell blockedHint="בחרו את האירוע כדי להמשיך">
      <div className="flex flex-col gap-5">
        <div
          role="radiogroup"
          aria-label="מה האירוע"
          className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4"
        >
          {occasions.map((option) => (
            <ChoiceCard
              key={option.id}
              label={option.label}
              tone={option.tone}
              selected={state.occasion === option.id}
              icon={<Icon name={ICONS[option.id]} size={26} />}
              onSelect={() => {
                dispatch({ type: 'setOccasion', value: option.id });
                /* "אחר" needs a follow-up, so don't jump ahead. */
                if (option.id !== 'other') window.setTimeout(next, 220);
              }}
            />
          ))}
        </div>

        {/* Progressive disclosure — the field only exists once it's relevant */}
        {isOther && (
          <div className="anim-rise rounded-card border border-gold-soft bg-gold-wash/50 p-5">
            <TextField
              label="איזה אירוע?"
              placeholder="למשל: גיוס, סיום לימודים, בר מצווה"
              value={state.occasionOther}
              autoFocus
              onChange={(e) =>
                dispatch({ type: 'setOccasionOther', value: e.target.value })
              }
            />
          </div>
        )}
      </div>
    </StepShell>
  );
}
