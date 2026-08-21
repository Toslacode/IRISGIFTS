# IRISGIFTS

A guided gift-building experience for a premium Israeli gift-basket boutique.

The store owner used to run every order through WhatsApp by hand — who is the
gift for, what is the occasion, what is the budget, what style, what should be
inside, what should not, personalisation, delivery, and the greeting card. That
is ten to twenty messages before anything is decided.

This site asks all of it, in order, one question at a time, and hands Iris a
finished order. The customer arrives at WhatsApp having already chosen; she
opens a message that reads like a completed brief instead of an opening line.

**This is not a normal shop.** The guided builder is the product. The
ready-made catalogue exists as a secondary route for people who would rather
browse than be asked.

---

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

| Command | What it does |
|---|---|
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Recommendation-engine assertions (see below) |
| `npm run check` | typecheck → test → build |
| `npm run media` | Turns your two source clips into the hero video and scroll frames |

---

## The customer journey

```
  /                    cinematic hero → scroll-driven basket opening → gift
                       stories → how it works → main CTA
       │
       └─→ /build      1. למי המתנה?          who it is for
                       2. מה האירוע?           occasion
                       3. מה התקציב?           budget band, or an exact figure
                       4. איזה סגנון?          style (one or two)
                       5. מה שיהיה במארז?      wanted categories, or "choose for me"
                       6. מה לא?               exclusions
                       7. התאמה אישית          personalisation (skippable)
                          ↓
                       "אנחנו מרכיבים לכם את המתנה"
                          ↓
                       the recommended basket — swap, remove, add,
                       or ask for a different one entirely
                          ↓
                       greeting card → delivery → who's ordering → summary
                          ↓
                       שלחו את ההזמנה לאיריס  → WhatsApp, message pre-filled

  /baskets             ready-made baskets, filterable by occasion
  /baskets/[id]        one basket in full
  /admin               products, baskets, and store settings
```

Answers survive going back, refreshing, and closing the tab. Every answer is
editable from the final summary in one tap.

---

## Structure

```
app/                      routes (App Router)
  page.tsx                the cinematic landing page
  build/                  the gift builder
  baskets/                catalogue + per-basket pages
  admin/                  the owner's dashboard

components/
  home/                   hero, scroll sequence, stories, CTA
  gift-builder/           builder shell, progress, and the twelve screens
    steps/
  products/               catalogue cards and basket detail
  checkout/               order summary
  admin/                  product / basket / settings management
  ui/                     Button, Icon, ChoiceCard, Field, ProductImage, …

data/                     the catalogue and the vocabulary
  products.ts             27 products
  baskets.ts              9 store-composed baskets
  taxonomy.ts             recipients, occasions, budgets, styles, categories
  settings.ts             WhatsApp number, delivery areas, storage keys

lib/
  recommendation.ts       the engine
  builder-state.ts        the reducer every answer flows through
  order.ts                totals and the WhatsApp message
  steps.ts                the flow, declared once
  store-context.tsx       catalogue + settings, overlaid with admin edits

types/index.ts            the domain, in one file
styles/globals.css        design tokens and base styles
scripts/prepare-media.mjs the video pipeline
tests/                    engine assertions
```

---

## How the recommendation works

Deterministic. No AI, no randomness the customer cannot re-roll.

**First, a basket the store composed.** Every predefined basket is scored
against the answers — recipient, occasion, style, the categories asked for, and
distance from the budget. Clear the threshold and it is used as-is. This is
what keeps odd machine-made combinations away from customers, and it is why the
owner's tags in `/admin` matter.

**Otherwise, assemble one.** Products are scored on the same signals, then
filled greedily toward the budget in three passes: one item from each requested
category first, then the best of what is left, then small items to top up if
the basket is coming in light. At most two items per category, so nobody is
offered four candles.

Two rules hold everywhere, and the test suite proves them across ~300
generated combinations:

- **The budget is a ceiling**, not a suggestion. Nothing exceeds it by more
  than 8%.
- **An exclusion is absolute.** "בלי אלכוהול" means no wine reaches the
  customer, from either path — a predefined basket containing one is
  disqualified outright rather than edited.

