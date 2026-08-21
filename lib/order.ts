import { products as seedProducts } from '@/data/products';
import { defaultSettings } from '@/data/settings';
import {
  budgetBandById,
  exclusionLabels,
  occasionLabels,
  recipientLabels,
  styleLabels,
} from '@/data/taxonomy';
import { draftTotal } from '@/lib/recommendation';
import type { GiftBuilderState, Product, StoreSettings } from '@/types';

/* ==========================================================================
   Turning the answers into an order.

   The whole point of the product: Iris opens WhatsApp and the decision is
   already made. Every question she would normally ask is answered in the
   message below.
   ========================================================================== */

export function formatPrice(amount: number): string {
  return `${amount.toLocaleString('he-IL')} ₪`;
}

/** Israeli date, the way people write it: 28.8 or 28.8.26 */
export function formatDate(iso: string): string {
  if (!iso) return '';
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'numeric',
    year: '2-digit',
  });
}

export function budgetLabel(state: GiftBuilderState): string {
  if (state.budget.exactAmount) return formatPrice(state.budget.exactAmount);
  const band = state.budget.bandId
    ? budgetBandById.get(state.budget.bandId)
    : undefined;
  return band?.label ?? '—';
}

export function occasionLabel(state: GiftBuilderState): string {
  if (!state.occasion) return '—';
  if (state.occasion === 'other') {
    return state.occasionOther.trim() || 'אחר';
  }
  return occasionLabels[state.occasion] ?? '—';
}

export function exclusionSummary(state: GiftBuilderState): string {
  const listed = state.exclusions
    .filter((e) => e !== 'none')
    .map((e) =>
      e === 'other'
        ? state.exclusionOther.trim() || 'אחר'
        : exclusionLabels[e]
    )
    .filter(Boolean);

  return listed.length > 0 ? listed.join(', ') : 'אין העדפה';
}

export function styleSummary(state: GiftBuilderState): string {
  const listed = state.styles.map((s) => styleLabels[s]).filter(Boolean);
  return listed.length > 0 ? listed.join(', ') : '—';
}

export interface BasketLine {
  product: Product;
  quantity: number;
}

export function basketLines(
  state: GiftBuilderState,
  catalog: Product[] = seedProducts
): BasketLine[] {
  if (!state.basket) return [];
  const byId = new Map(catalog.map((p) => [p.id, p]));

  return state.basket.items
    .map((item) => {
      const product = byId.get(item.productId);
      return product ? { product, quantity: item.quantity } : null;
    })
    .filter((line): line is BasketLine => line !== null);
}

/**
 * What the customer pays.
 *
 * A predefined basket keeps the store's own price until the customer edits it;
 * once they do, `basePrice` is cleared by the reducer and this falls back to
 * the live sum. Delivery is added on top unless the order clears the
 * free-delivery threshold.
 */
export interface OrderTotals {
  items: number;
  delivery: number;
  total: number;
  freeDelivery: boolean;
}

export function orderTotals(
  state: GiftBuilderState,
  settings: StoreSettings = defaultSettings,
  catalog: Product[] = seedProducts
): OrderTotals {
  const items = state.basket
    ? (state.basket.basePrice ?? draftTotal(state.basket, catalog))
    : 0;

  const wantsDelivery = state.delivery.method === 'delivery';
  const freeDelivery = items >= settings.freeDeliveryOver;
  const delivery = wantsDelivery && !freeDelivery ? settings.deliveryFee : 0;

  return { items, delivery, total: items + delivery, freeDelivery };
}

/* --------------------------------------------------------------------------
   The WhatsApp message
   -------------------------------------------------------------------------- */

