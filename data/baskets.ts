import type { PredefinedBasket } from '@/types';

/* ==========================================================================
   Baskets the store has composed by hand.
   When a customer's answers line up with one of these, the engine uses it as
   the base instead of assembling from scratch — the owner keeps control and
   odd combinations never reach the customer.
   ========================================================================== */

export const predefinedBaskets: PredefinedBasket[] = [
  {
    id: 'bride-luxury',
    name: 'מארז כלה יוקרתי',
    description:
      'החלוק, המגבות והריח שמלווים את הכלה מהבוקר שלפני החתונה ועד הערב עצמו.',
    rationale:
      'בנינו אותו סביב חלוק אישי, כי זה הפריט שכלה משתמשת בו בפועל בבוקר החתונה — והוסיפו לו מגבות, נר ומוצרי טיפוח כדי שהמארז ירגיש שלם.',
    productIds: [
      'robe-white',
      'towels-pair',
      'candle-soy',
      'body-cream',
      'gift-wrap-lux',
    ],
    basePrice: 649,
    image: '/images/basket-bride-luxury.jpg',
    recipients: ['bride'],
    occasions: ['wedding', 'hina'],
    styles: ['luxury', 'romantic', 'pampering'],
    active: true,
    featured: true,
  },
  {
    id: 'bride-soft',
    name: 'מארז כלה עדין',
    description: 'גרסה רכה ונקייה יותר — פודרה, לבנדר ואור רך.',
    rationale:
      'לכלה שמעדיפה עדינות על פני ברק: חלוק קטיפה בגוון פודרה, מלח אמבט ונר, בלי עומס.',
    productIds: ['robe-blush', 'bath-salts', 'candle-soy', 'gift-wrap-lux'],
    basePrice: 489,
    image: '/images/basket-bride-soft.jpg',
    recipients: ['bride', 'woman'],
    occasions: ['wedding', 'hina', 'engagement'],
    styles: ['romantic', 'clean', 'pampering'],
    active: true,
    featured: true,
  },
  {
    id: 'groom-classic',
    name: 'מארז חתן קלאסי',
    description: 'יין, טיפוח וספר ברכות — מארז מדוד ומכובד.',
    rationale:
      'חתנים בדרך כלל מעדיפים מארז ממוקד: יין טוב, סט טיפוח אמיתי וספר ברכות שנשאר איתם.',
    productIds: ['wine-red', 'grooming-set', 'blessing-book', 'gift-wrap-lux'],
    basePrice: 579,
    image: '/images/basket-groom-classic.jpg',
    recipients: ['groom', 'man'],
    occasions: ['wedding', 'shabbat-hatan', 'engagement'],
    styles: ['luxury', 'traditional', 'clean'],
    active: true,
    featured: true,
  },
  {
    id: 'couple-home',
    name: 'מארז לזוג — בית חדש',
    description: 'קרש הגשה, כוסות קריסטל ויין לפתיחת הבית.',
    rationale:
      'לזוג שרק התחיל: דברים שנשארים במטבח ומשמשים אותם הרבה אחרי האירוע.',
    productIds: [
      'serving-board',
      'glasses-pair',
      'wine-red',
      'honey-jar',
      'gift-wrap-lux',
    ],
    basePrice: 689,
    image: '/images/basket-couple-home.jpg',
    recipients: ['couple', 'family'],
    occasions: ['wedding', 'engagement', 'holiday'],
    styles: ['clean', 'luxury', 'traditional'],
    active: true,
    featured: true,
  },
  {
    id: 'new-mother',
    name: 'מארז ליולדת',
    description: 'רגע של שקט ליולדת, ושמיכה רכה לתינוק.',
    rationale:
      'המארז הזה נותן משהו ליולדת עצמה — ולא רק לתינוק. חלוק, קרם, תה ועוגיות, ושמיכה עם שם.',
    productIds: [
      'robe-blush',
      'baby-blanket',
      'body-cream',
      'tea-collection',
      'cookies-box',
    ],
    basePrice: 719,
    image: '/images/basket-new-mother.jpg',
    recipients: ['new-mother', 'family'],
    occasions: ['birth'],
    styles: ['pampering', 'clean', 'romantic'],
    active: true,
    featured: true,
  },
  {
    id: 'birthday-pamper',
    name: 'מארז יום הולדת מפנק',
    description: 'טיפוח, שוקולד ונר — מארז שמרגיש כמו יום חופש.',
    rationale:
      'ליום הולדת בלי אירוע גדול: הכול מכוון להרגשה טובה בערב אחד, לא לאחסון בארון.',
    productIds: [
      'hand-cream-set',
      'chocolate-praline',
      'candle-soy',
      'bath-salts',
      'gift-wrap-lux',
    ],
    basePrice: 419,
    image: '/images/basket-birthday-pamper.jpg',
    recipients: ['woman', 'other'],
    occasions: ['birthday', 'thanks', 'no-occasion'],
    styles: ['pampering', 'colorful', 'romantic'],
    active: true,
  },
  {
    id: 'holiday-family',
    name: 'מארז חג למשפחה',
    description: 'יין, דבש, נר הבדלה ושוקולד — מארז שכל הבית נהנה ממנו.',
    rationale:
      'מארז חג שמתאים להגיש על שולחן: כולם לוקחים ממנו משהו, ואין בו פריט שמתאים רק לאדם אחד.',
    productIds: [
      'wine-red',
      'honey-jar',
      'candle-havdalah',
      'chocolate-bar-set',
      'tea-collection',
    ],
    basePrice: 529,
    image: '/images/basket-holiday-family.jpg',
    recipients: ['family', 'couple'],
    occasions: ['holiday', 'thanks', 'shabbat-hatan'],
    styles: ['traditional', 'colorful', 'clean'],
    active: true,
    featured: true,
  },
  {
    id: 'thanks-small',
    name: 'מארז תודה קטן',
    description: 'מחווה מדויקת בלי להעמיס — סבון, נר ופרלינים.',
    rationale:
      'כשרוצים להגיד תודה בלי שהמקבל ירגיש לא בנוח: קטן, יפה, ובטעם טוב.',
    productIds: ['soap-artisan', 'candle-soy', 'chocolate-praline'],
    basePrice: 239,
    image: '/images/basket-thanks-small.jpg',
    recipients: ['woman', 'man', 'family', 'other'],
    occasions: ['thanks', 'no-occasion'],
    styles: ['clean', 'pampering'],
    active: true,
  },
  {
    id: 'shabbat-hatan',
    name: 'מארז שבת חתן',
    description: 'פמוטים, ספר ברכות ויין — לשבת שלפני החתונה.',
    rationale:
      'המארז הקלאסי לשבת חתן: פריטים מסורתיים שנשארים בבית הזוג הרבה אחרי.',
    productIds: [
      'candlesticks',
      'blessing-book',
      'wine-red',
      'candle-havdalah',
      'gift-wrap-lux',
    ],
    basePrice: 599,
    image: '/images/basket-shabbat-hatan.jpg',
    recipients: ['groom', 'couple', 'bride'],
    occasions: ['shabbat-hatan', 'wedding'],
    styles: ['traditional', 'luxury'],
    active: true,
  },
];

export const basketById = new Map(predefinedBaskets.map((b) => [b.id, b]));