`הציעו לי מארז אחר` increments a variant counter: the next-best store basket,
and once those run out, a rotated assembly. Same answers plus same variant
always give the same basket.

### Adjusting it

Weights are at the top of `lib/recommendation.ts`:

```ts
const WEIGHTS = { recipient: 30, occasion: 26, style: 14, requestedCategory: 34, … };
const BASKET_MATCH_THRESHOLD = 62;   // how eager to reuse a store basket
const BUDGET_CEILING = 1.08;         // how far over budget is tolerable
```

Raise `BASKET_MATCH_THRESHOLD` for more bespoke assembly, lower it for more of
the owner's own baskets.

---

## Tests

`npm test` compiles the engine and asserts the invariants that actually matter
to the business:

- 105 recipient × budget × variant combinations stay inside budget and are
  never empty
- each exclusion holds across 84 combinations
- a requested category always appears in an assembled basket
- every "suggest another" yields a genuinely different basket
- editing a predefined basket drops its fixed price and falls back to the live sum
- swapping and adding never duplicate an item
- the WhatsApp message contains every field and no `undefined`/`NaN`
- phone numbers normalise to `wa.me` format from any way an Israeli types them

---

## Adding your own content

### The WhatsApp number

`data/settings.ts` → `whatsappNumber`, or change it in `/admin` → הגדרות.
It lives in exactly one place; no component holds a phone number.

```ts
whatsappNumber: '972500000000',   // ← replace with the real number
```

Until you do, orders go to a placeholder number.

### Products and baskets

Edit `data/products.ts` and `data/baskets.ts` for the shipped defaults, or use
`/admin` for day-to-day changes. Admin edits persist to `localStorage` in that
browser — this is an MVP with no backend, and the admin says so plainly. When a
database is added, the same screens keep working against it.

### Photography

Drop files into `public/products/` and `public/images/` matching the `image`
paths in the data files. Until a file exists, cards render a designed
placeholder — a warm tinted panel carrying the category mark — so the layout
keeps its rhythm and nothing shows a broken-image box.

### The hero and scroll footage

Two clips, into `public/video/source/`:

- `hero.mp4` — slow ambient motion behind the headline, looping. No hard cuts.
- `scroll.mp4` — **one continuous transformation**: the basket closed, opening,
  contents revealed. The visitor scrubs this with their scroll, so loops and
  cuts read as noise.

Both: 6–12 seconds, 1080p+, no burned-in text, subject centred.

```bash
npm i -D ffmpeg-static     # once
npm run media
```

That writes `public/video/hero.webm` (+ mp4 fallback and poster) and
`public/frames/` with a manifest. The site picks the footage up automatically.

**It works today without them.** The hero falls back to a lit champagne ground,
and the scroll section plays a composed scene driven by the same scroll
progress — the basket lid lifts, the ribbon fades, and the contents rise out in
sequence. Nothing needs changing when the real footage arrives.

---

## Design

Warm ivory canvas, soft champagne gold, near-black navy ink. Every colour,
radius, shadow and easing is a token in `styles/globals.css`; components hold
no raw hex.

The site is Hebrew and fully RTL — `dir="rtl"`, logical properties throughout
(`start-*`, `end-*`, `margin-inline-*`), the skip link parked vertically rather
than at a negative inline offset, and the Latin wordmark given its own
`dir="ltr"` so it does not render as "GIFTS IRIS".

Type is Heebo for display and Assistant for body, self-hosted from npm with
Hebrew and Latin subsets under one family. Letter-spacing is never negative —
it collapses Hebrew letterforms — and emphasis is by weight, since Hebrew has
no true italics.

Verified at 390 / 768 / 1440: no horizontal scroll, no console errors, every
image has alt text, every field has a real `<label>`, every icon-only control
has a name, one `<h1>` per page, and every touch target clears 44px.

---

## What this deliberately does not do

No payment, no accounts, no CRM, no inventory management, no AI. The order ends
in WhatsApp because that is where this business already lives, and the point of
the MVP is to prove the guided flow — not to replace the conversation Iris has
about dates and final confirmation.

The greeting step shows a disabled "עזרו לי לכתוב ברכה ✨" affordance so the
future is visible without pretending it exists.

---

*The products, prices, and contact details are demo content.*
