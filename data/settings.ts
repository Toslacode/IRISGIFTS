import type { StoreSettings } from '@/types';

/* ==========================================================================
   Store configuration.
   The WhatsApp number lives here and nowhere else — no component ever holds
   a phone number of its own.
   ========================================================================== */

export const defaultSettings: StoreSettings = {
  /* International format, digits only — this is what wa.me expects.
     This is the shop's mobile; confirm it is the number that receives
     WhatsApp before going live. */
  whatsappNumber: '972506779675',
  storePhone: '050-6779675',
  storeAddress: 'העצמאות 27, קריית אתא',
  storeCity: 'קריית אתא',
  facebookUrl: 'https://www.facebook.com/irismatanot',
  messengerUrl: 'https://m.me/irismatanot',
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
