/**
 * PricingService — the single source of truth for ALL booking price calculations.
 *
 * BUSINESS RULES (as confirmed with product owner):
 *
 * 1. PACKAGE PRICE
 *    - Use the package's `customPrice` for the selected date if one exists,
 *      otherwise use `package.price`.
 *
 * 2. OCCASION PRICE
 *    - Added to total from DB (never from frontend).
 *
 * 3. ADD-ONS
 *    - price × count for each addon.
 *    - If "LED Name" addon is selected, add ₹30 for each character beyond 8.
 *
 * 4. GIFTS
 *    - price × count for each gift.
 *
 * 5. CAKES — SPECIAL PRICING RULES:
 *    The package may include one free cake slot (cakeData.free === true).
 *    - free: true  + special: false  →  effective price = 0   (free slot, regular cake)
 *    - free: true  + special: true   →  effective price = cake.specialPrice
 *                                       (special cakes always charge their premium even on free slot)
 *    - free: false + any             →  effective price = cake.price
 *                                       (subsequent/extra cakes always charge regular price)
 *
 * 6. EXTRA PEOPLE
 *    - If numberOfPeople > screen.minPeople:
 *      extra charge = (numberOfPeople - minPeople) × screen.extraPersonPrice
 *
 * 7. COUPON
 *    - fixed:      discount = coupon.discount (rupees), always negative
 *    - percentage: discount = floor(coupon.discount% × subtotal), always negative
 *    - Applied AFTER all other components are summed (subtotal).
 *
 * All internal calculations use INTEGER PAISE to avoid floating-point errors.
 * Convert to rupees only for storage and API responses.
 */

import {
  toPaise,
  fromPaise,
  multiplyPaise,
  applyPercentageDiscountPaise,
} from '../../shared/utils/currency';
import { config } from '../../config/env';
import type {
  BookingAddon,
  BookingCake,
  BookingGift,
  PricingBreakdown,
  PricingCoupon,
  PricingInput,
  PricingResult,
  PricingScreen,
} from './pricing.types';

// ─── Internal pure calculation functions ─────────────────────────────────────

/**
 * Returns the effective price (in paise) for a single cake, applying
 * the free/special cake business rules.
 */
export function getCakeEffectivePricePaise(cake: BookingCake): number {
  if (cake.free) {
    // Free slot from package — regular cakes are free, special cakes pay specialPrice
    return cake.special ? toPaise(cake.specialPrice) : 0;
  }
  // Extra cakes beyond the package-included one always use regular price
  return toPaise(cake.price);
}

/**
 * Calculates the LED name surcharge in paise.
 * ₹30 per character beyond the first 8 characters.
 */
export function calcLedSurchargePaise(
  ledName: string,
  hasLedNameAddon: boolean,
): number {
  if (!hasLedNameAddon || ledName.length <= config.booking.ledFreeCharacters) {
    return 0;
  }
  const extraChars = ledName.length - config.booking.ledFreeCharacters;
  return toPaise(extraChars * config.booking.ledExtraChargePerChar);
}

function calcPackagePricePaise(packagePriceRupees: number): number {
  return toPaise(packagePriceRupees);
}

function calcOccasionPricePaise(occasionPriceRupees: number): number {
  return toPaise(occasionPriceRupees);
}

function calcAddonsPricePaise(addons: BookingAddon[]): number {
  return addons.reduce((sum, addon) => sum + multiplyPaise(toPaise(addon.price), addon.count), 0);
}

function calcGiftsPricePaise(gifts: BookingGift[]): number {
  return gifts.reduce((sum, gift) => sum + multiplyPaise(toPaise(gift.price), gift.count), 0);
}

/**
 * Sum effective prices for all cakes.
 * PURE function — does not mutate the input array.
 */
export function calcCakesPricePaise(cakes: BookingCake[]): number {
  return cakes.reduce((sum, cake) => sum + getCakeEffectivePricePaise(cake), 0);
}

function calcExtraPeoplePricePaise(numberOfPeople: number, screen: PricingScreen): number {
  const extra = Math.max(0, numberOfPeople - screen.minPeople);
  return multiplyPaise(toPaise(screen.extraPersonPrice), extra);
}

