import { predefinedBaskets } from '@/data/baskets';
import { products as seedProducts } from '@/data/products';
import { budgetBandById, exclusionBlocks } from '@/data/taxonomy';
import type {
  BasketDraft,
  CategoryId,
  GiftBuilderState,
  PredefinedBasket,
  Product,
  ScoredProduct,
} from '@/types';

/* ==========================================================================
   Deterministic recommendation engine.

   Two paths, in order:
   1. A predefined basket the store composed, when the answers match it well.
   2. An assembled basket, built greedily from the highest-scoring products
      that fit the budget and the customer's constraints.

   No AI, no randomness the customer cannot re-roll. Given the same answers
   and the same `variant`, the output is identical every time.
   ========================================================================== */

/** How much each signal is worth when scoring a single product. */
const WEIGHTS = {
  recipient: 30,
  occasion: 26,
  style: 14,
  requestedCategory: 34,
  hero: 8,
  personalizationWanted: 6,
} as const;

/** A predefined basket must clear this to be used as the base. */
const BASKET_MATCH_THRESHOLD = 62;

/** The assembled basket aims to land inside this window around the target. */
const BUDGET_FLOOR = 0.78;
const BUDGET_CEILING = 1.08;

export interface BudgetRange {
  min: number;
  max: number;
  target: number;
}

/** Resolve the answers into a single number the engine can aim at. */
export function resolveBudget(state: GiftBuilderState): BudgetRange {
  const { bandId, exactAmount } = state.budget;

  if (exactAmount && exactAmount > 0) {
    return {
      min: Math.round(exactAmount * BUDGET_FLOOR),
      max: Math.round(exactAmount * BUDGET_CEILING),
      target: exactAmount,
    };
  }

  const band = bandId ? budgetBandById.get(bandId) : undefined;
  if (band) {
    return { min: band.min, max: band.max, target: band.target };
  }

  /* Nothing chosen — assume the middle of the store's range. */
  return { min: 300, max: 500, target: 450 };
}

/** Categories the customer ruled out, flattened from their exclusions. */
export function blockedCategories(state: GiftBuilderState): Set<CategoryId> {
  const blocked = new Set<CategoryId>();
  for (const id of state.exclusions) {
    for (const category of exclusionBlocks[id] ?? []) {
      blocked.add(category);
    }
  }
  return blocked;
}

function isAvailable(product: Product): boolean {
  return product.active && product.inStock;
}

/** Score one product against the customer's answers. */
export function scoreProduct(
  product: Product,
  state: GiftBuilderState
): ScoredProduct {
  let score = 0;
  const reasons: string[] = [];

  if (state.recipient && product.recipients.includes(state.recipient)) {
    score += WEIGHTS.recipient;
    reasons.push('recipient');
  }

  if (state.occasion && product.occasions.includes(state.occasion)) {
    score += WEIGHTS.occasion;
    reasons.push('occasion');
  }

  for (const style of state.styles) {
    if (product.styles.includes(style)) {
      score += WEIGHTS.style;
      reasons.push('style');
    }
  }

  /* An explicit "I want candles in it" outweighs everything else. */
  if (!state.surpriseMe && state.includeCategories.includes(product.category)) {
    score += WEIGHTS.requestedCategory;
    reasons.push('requested');
  }

  if (product.hero) {
    score += WEIGHTS.hero;
  }

  if (
    product.personalizationAvailable &&
    state.personalization.embroideryName.trim()
  ) {
    score += WEIGHTS.personalizationWanted;
    reasons.push('personalization');
  }

  return { product, score, reasons };
}

/** Every product that survives the customer's exclusions, ranked. */
export function rankProducts(
  state: GiftBuilderState,
  catalog: Product[] = seedProducts
): ScoredProduct[] {
  const blocked = blockedCategories(state);

  return catalog
    .filter(isAvailable)
    .filter((p) => !blocked.has(p.category))
    .map((p) => scoreProduct(p, state))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      /* Stable, price-descending tiebreak keeps output deterministic. */
      if (b.product.price !== a.product.price) {
        return b.product.price - a.product.price;
      }
      return a.product.id.localeCompare(b.product.id);
    });
}

/** Score a store-composed basket against the answers, as a 0–100 percentage. */
export function scoreBasket(
  basket: PredefinedBasket,
  state: GiftBuilderState,
  catalog: Product[] = seedProducts
): number {
  if (!basket.active) return 0;

  const byId = new Map(catalog.map((p) => [p.id, p]));
  const items = basket.productIds
    .map((id) => byId.get(id))
    .filter((p): p is Product => Boolean(p));

  if (items.length === 0) return 0;

  /* A basket containing something the customer ruled out is disqualified. */
  const blocked = blockedCategories(state);
  if (items.some((p) => blocked.has(p.category))) return 0;

  let score = 0;

  if (state.recipient && basket.recipients.includes(state.recipient)) {
    score += 34;
  }
  if (state.occasion && basket.occasions.includes(state.occasion)) {
    score += 30;
  }

  const styleHits = state.styles.filter((s) => basket.styles.includes(s));
  if (state.styles.length > 0) {
    score += (styleHits.length / state.styles.length) * 16;
  }

  /* Did it bring what the customer asked for? */
  if (!state.surpriseMe && state.includeCategories.length > 0) {
    const present = new Set(items.map((p) => p.category));
    const hits = state.includeCategories.filter((c) => present.has(c));
    score += (hits.length / state.includeCategories.length) * 20;
  } else {
    /* No stated preference — don't penalise the basket for it. */
    score += 14;
  }

  /* Distance from the budget target, worth up to 12 points. */
  const { target } = resolveBudget(state);
  const price = basketPrice(basket, catalog);
  const drift = Math.abs(price - target) / Math.max(target, 1);
  score += Math.max(0, 12 * (1 - Math.min(drift, 1)));

  return Math.round(score);
}

