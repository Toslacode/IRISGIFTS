'use client';

import { useMemo, useState } from 'react';

import { useBuilder } from '@/components/gift-builder/BuilderContext';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ProductImage } from '@/components/ui/ProductImage';
import { recipientLabels } from '@/data/taxonomy';
import {
  basketLines,
  budgetLabel,
  exclusionSummary,
  formatDate,
  formatPrice,
  occasionLabel,
  orderTotals,
  styleSummary,
  whatsAppLink,
} from '@/lib/order';
import { useStore } from '@/lib/store-context';
import type { StepId } from '@/lib/steps';
import { cn } from '@/lib/utils';

/* ==========================================================================
   The last screen before WhatsApp.

   Everything the customer decided, in one place, each block editable in a tap.
   The point is that Iris receives a finished decision — so the customer has to
   be able to see and correct the whole thing first.
   ========================================================================== */

function Row({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-3 last:border-b-0">
      <dt className="shrink-0 text-[0.9375rem] text-ink-muted">{label}</dt>
      <dd className="flex items-start gap-2 text-end">
        <span className="font-medium text-ink">{value}</span>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="-my-2.5 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-faint transition-colors duration-200 hover:bg-gold-wash hover:text-gold-deep"
          >
            <Icon name="edit" size={15} label={`עריכת ${label}`} />
          </button>
        )}
      </dd>
    </div>
  );
}

