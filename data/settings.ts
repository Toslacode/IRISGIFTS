import type { StoreSettings } from '@/types';

/* ==========================================================================
   Store configuration.
   The WhatsApp number lives here and nowhere else — no component ever holds
   a phone number of its own.
   ========================================================================== */

export const defaultSettings: StoreSettings = {
  /* International format, digits only — this is what wa.me expects. */
  whatsappNumber: '972500000000',
  storePhone: '050-000-0000',
  storeAddress: 'הגפן 12, קריית אתא',
  deliveryAreas: [
    'קריית אתא',
    'קריית ביאליק',
    'קריית מוצקין',
    'קריית ים',
    'חיפה',
    'נשר',
    'טירת כרמל',
    'יקנעם',
    'עכו',
    'נהריה',
  ],
  pickupAvailable: true,
  deliveryFee: 39,
  freeDeliveryOver: 700,
};

/** Where the admin screen persists owner edits in the browser. */
export const SETTINGS_STORAGE_KEY = 'irisgifts:settings';
export const CATALOG_STORAGE_KEY = 'irisgifts:catalog';
export const BUILDER_STORAGE_KEY = 'irisgifts:builder';
