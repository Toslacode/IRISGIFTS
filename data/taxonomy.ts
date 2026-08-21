import type {
  BudgetBand,
  CategoryId,
  ChoiceOption,
  ExclusionId,
  OccasionId,
  RecipientId,
  StyleId,
} from '@/types';

/* ==========================================================================
   The vocabulary of the gift builder.
   Every question in the flow reads its options from here, so the store owner
   changes one list and the whole product follows.
   ========================================================================== */

export const recipients: ChoiceOption<RecipientId>[] = [
  { id: 'woman', label: 'אישה', tone: 'rose' },
  { id: 'man', label: 'גבר', tone: 'sky' },
  { id: 'couple', label: 'זוג', tone: 'lilac' },
  { id: 'bride', label: 'כלה', tone: 'rose' },
  { id: 'groom', label: 'חתן', tone: 'sage' },
  { id: 'new-mother', label: 'יולדת', tone: 'mint' },
  { id: 'family', label: 'משפחה', tone: 'sand' },
  { id: 'other', label: 'אחר', tone: 'sand' },
];

export const occasions: ChoiceOption<OccasionId>[] = [
  { id: 'birthday', label: 'יום הולדת', tone: 'rose' },
  { id: 'wedding', label: 'חתונה', tone: 'lilac' },
  { id: 'engagement', label: 'אירוסין', tone: 'rose' },
  { id: 'hina', label: 'חינה', tone: 'sand' },
  { id: 'shabbat-hatan', label: 'שבת חתן', tone: 'sage' },
  { id: 'birth', label: 'לידה', tone: 'mint' },
  { id: 'holiday', label: 'חג', tone: 'sand' },
  { id: 'thanks', label: 'תודה', tone: 'sky' },
  { id: 'no-occasion', label: 'ללא אירוע מיוחד', tone: 'sky' },
  { id: 'other', label: 'אחר', tone: 'sand' },
];

export const budgetBands: BudgetBand[] = [
  { id: 'under-300', label: 'עד 300 ₪', min: 0, max: 300, target: 270 },
  { id: '300-500', label: '300–500 ₪', min: 300, max: 500, target: 450 },
  { id: '500-750', label: '500–750 ₪', min: 500, max: 750, target: 690 },
  { id: '750-1000', label: '750–1,000 ₪', min: 750, max: 1000, target: 930 },
  {
    id: 'over-1000',
    label: '1,000 ₪ ומעלה',
    min: 1000,
    max: 1800,
    target: 1250,
  },
];

export const styles: ChoiceOption<StyleId>[] = [
  { id: 'luxury', label: 'יוקרתי', hint: 'זהב, קטיפה, גימור עשיר' },
  { id: 'clean', label: 'נקי ועדין', hint: 'לבן, פשטות, קווים רכים' },
  { id: 'romantic', label: 'רומנטי', hint: 'פודרה, פרחים, סרטים' },
  { id: 'pampering', label: 'מפנק', hint: 'ריחות, רכות, זמן לעצמך' },
  { id: 'traditional', label: 'מסורתי', hint: 'יודאיקה, חום וכבוד' },
  { id: 'colorful', label: 'צבעוני ושמח', hint: 'חיוני, קליל, מרים' },
];

export const includeCategories: ChoiceOption<CategoryId>[] = [
  { id: 'towels', label: 'מגבות', tone: 'sky' },
  { id: 'robe', label: 'חלוק', tone: 'rose' },
  { id: 'skincare', label: 'מוצרי טיפוח', tone: 'mint' },
  { id: 'candles', label: 'נרות וריח', tone: 'sand' },
  { id: 'sweets', label: 'שוקולד ומתוקים', tone: 'rose' },
  { id: 'wine', label: 'יין', tone: 'lilac' },
  { id: 'homeware', label: 'כלי בית', tone: 'sage' },
  { id: 'judaica', label: 'תשמישי קדושה', tone: 'sand' },
  { id: 'personalized', label: 'מוצר עם שם אישי', tone: 'lilac' },
];

export const exclusions: ChoiceOption<ExclusionId>[] = [
  { id: 'no-alcohol', label: 'בלי אלכוהול' },
  { id: 'no-sweets', label: 'בלי מתוקים' },
  { id: 'no-skincare', label: 'בלי מוצרי טיפוח' },
  { id: 'none', label: 'אין העדפה' },
  { id: 'other', label: 'אחר' },
];

/** Which categories each exclusion removes from the candidate pool. */
export const exclusionBlocks: Record<ExclusionId, CategoryId[]> = {
  'no-alcohol': ['wine'],
  'no-sweets': ['sweets'],
  'no-skincare': ['skincare'],
  none: [],
  other: [],
};

/* --- Lookup helpers used for labels in summaries and the WhatsApp message -- */

function toLabelMap<T extends string>(
  options: ChoiceOption<T>[]
): Record<string, string> {
  return Object.fromEntries(options.map((o) => [o.id, o.label]));
}

export const recipientLabels = toLabelMap(recipients);
export const occasionLabels = toLabelMap(occasions);
export const styleLabels = toLabelMap(styles);
export const categoryLabels = toLabelMap(includeCategories);
export const exclusionLabels = toLabelMap(exclusions);

export const budgetBandById = new Map(budgetBands.map((b) => [b.id, b]));