export function buildWhatsAppMessage(
  state: GiftBuilderState,
  settings: StoreSettings = defaultSettings,
  catalog: Product[] = seedProducts
): string {
  const lines: string[] = [];
  const totals = orderTotals(state, settings, catalog);
  const p = state.personalization;

  lines.push('הזמנה חדשה 🎁', '');

  lines.push(`שם המזמין: ${state.customer.name.trim() || '—'}`);
  lines.push(`טלפון: ${state.customer.phone.trim() || '—'}`);
  if (state.customer.email.trim()) {
    lines.push(`אימייל: ${state.customer.email.trim()}`);
  }
  lines.push('');

  lines.push(
    `למי המתנה: ${state.recipient ? recipientLabels[state.recipient] : '—'}`
  );
  lines.push(`אירוע: ${occasionLabel(state)}`);
  lines.push(`תקציב: ${budgetLabel(state)}`);
  lines.push(`סגנון: ${styleSummary(state)}`);

  const exclusions = exclusionSummary(state);
  if (exclusions !== 'אין העדפה') {
    lines.push(`לא לכלול: ${exclusions}`);
  }
  lines.push('');

  const items = basketLines(state, catalog);
  if (items.length > 0) {
    lines.push(`המארז שנבחר: ${state.basket?.name ?? ''}`.trim());
    for (const line of items) {
      const quantity = line.quantity > 1 ? ` ×${line.quantity}` : '';
      lines.push(`• ${line.product.name}${quantity}`);
    }
    lines.push('');
  }

  /* Personalization — only the fields they actually filled in. */
  const personalization: string[] = [];
  if (p.embroideryName.trim()) {
    personalization.push(`שם לרקמה: ${p.embroideryName.trim()}`);
  }
  if (p.preferredColor.trim()) {
    personalization.push(`צבע מועדף: ${p.preferredColor.trim()}`);
  }
  if (p.dedication.trim()) {
    personalization.push(`הקדשה: ${p.dedication.trim()}`);
  }
  if (p.note.trim()) {
    personalization.push(`הערה: ${p.note.trim()}`);
  }
  if (personalization.length > 0) {
    lines.push(...personalization, '');
  }

  lines.push(`סה"כ מוצרים: ${formatPrice(totals.items)}`);
  if (totals.delivery > 0) {
    lines.push(`משלוח: ${formatPrice(totals.delivery)}`);
  } else if (state.delivery.method === 'delivery' && totals.freeDelivery) {
    lines.push('משלוח: ללא עלות');
  }
  lines.push(`סה"כ לתשלום: ${formatPrice(totals.total)}`);
  lines.push('');

  if (state.delivery.method === 'pickup') {
    lines.push('איסוף עצמי');
    if (settings.storeAddress) lines.push(settings.storeAddress);
    lines.push('');
  } else if (state.delivery.method === 'delivery') {
    const d = state.delivery;
    lines.push('משלוח:');
    if (d.recipientName.trim()) lines.push(`שם המקבל: ${d.recipientName.trim()}`);
    if (d.recipientPhone.trim()) lines.push(`טלפון: ${d.recipientPhone.trim()}`);
    const where = [d.city.trim(), d.address.trim()].filter(Boolean).join(', ');
    if (where) lines.push(where);
    if (d.date) lines.push(`תאריך: ${formatDate(d.date)}`);
    if (d.courierNotes.trim()) lines.push(`הערות לשליח: ${d.courierNotes.trim()}`);
    lines.push('');
  }

  if (state.greeting.trim()) {
    lines.push('ברכה:', state.greeting.trim(), '');
  }

  lines.push('— נשלח מהאתר של איריס מתנות');

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * wa.me needs the number as digits only, with the country code and no leading
 * zero. Accepts whatever format the owner typed into settings.
 */
export function normalizeWhatsAppNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('972')) return digits;
  if (digits.startsWith('0')) return `972${digits.slice(1)}`;
  return digits;
}

export function whatsAppLink(
  state: GiftBuilderState,
  settings: StoreSettings = defaultSettings,
  catalog: Product[] = seedProducts
): string {
  const number = normalizeWhatsAppNumber(settings.whatsappNumber);
  const text = encodeURIComponent(
    buildWhatsAppMessage(state, settings, catalog)
  );
  return `https://wa.me/${number}?text=${text}`;
}

/** A short enquiry link used by the ready-made catalogue. */
export function basketEnquiryLink(
  basketName: string,
  price: number,
  settings: StoreSettings = defaultSettings
): string {
  const number = normalizeWhatsAppNumber(settings.whatsappNumber);
  const text = encodeURIComponent(
    [
      'היי איריס, ראיתי באתר את',
      `"${basketName}" (${formatPrice(price)})`,
      'ואשמח לפרטים.',
    ].join(' ')
  );
  return `https://wa.me/${number}?text=${text}`;
}
