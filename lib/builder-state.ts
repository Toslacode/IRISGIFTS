import type {
  BasketDraft,
  CategoryId,
  ExclusionId,
  GiftBuilderState,
  OccasionId,
  RecipientId,
  StyleId,
} from '@/types';

/* ==========================================================================
   The one state object the whole flow reads and writes.
   Going back never clears an answer — every action is additive or an explicit
   toggle, and nothing resets on navigation.
   ========================================================================== */

export const initialBuilderState: GiftBuilderState = {
  recipient: null,
  occasion: null,
  occasionOther: '',
  budget: { bandId: null, exactAmount: null },
  styles: [],
  includeCategories: [],
  surpriseMe: false,
  exclusions: [],
  exclusionOther: '',
  personalization: {
    embroideryName: '',
    preferredColor: '',
    dedication: '',
    note: '',
  },
  greeting: '',
  delivery: {
    method: null,
    recipientName: '',
    recipientPhone: '',
    city: '',
    address: '',
    date: '',
    courierNotes: '',
  },
  customer: { name: '', phone: '', whatsapp: '', email: '' },
  basket: null,
};

export type BuilderAction =
  | { type: 'setRecipient'; value: RecipientId }
  | { type: 'setOccasion'; value: OccasionId }
  | { type: 'setOccasionOther'; value: string }
  | { type: 'setBudgetBand'; value: string }
  | { type: 'setExactBudget'; value: number | null }
  | { type: 'toggleStyle'; value: StyleId }
  | { type: 'toggleCategory'; value: CategoryId }
  | { type: 'setSurpriseMe'; value: boolean }
  | { type: 'toggleExclusion'; value: ExclusionId }
  | { type: 'setExclusionOther'; value: string }
  | {
      type: 'setPersonalization';
      field: keyof GiftBuilderState['personalization'];
      value: string;
    }
  | { type: 'setGreeting'; value: string }
  | {
      type: 'setDelivery';
      field: keyof GiftBuilderState['delivery'];
      value: string;
    }
  | {
      type: 'setCustomer';
      field: keyof GiftBuilderState['customer'];
      value: string;
    }
  | { type: 'setBasket'; value: BasketDraft }
  | { type: 'removeItem'; productId: string }
  | { type: 'addItem'; productId: string }
  | { type: 'swapItem'; productId: string; withProductId: string }
  | { type: 'hydrate'; value: GiftBuilderState }
  | { type: 'reset' };

/** At most two styles — a third selection pushes the oldest out. */
const MAX_STYLES = 2;

/**
 * Editing the basket makes the store's fixed price meaningless, so we drop it
 * and fall back to the live sum of what's actually inside.
 */
function unpriced(basket: BasketDraft): BasketDraft {
  return { ...basket, basePrice: null };
}

export function builderReducer(
  state: GiftBuilderState,
  action: BuilderAction
): GiftBuilderState {
  switch (action.type) {
    case 'setRecipient':
      return { ...state, recipient: action.value };

    case 'setOccasion':
      return { ...state, occasion: action.value };

    case 'setOccasionOther':
      return { ...state, occasionOther: action.value };

    case 'setBudgetBand':
      /* Choosing a band clears a previously typed amount, and vice versa —
         two live answers to one question would be ambiguous. */
      return {
        ...state,
        budget: { bandId: action.value, exactAmount: null },
      };

    case 'setExactBudget':
      return {
        ...state,
        budget: {
          bandId: action.value ? null : state.budget.bandId,
          exactAmount: action.value,
        },
      };

    case 'toggleStyle': {
      const has = state.styles.includes(action.value);
      if (has) {
        return {
          ...state,
          styles: state.styles.filter((s) => s !== action.value),
        };
      }
      const next = [...state.styles, action.value];
      return { ...state, styles: next.slice(-MAX_STYLES) };
    }

    case 'toggleCategory': {
      const has = state.includeCategories.includes(action.value);
      return {
        ...state,
        /* Picking a specific category means they do care after all. */
        surpriseMe: false,
        includeCategories: has
          ? state.includeCategories.filter((c) => c !== action.value)
          : [...state.includeCategories, action.value],
      };
    }

    case 'setSurpriseMe':
      return {
        ...state,
        surpriseMe: action.value,
        includeCategories: action.value ? [] : state.includeCategories,
      };

    case 'toggleExclusion': {
      /* "אין העדפה" is mutually exclusive with every real exclusion. */
      if (action.value === 'none') {
        return {
          ...state,
          exclusions: state.exclusions.includes('none') ? [] : ['none'],
          exclusionOther: '',
        };
      }
      const withoutNone = state.exclusions.filter((e) => e !== 'none');
      const has = withoutNone.includes(action.value);
      return {
        ...state,
        exclusions: has
          ? withoutNone.filter((e) => e !== action.value)
          : [...withoutNone, action.value],
        exclusionOther:
          has && action.value === 'other' ? '' : state.exclusionOther,
      };
    }

    case 'setExclusionOther':
      return { ...state, exclusionOther: action.value };

    case 'setPersonalization':
      return {
        ...state,
        personalization: {
          ...state.personalization,
          [action.field]: action.value,
        },
      };

    case 'setGreeting':
      return { ...state, greeting: action.value };

    case 'setDelivery':
      return {
        ...state,
        delivery: { ...state.delivery, [action.field]: action.value },
      };

    case 'setCustomer':
      return {
        ...state,
        customer: { ...state.customer, [action.field]: action.value },
      };

    case 'setBasket':
      return { ...state, basket: action.value };

    case 'removeItem': {
      if (!state.basket) return state;
      return {
        ...state,
        basket: unpriced({
          ...state.basket,
          items: state.basket.items.filter(
            (i) => i.productId !== action.productId
          ),
        }),
      };
    }

    case 'addItem': {
      if (!state.basket) return state;
      if (state.basket.items.some((i) => i.productId === action.productId)) {
        return state;
      }
      return {
        ...state,
        basket: unpriced({
          ...state.basket,
          items: [
            ...state.basket.items,
            { productId: action.productId, quantity: 1 },
          ],
        }),
      };
    }

    case 'swapItem': {
      if (!state.basket) return state;
      /* Swapping in something already present would duplicate it. */
      if (state.basket.items.some((i) => i.productId === action.withProductId)) {
        return state;
      }
      return {
        ...state,
        basket: unpriced({
          ...state.basket,
          items: state.basket.items.map((i) =>
            i.productId === action.productId
              ? { productId: action.withProductId, quantity: i.quantity }
              : i
          ),
        }),
      };
    }

    case 'hydrate':
      return action.value;

    case 'reset':
      return initialBuilderState;

    default:
      return state;
  }
}

/** Merge a stored object into the current shape, tolerating older versions. */
export function mergeStored(stored: unknown): GiftBuilderState | null {
  if (!stored || typeof stored !== 'object') return null;
  const candidate = stored as Partial<GiftBuilderState>;

  return {
    ...initialBuilderState,
    ...candidate,
    budget: { ...initialBuilderState.budget, ...candidate.budget },
    personalization: {
      ...initialBuilderState.personalization,
      ...candidate.personalization,
    },
    delivery: { ...initialBuilderState.delivery, ...candidate.delivery },
    customer: { ...initialBuilderState.customer, ...candidate.customer },
    styles: Array.isArray(candidate.styles) ? candidate.styles : [],
    includeCategories: Array.isArray(candidate.includeCategories)
      ? candidate.includeCategories
      : [],
    exclusions: Array.isArray(candidate.exclusions) ? candidate.exclusions : [],
  };
}