function calcCouponDiscountPaise(
  coupon: PricingCoupon | null,
  subtotalPaise: number,
): number {
  if (!coupon) return 0;

  if (coupon.type === 'fixed') {
    // Fixed discount — always negative
    return -toPaise(coupon.discount);
  }

  // Percentage discount — use floor to prevent rounding in customer's favor
  return -applyPercentageDiscountPaise(subtotalPaise, coupon.discount);
}

/**
 * Checks whether the "LED Name" addon is present in the booking.
 */
function hasLedNameAddon(addons: BookingAddon[]): boolean {
  return addons.some((a) => a.name === 'LED Name');
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Calculate the complete price breakdown for a booking.
 *
 * This is the ONLY function that should compute prices anywhere in the backend.
 * The frontend may show estimates, but the final price always comes from this function.
 */
export function calculateBookingPrice(input: PricingInput): PricingResult {
  const packagePricePaise = calcPackagePricePaise(input.packagePriceRupees);
  const occasionPricePaise = calcOccasionPricePaise(input.occasionPriceRupees);
  const addonsPricePaise = calcAddonsPricePaise(input.addons);
  const ledSurchargePaise = calcLedSurchargePaise(input.ledName, hasLedNameAddon(input.addons));
  const giftsPricePaise = calcGiftsPricePaise(input.gifts);
  const cakesPricePaise = calcCakesPricePaise(input.cakes);
  const extraPeoplePricePaise = calcExtraPeoplePricePaise(input.numberOfPeople, input.screen);

  const subtotalPaise =
    packagePricePaise +
    occasionPricePaise +
    addonsPricePaise +
    ledSurchargePaise +
    giftsPricePaise +
    cakesPricePaise +
    extraPeoplePricePaise;

  const couponDiscountPaise = calcCouponDiscountPaise(input.coupon, subtotalPaise);

  const totalPricePaise = Math.max(0, subtotalPaise + couponDiscountPaise);
  const totalPriceRupees = fromPaise(totalPricePaise);

  // Advance payment: min ₹999 or full payment
  const advancePriceRupees = Math.min(
    config.booking.minAdvancePaymentRupees,
    totalPriceRupees,
  );
  const remainingAmountRupees = Math.max(0, totalPriceRupees - advancePriceRupees);

  const breakdown: PricingBreakdown = {
    packagePricePaise,
    occasionPricePaise,
    addonsPricePaise,
    ledSurchargePaise,
    giftsPricePaise,
    cakesPricePaise,
    extraPeoplePricePaise,
    subtotalPaise,
    couponDiscountPaise,
    totalPricePaise,
  };

  return {
    ...breakdown,
    totalPriceRupees,
    advancePriceRupees,
    remainingAmountRupees,
  };
}

/**
 * Validates a coupon for a given booking date.
 * Returns the coupon discount or throws if invalid.
 *
 * Expiry rule (fixes M3):
 * A coupon is valid if the booking date is <= the coupon expiry date (inclusive, end of day).
 */
export function validateCouponExpiry(
  couponExpireDate: Date,
  bookingDate: Date,
): boolean {
  // Set coupon expiry to end of its expiry day
  const expiryEndOfDay = new Date(couponExpireDate);
  expiryEndOfDay.setHours(23, 59, 59, 999);

  // Set booking to start of its booking day
  const bookingStartOfDay = new Date(bookingDate);
  bookingStartOfDay.setHours(0, 0, 0, 0);

  return bookingStartOfDay <= expiryEndOfDay;
}

/**
 * Determines the package price for a given date,
 * considering custom pricing overrides.
 */
export function getPackagePriceForDate(
  packageBase: { price: number; customPrice: Array<{ date: Date; price: number }> },
  selectedDate: Date,
): number {
  const targetDate = new Date(selectedDate);
  targetDate.setHours(0, 0, 0, 0);

  const customEntry = packageBase.customPrice.find((entry) => {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    return entryDate.getTime() === targetDate.getTime();
  });

  return customEntry ? customEntry.price : packageBase.price;
}
