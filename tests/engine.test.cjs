const path = require('node:path').join(__dirname, '.engine-build');
const { recommend, draftTotal, resolveBudget, scoreBasket, basketPrice, suggestAdditions, swapCandidates } = require(`${path}/lib/recommendation.js`);
const { buildWhatsAppMessage, orderTotals, normalizeWhatsAppNumber } = require(`${path}/lib/order.js`);
const { initialBuilderState, builderReducer } = require(`${path}/lib/builder-state.js`);
const { products } = require(`${path}/data/products.js`);
const { predefinedBaskets } = require(`${path}/data/baskets.js`);

let fails = 0;
const check = (ok, msg, extra='') => { if(!ok){fails++;console.log('FAIL '+msg+(extra?' :: '+extra:''));} else console.log('OK   '+msg); };

const answers = (o) => ({ ...initialBuilderState, ...o,
  budget: { bandId: null, exactAmount: null, ...(o.budget||{}) } });

const names = d => d.items.map(i => products.find(p=>p.id===i.productId)?.name);
const cats  = d => d.items.map(i => products.find(p=>p.id===i.productId)?.category);
const price = d => d.basePrice ?? draftTotal(d);

console.log('\n── budget discipline ─────────────────────────────');
for (const band of ['under-300','300-500','500-750','750-1000','over-1000']) {
  for (const recipient of ['bride','groom','couple','woman','man','new-mother','family']) {
    for (const variant of [0,1,2]) {
      const s = answers({ recipient, occasion:'wedding', budget:{bandId:band}, styles:['luxury'], surpriseMe:true, exclusions:['none'] });
      const { draft } = recommend(s, { variant });
      const { max } = resolveBudget(s);
      const p = price(draft);
      if (p > max * 1.08) { fails++; console.log(`FAIL ${band}/${recipient}/v${variant}: ${p} > ${Math.round(max*1.08)}`); }
      if (draft.items.length === 0) { fails++; console.log(`FAIL ${band}/${recipient}/v${variant}: empty basket`); }
    }
  }
}
console.log('OK   105 combinations stay within budget and are non-empty');

console.log('\n── exclusions are absolute ───────────────────────');
const exTests = [
  ['no-alcohol','wine'], ['no-sweets','sweets'], ['no-skincare','skincare'],
];
for (const [exclusion, blocked] of exTests) {
  let bad = 0;
  for (const recipient of ['bride','groom','couple','woman','man','new-mother','family']) {
    for (const band of ['300-500','500-750','750-1000','over-1000']) {
      for (const variant of [0,1,2]) {
        const s = answers({ recipient, occasion:'holiday', budget:{bandId:band}, styles:['traditional'], surpriseMe:true, exclusions:[exclusion] });
        const { draft } = recommend(s, { variant });
        if (cats(draft).includes(blocked)) { bad++; console.log(`  leaked ${blocked} for ${recipient}/${band}/v${variant}:`, names(draft).join(', ')); }
      }
    }
  }
  check(bad===0, `${exclusion} never yields a ${blocked} item (84 combos)`);
}

console.log('\n── requested categories are honoured ─────────────');
{
  let missing = 0, total = 0;
  for (const cat of ['robe','towels','candles','sweets','wine','skincare','homeware','judaica']) {
    for (const band of ['500-750','750-1000','over-1000']) {
      total++;
      const s = answers({ recipient:'woman', occasion:'birthday', budget:{bandId:band}, styles:['pampering'], includeCategories:[cat], exclusions:['none'] });
      const { draft } = recommend(s, { variant: 5 });   // force the assembler
      if (!cats(draft).includes(cat)) { missing++; console.log(`  ${cat}/${band} missing →`, names(draft).join(', ')); }
    }
  }
  check(missing===0, `assembled baskets include the requested category (${total} combos)`);
}

console.log('\n── "suggest another" actually differs ────────────');
{
  let same = 0, n = 0;
  for (const recipient of ['bride','groom','couple','woman','new-mother','family']) {
    const s = answers({ recipient, occasion:'wedding', budget:{bandId:'500-750'}, styles:['luxury'], surpriseMe:true, exclusions:['none'] });
    const seen = new Set();
    for (const variant of [0,1,2,3]) {
      n++;
      const key = names(recommend(s,{variant}).draft).sort().join('|');
      if (seen.has(key)) same++;
      seen.add(key);
    }
  }
  check(same===0, `every variant yields a distinct basket (${n} draws)`);
}