function Block({
  title,
  editStep,
  onEdit,
  children,
}: {
  title: string;
  editStep?: StepId;
  onEdit?: (step: StepId) => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-panel border border-line bg-surface p-6 shadow-soft">
      <div className="mb-2 flex items-center justify-between gap-4">
        <h2 className="text-heading">{title}</h2>
        {editStep && onEdit && (
          <button
            type="button"
            onClick={() => onEdit(editStep)}
            className="min-h-11 cursor-pointer rounded-pill px-3 text-[0.875rem] font-medium text-gold-deep transition-colors duration-200 hover:bg-gold-wash"
          >
            עריכה
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

export function OrderSummary() {
  const { state, goTo, embedded } = useBuilder();
  const Heading = embedded ? 'h2' : 'h1';
  const { settings, products } = useStore();
  const [sent, setSent] = useState(false);

  const lines = useMemo(
    () => basketLines(state, products),
    [state, products]
  );
  const totals = useMemo(
    () => orderTotals(state, settings, products),
    [state, settings, products]
  );

  const link = useMemo(
    () => whatsAppLink(state, settings, products),
    [state, settings, products]
  );

  const p = state.personalization;
  const hasPersonalization =
    p.embroideryName || p.preferredColor || p.dedication || p.note;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-2 text-center">
        <Heading className="text-title">סיכום ההזמנה</Heading>
        <p className="text-lg text-ink-muted">
          עברו על הפרטים, ואם הכול נכון — שלחו לאיריס
        </p>
      </header>

      {/* --- The basket ------------------------------------------------- */}
      <Block title="המארז" editStep="recommendation" onEdit={goTo}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="size-20 shrink-0 overflow-hidden rounded-card">
              <ProductImage
                src={state.basket?.image ?? ''}
                alt=""
                category={lines[0]?.product.category ?? 'personalized'}
                className="size-full"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="font-display text-lg font-semibold text-ink">
                {state.basket?.name ?? '—'}
              </p>
              <p className="text-[0.875rem] text-ink-muted">
                {lines.length} פריטים
              </p>
            </div>
          </div>

          <ul className="flex flex-col gap-1.5">
            {lines.map((line) => (
              <li
                key={line.product.id}
                className="flex items-baseline justify-between gap-4 text-[0.9375rem]"
              >
                <span className="text-ink-soft">
                  <span aria-hidden="true" className="text-gold me-2">
                    •
                  </span>
                  {line.product.name}
                </span>
                <span className="shrink-0 tabular-nums text-ink-muted">
                  {formatPrice(line.product.price)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Block>

      {/* --- The answers -------------------------------------------------- */}
      <Block title="למי ולמה">
        <dl>
          <Row
            label="למי המתנה"
            value={state.recipient ? recipientLabels[state.recipient] : '—'}
            onEdit={() => goTo('recipient')}
          />
          <Row
            label="אירוע"
            value={occasionLabel(state)}
            onEdit={() => goTo('occasion')}
          />
          <Row
            label="תקציב"
            value={budgetLabel(state)}
            onEdit={() => goTo('budget')}
          />
          <Row
            label="סגנון"
            value={styleSummary(state)}
            onEdit={() => goTo('style')}
          />
          <Row
            label="לא לכלול"
            value={exclusionSummary(state)}
            onEdit={() => goTo('exclude')}
          />
        </dl>
      </Block>

      {hasPersonalization && (
        <Block title="התאמה אישית" editStep="personalization" onEdit={goTo}>
          <dl>
            {p.embroideryName && (
              <Row label="שם לרקמה" value={p.embroideryName} />
            )}
            {p.preferredColor && (
              <Row label="צבע מועדף" value={p.preferredColor} />
            )}
            {p.dedication && <Row label="הקדשה" value={p.dedication} />}
            {p.note && <Row label="הערה" value={p.note} />}
          </dl>
        </Block>
      )}

      {state.greeting.trim() && (
        <Block title="הברכה" editStep="greeting" onEdit={goTo}>
          <p className="whitespace-pre-line rounded-card bg-gold-wash/50 p-5 font-display text-lg leading-loose text-ink">
            {state.greeting}
          </p>
        </Block>
      )}

      <Block title="מסירה" editStep="delivery" onEdit={goTo}>
        <dl>
          <Row
            label="אופן קבלה"
            value={
              state.delivery.method === 'pickup'
                ? 'איסוף עצמי'
                : state.delivery.method === 'delivery'
                  ? 'משלוח'
                  : '—'
            }
          />
          {state.delivery.method === 'pickup' && (
            <Row label="כתובת החנות" value={settings.storeAddress} />
          )}
          {state.delivery.method === 'delivery' && (
            <>
              {state.delivery.recipientName && (
                <Row label="שם המקבל" value={state.delivery.recipientName} />
              )}
              {state.delivery.recipientPhone && (
                <Row label="טלפון" value={state.delivery.recipientPhone} />
              )}
              <Row
                label="כתובת"
                value={
                  [state.delivery.city, state.delivery.address]
                    .filter(Boolean)
                    .join(', ') || '—'
                }
              />
              {state.delivery.date && (
                <Row label="תאריך" value={formatDate(state.delivery.date)} />
              )}
              {state.delivery.courierNotes && (
                <Row label="הערות לשליח" value={state.delivery.courierNotes} />
              )}
            </>
          )}
        </dl>
      </Block>

      <Block title="פרטי המזמין" editStep="customer" onEdit={goTo}>
        <dl>
          <Row label="שם" value={state.customer.name || '—'} />
          <Row label="טלפון" value={state.customer.phone || '—'} />
          {state.customer.whatsapp && (
            <Row label="וואטסאפ" value={state.customer.whatsapp} />
          )}
          {state.customer.email && (
            <Row label="אימייל" value={state.customer.email} />
          )}
        </dl>
      </Block>

      {/* --- Total and send ---------------------------------------------- */}
      <section className="rounded-panel border border-gold-soft bg-gold-wash/60 p-6">
        <dl className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-ink-soft">מוצרים</dt>
            <dd className="tabular-nums text-ink">
              {formatPrice(totals.items)}
            </dd>
          </div>

          {state.delivery.method === 'delivery' && (
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-ink-soft">משלוח</dt>
              <dd
                className={cn(
                  'tabular-nums',
                  totals.freeDelivery ? 'text-success' : 'text-ink'
                )}
              >
                {totals.freeDelivery ? 'ללא עלות' : formatPrice(totals.delivery)}
              </dd>
            </div>
          )}

          <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-gold-soft pt-3">
            <dt className="font-display text-lg font-semibold text-ink">
              סה"כ
            </dt>
            <dd className="font-display text-3xl font-semibold tabular-nums text-ink">
              {formatPrice(totals.total)}
            </dd>
          </div>
        </dl>

        <p className="mt-3 text-[0.875rem] leading-relaxed text-ink-muted">
          זו הצעת מחיר. איריס תאשר איתכם את הפרטים והמועד לפני התשלום.
        </p>
      </section>

      {/* The end of the flow, and it has to look like it. Everything above is
          review; this is the one thing left to do, so it gets its own lit
          panel, the total beside it and the largest control on the page. */}
      <section className="flex flex-col gap-4 rounded-panel border border-gold bg-[radial-gradient(110%_130%_at_50%_0%,#fdf7ec_0%,#f7ecd9_100%)] p-6 text-center shadow-glass sm:p-8">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-display text-[1.375rem] font-semibold text-ink sm:text-[1.625rem]">
            נשאר רק לשלוח
          </h2>
          <p className="text-[0.9375rem] leading-relaxed text-ink-muted">
            ההודעה נכתבת מהתשובות שלכם — המארז, הברכה, המשלוח והפרטים. נפתח
            וואטסאפ עם הכול מוכן, אתם רק לוחצים שליחה.
          </p>
        </div>

        <ButtonLink
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          size="lg"
          onClick={() => setSent(true)}
          className="w-full text-[1.0625rem]"
        >
          <Icon name="whatsapp" size={22} />
          שליחת ההזמנה לאיריס בוואטסאפ
        </ButtonLink>

        <p className="text-[0.875rem] text-ink-soft">
          סה"כ להזמנה:{' '}
          <span className="font-display font-semibold tabular-nums text-ink">
            {formatPrice(totals.total)}
          </span>
        </p>
      </section>

      <Button
        variant="ghost"
        onClick={() => goTo('recommendation')}
        className="mx-auto"
      >
        <Icon name="arrow-right" size={18} />
        חזרה לעריכת המארז
      </Button>

      {/* Success state — WhatsApp opens in a new tab, so this tab confirms
          what just happened rather than looking like nothing did. */}
      {sent && (
        <div
          className="anim-rise flex items-start gap-4 rounded-panel border border-success/25 bg-success-wash p-6"
          role="status"
        >
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-success/12 text-success">
            <Icon name="check" size={20} strokeWidth={2.2} />
          </span>
          <div className="flex flex-col gap-1">
            <p className="font-display text-lg font-semibold text-ink">
              ההזמנה מוכנה בוואטסאפ
            </p>
            <p className="text-[0.9375rem] leading-relaxed text-ink-muted">
              נפתח חלון עם ההודעה המלאה. לוחצים שליחה, ואיריס חוזרת אליכם
              לאישור. אם החלון לא נפתח — בדקו שחוסם החלונות הקופצים כבוי.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