/** What a predefined basket costs: the store's fixed price, or the sum. */
export function basketPrice(
  basket: PredefinedBasket,
  catalog: Product[] = seedProducts
): number {
  if (typeof basket.basePrice === 'number') return basket.basePrice;
  const byId = new Map(catalog.map((p) => [p.id, p]));
  return basket.productIds.reduce(
    (sum, id) => sum + (byId.get(id)?.price ?? 0),
    0
  );
}

/** Live total of a draft, including any edits the customer made. */
export function draftTotal(
  draft: BasketDraft,
  catalog: Product[] = seedProducts
): number {
  const byId = new Map(catalog.map((p) => [p.id, p]));
  return draft.items.reduce((sum, item) => {
    const product = byId.get(item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
}

function toDraft(
  basket: PredefinedBasket,
  catalog: Product[]
): BasketDraft {
  const byId = new Map(catalog.map((p) => [p.id, p]));
  const items = basket.productIds
    .filter((id) => {
      const p = byId.get(id);
      return p && isAvailable(p);
    })
    .map((productId) => ({ productId, quantity: 1 }));

  return {
    sourceBasketId: basket.id,
    name: basket.name,
    rationale: basket.rationale,
    image: basket.image,
    items,
    basePrice: basket.basePrice ?? null,
  };
}

/* --------------------------------------------------------------------------
   Assembling a basket from scratch
   -------------------------------------------------------------------------- */

/**
 * Greedy fill against the budget, with two rules that keep the result from
 * looking machine-made:
 *   - at most two items from any one category, so it isn't "four candles";
 *   - the requested categories get first refusal before anything else.
 */
function assembleBasket(
  state: GiftBuilderState,
  catalog: Product[],
  variant: number
): BasketDraft {
  const ranked = rankProducts(state, catalog);
  const { target, max } = resolveBudget(state);

  /* `variant` rotates the starting point so "suggest another" gives a
     genuinely different basket without becoming random. */
  const rotated = rotate(ranked, variant);

  const chosen: Product[] = [];
  const perCategory = new Map<CategoryId, number>();
  let total = 0;

  const wanted = state.surpriseMe ? [] : state.includeCategories;

  /* Pass 1 — one item from each category the customer asked for. */
  for (const category of wanted) {
    const pick = rotated.find(
      (c) =>
        c.product.category === category &&
        !chosen.includes(c.product) &&
        total + c.product.price <= max
    );
    if (pick) {
      chosen.push(pick.product);
      perCategory.set(category, 1);
      total += pick.product.price;
    }
  }

  /* Pass 2 — fill toward the target with the best of what's left. */
  for (const candidate of rotated) {
    if (total >= target * BUDGET_FLOOR && chosen.length >= 4) break;
    if (chosen.includes(candidate.product)) continue;

    const category = candidate.product.category;
    if ((perCategory.get(category) ?? 0) >= 2) continue;
    if (total + candidate.product.price > max) continue;

    chosen.push(candidate.product);
    perCategory.set(category, (perCategory.get(category) ?? 0) + 1);
    total += candidate.product.price;
  }

  /* Pass 3 — if we're still well under budget, top up with small items. */
  if (total < target * BUDGET_FLOOR) {
    const affordable = rotated
      .filter((c) => !chosen.includes(c.product))
      .sort((a, b) => a.product.price - b.product.price);

    for (const candidate of affordable) {
      if (total + candidate.product.price > max) continue;
      const category = candidate.product.category;
      if ((perCategory.get(category) ?? 0) >= 2) continue;

      chosen.push(candidate.product);
      perCategory.set(category, (perCategory.get(category) ?? 0) + 1);
      total += candidate.product.price;

      if (total >= target * BUDGET_FLOOR) break;
    }
  }

  return {
    sourceBasketId: null,
    name: assembledName(state),
    rationale: assembledRationale(state, chosen),
    image: chosen.find((p) => p.hero)?.image ?? chosen[0]?.image ?? '',
    items: chosen.map((p) => ({ productId: p.id, quantity: 1 })),
    basePrice: null,
  };
}

function rotate<T>(list: T[], by: number): T[] {
  if (list.length === 0 || by % list.length === 0) return list;
  const offset = by % list.length;
  return [...list.slice(offset), ...list.slice(0, offset)];
}

/* --------------------------------------------------------------------------
   Human-readable naming and rationale
   -------------------------------------------------------------------------- */

const RECIPIENT_NOUN: Record<string, string> = {
  woman: 'מארז לאישה',
  man: 'מארז לגבר',
  couple: 'מארז לזוג',
  bride: 'מארז לכלה',
  groom: 'מארז לחתן',
  'new-mother': 'מארז ליולדת',
  family: 'מארז למשפחה',
  other: 'מארז אישי',
};

const STYLE_ADJECTIVE: Record<string, string> = {
  luxury: 'יוקרתי',
  clean: 'עדין',
  romantic: 'רומנטי',
  pampering: 'מפנק',
  traditional: 'מסורתי',
  colorful: 'צבעוני',
};

function assembledName(state: GiftBuilderState): string {
  const noun = state.recipient
    ? RECIPIENT_NOUN[state.recipient]
    : 'מארז בהתאמה אישית';
  const adjective = state.styles[0] ? STYLE_ADJECTIVE[state.styles[0]] : '';
  return adjective ? `${noun} ${adjective}` : noun;
}

function assembledRationale(
  state: GiftBuilderState,
  chosen: Product[]
): string {
  const parts: string[] = [];

  if (state.recipient && state.occasion) {
    parts.push('בחרנו פריטים שמתאימים לאדם ולאירוע שציינתם');
  } else if (state.recipient) {
    parts.push('בחרנו פריטים שמתאימים למי שהמתנה מיועדת לו');
  } else {
    parts.push('בחרנו פריטים שעובדים יפה יחד');
  }

  if (!state.surpriseMe && state.includeCategories.length > 0) {
    parts.push('והקפדנו לכלול את מה שביקשתם');
  }

  if (state.exclusions.some((e) => e !== 'none')) {
    parts.push('בלי מה שביקשתם להשאיר בחוץ');
  }

  const anchor = chosen.find((p) => p.hero);
  if (anchor) {
    parts.push(`המארז נבנה סביב ${anchor.name}`);
  }

  return `${parts.join(', ')}.`;
}

/* --------------------------------------------------------------------------
   Public entry point
   -------------------------------------------------------------------------- */

export interface Recommendation {
  draft: BasketDraft;
  /** True when a store-composed basket was used as the base. */
  fromPredefined: boolean;
  /** How well the source basket matched, when there was one. */
  matchScore: number;
}

/**
 * Build a recommendation from the customer's answers.
 *
 * `variant` is bumped by "הציעו לי מארז אחר" — 0 gives the best match, and
 * each increment moves to the next-best basket or rotates the assembled one.
 */
export function recommend(
  state: GiftBuilderState,
  options: { variant?: number; catalog?: Product[]; baskets?: PredefinedBasket[] } = {}
): Recommendation {
  const variant = options.variant ?? 0;
  const catalog = options.catalog ?? seedProducts;
  const baskets = options.baskets ?? predefinedBaskets;
  const { max } = resolveBudget(state);

  const candidates = baskets
    .map((basket) => ({ basket, score: scoreBasket(basket, state, catalog) }))
    .filter((c) => c.score >= BASKET_MATCH_THRESHOLD)
    /* Don't hand someone a basket that blows past what they said they'd spend. */
    .filter((c) => basketPrice(c.basket, catalog) <= max * BUDGET_CEILING)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.basket.id.localeCompare(b.basket.id);
    });

  if (variant < candidates.length) {
    const match = candidates[variant];
    return {
      draft: toDraft(match.basket, catalog),
      fromPredefined: true,
      matchScore: match.score,
    };
  }

  /* Out of store-composed matches — assemble one. */
  return {
    draft: assembleBasket(state, catalog, variant - candidates.length),
    fromPredefined: false,
    matchScore: 0,
  };
}

/**
 * Products worth offering as additions to the basket on screen, best first.
 * Excludes what's already in the basket and anything the customer ruled out.
 */
export function suggestAdditions(
  state: GiftBuilderState,
  draft: BasketDraft,
  catalog: Product[] = seedProducts,
  limit = 12
): Product[] {
  const inBasket = new Set(draft.items.map((i) => i.productId));
  return rankProducts(state, catalog)
    .filter((c) => !inBasket.has(c.product.id))
    .slice(0, limit)
    .map((c) => c.product);
}

/**
 * Swap candidates for one item: same category first, then anything close in
 * price, so "החלפה" always has something sensible to offer.
 */
export function swapCandidates(
  state: GiftBuilderState,
  draft: BasketDraft,
  productId: string,
  catalog: Product[] = seedProducts,
  limit = 8
): Product[] {
  const current = catalog.find((p) => p.id === productId);
  const inBasket = new Set(draft.items.map((i) => i.productId));
  const ranked = rankProducts(state, catalog).filter(
    (c) => !inBasket.has(c.product.id)
  );

  const sameCategory = ranked.filter(
    (c) => c.product.category === current?.category
  );
  const rest = ranked.filter((c) => c.product.category !== current?.category);

  return [...sameCategory, ...rest].slice(0, limit).map((c) => c.product);
}
