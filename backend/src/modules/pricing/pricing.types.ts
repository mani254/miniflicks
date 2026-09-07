/** Represents a single addon item in a booking */
export interface BookingAddon {
  _id: string;
  name: string;
  price: number;   // in rupees
  count: number;
}

/** Represents a single gift item in a booking */
export interface BookingGift {
  _id: string;
  name: string;
  price: number;   // in rupees
  count: number;
}

/**
 * Represents a cake as stored in the booking document.
 *
 * Pricing rules (per business requirement):
 *  - free: true  + special: false → price = 0    (package includes one free regular cake)
 *  - free: true  + special: true  → price = specialPrice (special cakes always pay premium even if "free" slot)
 *  - free: false + any            → price = cake.price   (paid cakes always use regular price)
 */
export interface BookingCake {
  _id: string;
  name: string;
  price: number;         // regular price in rupees
  specialPrice: number;  // special/premium price in rupees
  special: boolean;      // true = this is a premium/special cake
  free: boolean;         // true = this slot is package-included (normally free)
}

/** Screen data needed for people surcharge calculation */
export interface PricingScreen {
  minPeople: number;
  extraPersonPrice: number;  // in rupees per extra person
}

/** Coupon data needed for discount calculation */
export interface PricingCoupon {
  type: 'fixed' | 'percentage';
  discount: number;  // rupees for fixed, percentage for percentage
}

/** Full input to the pricing service */
export interface PricingInput {
  screen: PricingScreen;
  packagePriceRupees: number;
  occasionPriceRupees: number;
  addons: BookingAddon[];
  gifts: BookingGift[];
  cakes: BookingCake[];
  numberOfPeople: number;
  ledName: string;
  coupon: PricingCoupon | null;
}

/** Detailed pricing breakdown — all amounts in paise */
export interface PricingBreakdown {
  packagePricePaise: number;
  occasionPricePaise: number;
  addonsPricePaise: number;
  ledSurchargePaise: number;
  giftsPricePaise: number;
  cakesPricePaise: number;
  extraPeoplePricePaise: number;
  subtotalPaise: number;
  couponDiscountPaise: number;   // always <= 0
  totalPricePaise: number;
}

/** The final pricing result, with both paise and rupee totals */
export interface PricingResult extends PricingBreakdown {
  totalPriceRupees: number;
  advancePriceRupees: number;
  remainingAmountRupees: number;
}
