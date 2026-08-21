import type { GiftBuilderState } from '@/types';

/* ==========================================================================
   The flow, declared once.
   The progress indicator, the URL, the "can I continue" rule and the summary's
   edit links all read from this list — so adding a question is a one-line
   change, not a hunt through components.
   ========================================================================== */

export type StepId =
  | 'recipient'
  | 'occasion'
  | 'budget'
  | 'style'
  | 'include'
  | 'exclude'
  | 'personalization'
  | 'building'
  | 'recommendation'
  | 'greeting'
  | 'delivery'
  | 'customer'
  | 'summary';

export interface StepDefinition {
  id: StepId;
  /** Shown in the progress rail. */
  label: string;
  /** The question itself. */
  title: string;
  subtitle?: string;
  /** Steps the customer may leave without answering. */
  optional?: boolean;
  /** Excluded from the "step N of M" count — transitions and the result. */
  offRail?: boolean;
  /** Gate for the continue button. */
  isComplete: (state: GiftBuilderState) => boolean;
}

export const steps: StepDefinition[] = [
  {
    id: 'recipient',
    label: 'למי',
    title: 'למי המתנה?',
    subtitle: 'בחרו עבור מי מיועדת המתנה',
    isComplete: (s) => s.recipient !== null,
  },
  {
    id: 'occasion',
    label: 'אירוע',
    title: 'מה האירוע?',
    subtitle: 'זה עוזר לנו לבחור את הפריטים הנכונים',
    isComplete: (s) =>
      s.occasion !== null &&
      (s.occasion !== 'other' || s.occasionOther.trim().length > 0),
  },
  {
    id: 'budget',
    label: 'תקציב',
    title: 'מה התקציב שלכם?',
    subtitle: 'נתאים את המארז לטווח שבחרתם',
    isComplete: (s) =>
      s.budget.bandId !== null ||
      (s.budget.exactAmount !== null && s.budget.exactAmount > 0),
  },
  {
    id: 'style',
    label: 'סגנון',
    title: 'איזה סגנון אתם מחפשים?',
    subtitle: 'אפשר לבחור אחד או שניים',
    isComplete: (s) => s.styles.length > 0,
  },
  {
    id: 'include',
    label: 'תכולה',
    title: 'מה חשוב שיהיה במארז?',
    subtitle: 'בחרו כמה שתרצו, או תנו לנו לבחור',
    isComplete: (s) => s.surpriseMe || s.includeCategories.length > 0,
  },
  {
    id: 'exclude',
    label: 'החרגות',
    title: 'יש משהו שלא תרצו במארז?',
    subtitle: 'כדי שלא נכניס משהו שלא מתאים',
    isComplete: (s) =>
      s.exclusions.length > 0 &&
      (!s.exclusions.includes('other') || s.exclusionOther.trim().length > 0),
  },
  {
    id: 'personalization',
    label: 'התאמה',
    title: 'רוצים להפוך את המתנה לאישית יותר?',
    subtitle: 'אפשר לדלג ולחזור לזה אחר כך',
    optional: true,
    isComplete: () => true,
  },
  {
    id: 'building',
    label: 'מרכיבים',
    title: 'אנחנו מרכיבים לכם את המתנה',
    offRail: true,
    isComplete: () => true,
  },
  {
    id: 'recommendation',
    label: 'המארז',
    title: 'המארז שבנינו עבורכם',
    subtitle: 'אפשר להחליף, להסיר או להוסיף — המחיר מתעדכן מיד',
    offRail: true,
    isComplete: (s) => (s.basket?.items.length ?? 0) > 0,
  },
  {
    id: 'greeting',
    label: 'ברכה',
    title: 'מה תרצו שנכתוב בברכה?',
    subtitle: 'נדפיס את זה על כרטיס הברכה שבתוך המארז',
    optional: true,
    offRail: true,
    isComplete: () => true,
  },
  {
    id: 'delivery',
    label: 'משלוח',
    title: 'איך תרצו לקבל את המתנה?',
    offRail: true,
    isComplete: (s) => {
      if (s.delivery.method === 'pickup') return true;
      if (s.delivery.method !== 'delivery') return false;
      const d = s.delivery;
      return (
        d.recipientName.trim().length > 1 &&
        isPhone(d.recipientPhone) &&
        d.city.trim().length > 1 &&
        d.address.trim().length > 2
      );
    },
  },
  {
    id: 'customer',
    label: 'פרטים',
    title: 'רק נשאר לדעת מי מזמין',
    subtitle: 'כדי שאיריס תוכל לחזור אליכם ולאשר',
    offRail: true,
    isComplete: (s) =>
      s.customer.name.trim().length > 1 && isPhone(s.customer.phone),
  },
  {
    id: 'summary',
    label: 'סיכום',
    title: 'סיכום ההזמנה',
    offRail: true,
    isComplete: () => true,
  },
];

export const stepIds = steps.map((s) => s.id);

export function stepIndex(id: StepId): number {
  return stepIds.indexOf(id);
}

export function getStep(id: StepId): StepDefinition {
  const step = steps.find((s) => s.id === id);
  if (!step) throw new Error(`Unknown step: ${id}`);
  return step;
}

/** The questions that appear in the progress rail — the ones we count. */
export const railSteps = steps.filter((s) => !s.offRail);

export function railPosition(id: StepId): {
  current: number;
  total: number;
  /** True once the questions are answered and we're on to the basket. */
  past: boolean;
} {
  const index = railSteps.findIndex((s) => s.id === id);
  return {
    current: index === -1 ? railSteps.length : index + 1,
    total: railSteps.length,
    past: index === -1,
  };
}

/**
 * Israeli mobile and landline numbers, tolerant of the ways people actually
 * type them: 050-123-4567, 0501234567, +972 50 123 4567.
 */
export function isPhone(value: string): boolean {
  const digits = value.replace(/[\s\-().]/g, '');
  return /^(?:\+?972|0)(?:[23489]|5\d|7\d)\d{7}$/.test(digits);
}

export function isEmail(value: string): boolean {
  if (!value.trim()) return true; /* optional field */
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}