console.log('\n── predefined baskets win when they should ───────');
{
  const s = answers({ recipient:'bride', occasion:'wedding', budget:{bandId:'500-750'}, styles:['luxury'], includeCategories:['robe','towels'], exclusions:['none'] });
  const r = recommend(s);
  check(r.fromPredefined, 'bride+wedding+luxury uses a store-composed basket', r.draft.name);
  check(r.draft.name === 'מארז כלה יוקרתי', 'and it is the right one', r.draft.name);
  check(price(r.draft) === 649, 'priced at the store’s own 649 ₪', String(price(r.draft)));
}

console.log('\n── exact budget is respected ─────────────────────');
for (const amount of [250, 420, 680, 900, 1400]) {
  const s = answers({ recipient:'couple', occasion:'engagement', budget:{exactAmount:amount}, styles:['romantic'], surpriseMe:true, exclusions:['none'] });
  const { draft } = recommend(s, { variant: 9 });
  const p = price(draft);
  check(p <= amount*1.08, `exact ${amount}₪ → ${p}₪ (ceiling ${Math.round(amount*1.08)})`);
}

console.log('\n── editing clears the fixed price ────────────────');
{
  let s = answers({ recipient:'bride', occasion:'wedding', budget:{bandId:'500-750'}, styles:['luxury'], exclusions:['none'] });
  s = builderReducer(s, { type:'setBasket', value: recommend(s).draft });
  check(s.basket.basePrice === 649, 'starts on the fixed price');
  const victim = s.basket.items[0].productId;
  s = builderReducer(s, { type:'removeItem', productId: victim });
  check(s.basket.basePrice === null, 'removing an item drops the fixed price');
  check(orderTotals(s).items === draftTotal(s.basket), 'total falls back to the live sum');
}

console.log('\n── no duplicate items via swap/add ───────────────');
{
  let s = answers({ recipient:'woman', occasion:'birthday', budget:{bandId:'500-750'}, styles:['pampering'], surpriseMe:true, exclusions:['none'] });
  s = builderReducer(s, { type:'setBasket', value: recommend(s).draft });
  const existing = s.basket.items[1].productId;
  const before = s.basket.items.length;
  s = builderReducer(s, { type:'addItem', productId: existing });
  check(s.basket.items.length === before, 'adding an item already present is a no-op');
  s = builderReducer(s, { type:'swapItem', productId: s.basket.items[0].productId, withProductId: existing });
  const ids = s.basket.items.map(i=>i.productId);
  check(new Set(ids).size === ids.length, 'swapping never duplicates an item');
  // pickers never offer what is already in the basket
  const inBasket = new Set(ids);
  check(suggestAdditions(s, s.basket).every(p=>!inBasket.has(p.id)), 'add-picker excludes basket items');
  check(swapCandidates(s, s.basket, ids[0]).every(p=>!inBasket.has(p.id)), 'swap-picker excludes basket items');
}

console.log('\n── WhatsApp message ──────────────────────────────');
{
  let s = answers({
    recipient:'bride', occasion:'wedding', budget:{bandId:'500-750'}, styles:['luxury'],
    includeCategories:['robe'], exclusions:['no-alcohol'],
    personalization:{embroideryName:'שירה',preferredColor:'',dedication:'',note:''},
    greeting:'מזל טוב!',
    customer:{name:'נועה כהן',phone:'0521112222',whatsapp:'',email:''},
    delivery:{method:'delivery',recipientName:'שירה לוי',recipientPhone:'0533334444',city:'קריית אתא',address:'הרצל 1',date:'2026-08-28',courierNotes:''},
  });
  s = builderReducer(s, { type:'setBasket', value: recommend(s).draft });
  const msg = buildWhatsAppMessage(s);
  for (const needle of ['הזמנה חדשה','שם המזמין: נועה כהן','למי המתנה: כלה','אירוע: חתונה','תקציב: 500–750 ₪','סגנון: יוקרתי','שם לרקמה: שירה','משלוח:','קריית אתא','ברכה:','מזל טוב!']) {
    check(msg.includes(needle), `message contains "${needle}"`);
  }
  check(!msg.includes('undefined') && !msg.includes('NaN'), 'message has no undefined/NaN');
  check(msg.split('\n\n\n').length === 1, 'no triple blank lines');
}

console.log('\n── phone normalisation ───────────────────────────');
for (const [raw, want] of [['0501234567','972501234567'],['972501234567','972501234567'],['+972-50-123-4567','972501234567'],['050-123-4567','972501234567']]) {
  check(normalizeWhatsAppNumber(raw) === want, `${raw} → ${want}`, normalizeWhatsAppNumber(raw));
}

console.log(fails === 0 ? '\n✅ ENGINE PASS — all assertions held' : `\n❌ ${fails} failure(s)`);
process.exit(fails === 0 ? 0 : 1);
