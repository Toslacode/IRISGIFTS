/* ==========================================================================
   IRISGIFTS — domain types
   The single source of truth for the shape of the catalogue, the customer's
   answers, and the order that comes out the other end.
   ========================================================================== */

/** Who the gift is for. */
export type RecipientId =
  | 'woman'
  | 'man'
  | 'couple'
  | 'bride'
  | 'groom'
  | 'new-mother'
  | 'family'
  | 'other';

/** The occasion being marked. */
export type OccasionId =
  | 'birthday'
  | 'wedding'
  | 'engagement'
  | 'hina'
  | 'shabbat-hatan'
  | 'birth'
  | 'holiday'
  | 'thanks'
  | 'no-occasion'
  | 'other';

/** The visual / emotional register of the basket. */
export type StyleId =
  | 'luxury'
  | 'clean'
  | 'romantic'
  | 'pampering'
  | 'traditional'
  | 'colorful';

/** Product categories the customer can ask for by name. */
export type CategoryId =
  | 'towels'
  | 'robe'
  | 'skincare'
  | 'candles'
  | 'sweets'
  | 'wine'
  | 'homeware'
  | 'judaica'
  | 'personalized';

/** Things the customer can rule out. */
export type ExclusionId =
  | 'no-alcohol'
  | 'no-sweets'
  | 'no-skincare'
  | 'none'
  | 'other';

/** A single item that can go inside a basket. */
export interface Product {
  id: string;
  name: string;
  /** One line the customer reads on the card. */
  description: string;
  price: number;
  category: CategoryId;
  recipients: RecipientId[];
  occasions: OccasionId[];
  styles: StyleId[];
  image: string;
  active: boolean;
  inStock: boolean;
  personalizationAvailable: boolean;
  /** Marks items that carry a basket on their own (a robe, a wine). */
  hero?: boolean;
}

/** A basket the store has composed by hand. */
export interface PredefinedBasket {
  id: string;
  name: string;
  description: string;
  /** Why this basket suits the customer — shown on the recommendation screen. */
  rationale: string;
  productIds: string[];
  /** Overrides the sum of the products when the store prices the set as one. */
  basePrice?: number;
  image: string;
  recipients: RecipientId[];
  occasions: OccasionId[];
  styles: StyleId[];
  active: boolean;
  featured?: boolean;
}

/** How the customer wants to receive the gift. */
export type DeliveryMethod = 'pickup' | 'delivery';

export interface DeliveryDetails {
  method: DeliveryMethod | null;
  recipientName: string;
  recipientPhone: string;
  city: string;
  address: string;
  date: string;
  courierNotes: string;
}

export interface PersonalizationDetails {
  embroideryName: string;
  preferredColor: string;
  dedication: string;
  note: string;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
}

export interface BudgetSelection {
  /** The id of the chosen band, or `exact` when a number was typed. */
  bandId: string | null;
  /** The typed amount, when the customer gave one. */
  exactAmount: number | null;
}

/** Everything the customer has told us. One object, start to finish. */
export interface GiftBuilderState {
  recipient: RecipientId | null;
  occasion: OccasionId | null;
  occasionOther: string;
  budget: BudgetSelection;
  styles: StyleId[];
  includeCategories: CategoryId[];
  /** `true` when the customer picked "choose for me". */
  surpriseMe: boolean;
  exclusions: ExclusionId[];
  exclusionOther: string;
  personalization: PersonalizationDetails;
  greeting: string;
  delivery: DeliveryDetails;
  customer: CustomerDetails;
  /** The basket currently on the table — recommended, then edited. */
  basket: BasketDraft | null;
}

/** The live basket: what it is, what is in it, what it costs right now. */
export interface BasketDraft {
  /** Set when the basket came from a store-composed set. */
  sourceBasketId: string | null;
  name: string;
  rationale: string;
  image: string;
  items: BasketItem[];
  /** Fixed price from a predefined basket, before any edits. */
  basePrice: number | null;
}

export interface BasketItem {
  productId: string;
  quantity: number;
}

/** A scored candidate produced by the recommendation engine. */
export interface ScoredProduct {
  product: Product;
  score: number;
  reasons: string[];
}

/** Store-wide configuration the owner can change without touching code. */
export interface StoreSettings {
  whatsappNumber: string;
  storePhone: string;
  storeAddress: string;
  deliveryAreas: string[];
  pickupAvailable: boolean;
  deliveryFee: number;
  freeDeliveryOver: number;
}

/** A labelled choice rendered as a selectable card. */
export interface ChoiceOption<T extends string> {
  id: T;
  label: string;
  /** Optional supporting line under the label. */
  hint?: string;
  /** Key into the pastel token set used for the icon halo. */
  tone?: PastelTone;
}

export type PastelTone = 'sage' | 'sky' | 'sand' | 'rose' | 'lilac' | 'mint';

export interface BudgetBand {
  id: string;
  label: string;
  min: number;
  max: number;
  /** The figure the engine aims at when this band is chosen. */
  target: number;
}
