/**
 * Pricing Service Unit Tests
 *
 * Tests all business rules including:
 * - Special cake pricing (free+regular=0, free+special=specialPrice, paid=price)
 * - LED surcharge
 * - Coupon calculations (fixed, percentage)
 * - Extra people surcharge
 * - Edge cases: zero quantities, missing components, boundary values
 */

import { describe, test, expect, jest } from '@jest/globals';

// Mock config before importing pricing service
jest.mock('../../src/config/env', () => ({
  config: {
    booking: {
      ledFreeCharacters: 8,
      ledExtraChargePerChar: 30,
      minAdvancePaymentRupees: 999,
    },
  },
}));

import {
  calculateBookingPrice,
  getCakeEffectivePricePaise,
  calcCakesPricePaise,
  calcLedSurchargePaise,
  validateCouponExpiry,
  getPackagePriceForDate,
} from '../../src/modules/pricing/pricing.service';

import type { BookingCake, PricingInput } from '../../src/modules/pricing/pricing.types';
import { toPaise } from '../../src/shared/utils/currency';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeCake(overrides: Partial<BookingCake> = {}): BookingCake {
  return {
    _id: 'cake1',
    name: 'Test Cake',
    price: 500,
    specialPrice: 200,
    special: false,
    free: false,
    ...overrides,
  };
}

function baseInput(overrides: Partial<PricingInput> = {}): PricingInput {
  return {
    screen: { minPeople: 2, extraPersonPrice: 200 },
    packagePriceRupees: 1500,
    occasionPriceRupees: 300,
    addons: [],
    gifts: [],
    cakes: [],
    numberOfPeople: 2,
    ledName: '',
    coupon: null,
    ...overrides,
  };
}

// ─── Special Cake Pricing ────────────────────────────────────────────────────

describe('getCakeEffectivePricePaise — special cake pricing rules', () => {
  test('free: true, special: false → 0 (free package slot, regular cake)', () => {
    const cake = makeCake({ free: true, special: false, price: 500, specialPrice: 200 });
    expect(getCakeEffectivePricePaise(cake)).toBe(0);
  });

  test('free: true, special: true → specialPrice in paise (free slot but special cake)', () => {
    const cake = makeCake({ free: true, special: true, price: 500, specialPrice: 200 });
    expect(getCakeEffectivePricePaise(cake)).toBe(toPaise(200)); // 20000 paise
  });

  test('free: false, special: false → price in paise (paid regular cake)', () => {
    const cake = makeCake({ free: false, special: false, price: 500, specialPrice: 200 });
    expect(getCakeEffectivePricePaise(cake)).toBe(toPaise(500)); // 50000 paise
  });

  test('free: false, special: true → price in paise (paid special cake uses regular price)', () => {
    const cake = makeCake({ free: false, special: true, price: 500, specialPrice: 200 });
    expect(getCakeEffectivePricePaise(cake)).toBe(toPaise(500)); // 50000 paise
  });

  test('specialPrice = 0 for special cake on free slot → 0 paise', () => {
    const cake = makeCake({ free: true, special: true, price: 500, specialPrice: 0 });
    expect(getCakeEffectivePricePaise(cake)).toBe(0);
  });
});

describe('calcCakesPricePaise — does not mutate input array', () => {
  test('should not mutate the input cakes array (regression for splice bug)', () => {
    const cakes: BookingCake[] = [
      makeCake({ free: true, special: false }),
      makeCake({ free: false, special: false, price: 500 }),
    ];
    const original = [...cakes];
    calcCakesPricePaise(cakes);
    expect(cakes).toEqual(original); // array must remain unchanged
  });

  test('sums effective prices correctly for mixed cake list', () => {
    const cakes: BookingCake[] = [
      makeCake({ free: true, special: false }),          // 0
      makeCake({ free: true, special: true, specialPrice: 200 }),  // 20000
      makeCake({ free: false, special: false, price: 500 }),       // 50000
    ];
    expect(calcCakesPricePaise(cakes)).toBe(toPaise(200) + toPaise(500));
  });

  test('empty cakes → 0', () => {
    expect(calcCakesPricePaise([])).toBe(0);
  });
});

// ─── LED Surcharge ──────────────────────────────────────────────────────────

describe('calcLedSurchargePaise', () => {
  test('no LED addon → 0 regardless of name length', () => {
    expect(calcLedSurchargePaise('VERYLONGNAME123', false)).toBe(0);
  });

  test('LED addon, name length ≤ 8 → 0', () => {
    expect(calcLedSurchargePaise('ABCDEFGH', true)).toBe(0); // exactly 8
    expect(calcLedSurchargePaise('ABC', true)).toBe(0);      // < 8
    expect(calcLedSurchargePaise('', true)).toBe(0);         // empty
  });

  test('LED addon, 9 chars → ₹30 (1 extra char)', () => {
    expect(calcLedSurchargePaise('123456789', true)).toBe(toPaise(30));
  });

  test('LED addon, 10 chars → ₹60 (2 extra chars)', () => {
    expect(calcLedSurchargePaise('1234567890', true)).toBe(toPaise(60));
  });

  test('LED addon, 18 chars → ₹300 (10 extra chars)', () => {
    expect(calcLedSurchargePaise('123456789012345678', true)).toBe(toPaise(300));
  });
});

// ─── Coupon Expiry ───────────────────────────────────────────────────────────

describe('validateCouponExpiry', () => {
  test('coupon valid when booking date is before expiry', () => {
    const expiry = new Date('2026-12-31');
    const booking = new Date('2026-06-15');
    expect(validateCouponExpiry(expiry, booking)).toBe(true);
  });

  test('coupon valid on the SAME day as expiry (same-day booking)', () => {
    const expiry = new Date('2026-08-21');
    const booking = new Date('2026-08-21');
    expect(validateCouponExpiry(expiry, booking)).toBe(true);
  });

  test('coupon expired when booking date is after expiry', () => {
    const expiry = new Date('2026-07-01');
    const booking = new Date('2026-08-21');
    expect(validateCouponExpiry(expiry, booking)).toBe(false);
  });
});

// ─── Full Integration Scenarios ──────────────────────────────────────────────

describe('calculateBookingPrice — full scenarios', () => {
  test('base booking with no extras', () => {
    const result = calculateBookingPrice(baseInput());
    expect(result.packagePricePaise).toBe(toPaise(1500));
    expect(result.occasionPricePaise).toBe(toPaise(300));
    expect(result.addonsPricePaise).toBe(0);
    expect(result.cakesPricePaise).toBe(0);
    expect(result.couponDiscountPaise).toBe(0);
    expect(result.totalPriceRupees).toBe(1800);
  });

  test('extra people surcharge', () => {
    const result = calculateBookingPrice(
      baseInput({ numberOfPeople: 5 }), // 3 extra × ₹200 = ₹600
    );
    expect(result.extraPeoplePricePaise).toBe(toPaise(600));
    expect(result.totalPriceRupees).toBe(1800 + 600);
  });

  test('no extra people when at min capacity', () => {
    const result = calculateBookingPrice(baseInput({ numberOfPeople: 2 }));
    expect(result.extraPeoplePricePaise).toBe(0);
  });

  test('addons with LED name surcharge', () => {
    const result = calculateBookingPrice(
      baseInput({
        addons: [{ _id: 'a1', name: 'LED Name', price: 400, count: 1 }],
        ledName: '1234567890', // 10 chars → 2 extra → ₹60 surcharge
      }),
    );
    expect(result.addonsPricePaise).toBe(toPaise(400));
    expect(result.ledSurchargePaise).toBe(toPaise(60));
    expect(result.totalPriceRupees).toBe(1800 + 400 + 60);
  });

  test('fixed coupon discount', () => {
    const result = calculateBookingPrice(
      baseInput({ coupon: { type: 'fixed', discount: 200 } }), // ₹200 off
    );
    expect(result.couponDiscountPaise).toBe(-toPaise(200));
    expect(result.totalPriceRupees).toBe(1800 - 200);
  });

  test('percentage coupon discount (floors to nearest paise)', () => {
    const result = calculateBookingPrice(
      baseInput({ coupon: { type: 'percentage', discount: 10 } }), // 10% of ₹1800 = ₹180
    );
    expect(result.couponDiscountPaise).toBe(-toPaise(180));
    expect(result.totalPriceRupees).toBe(1620);
  });

  test('special cake on free slot charges specialPrice', () => {
    const result = calculateBookingPrice(
      baseInput({
        cakes: [makeCake({ free: true, special: true, price: 500, specialPrice: 200 })],
      }),
    );
    expect(result.cakesPricePaise).toBe(toPaise(200));
    expect(result.totalPriceRupees).toBe(1800 + 200);
  });

  test('regular cake on free slot is free', () => {
    const result = calculateBookingPrice(
      baseInput({
        cakes: [makeCake({ free: true, special: false, price: 500 })],
      }),
    );
    expect(result.cakesPricePaise).toBe(0);
    expect(result.totalPriceRupees).toBe(1800);
  });

  test('total is never negative (coupon > total)', () => {
    const result = calculateBookingPrice(
      baseInput({ coupon: { type: 'fixed', discount: 99999 } }),
    );
    expect(result.totalPricePaise).toBeGreaterThanOrEqual(0);
    expect(result.totalPriceRupees).toBeGreaterThanOrEqual(0);
  });

  test('advance is capped at booking total when total < min advance', () => {
    const result = calculateBookingPrice(
      baseInput({
        packagePriceRupees: 500, // total = 500+300 = 800 < 999
        occasionPriceRupees: 300,
      }),
    );
    expect(result.advancePriceRupees).toBe(800); // capped at total
    expect(result.remainingAmountRupees).toBe(0);
  });

  test('advance is exactly 999 when total >= 999', () => {
    const result = calculateBookingPrice(baseInput()); // total = 1800
    expect(result.advancePriceRupees).toBe(999);
    expect(result.remainingAmountRupees).toBe(1800 - 999);
  });

  test('multiple cakes — mixed free/paid/special', () => {
    const result = calculateBookingPrice(
      baseInput({
        cakes: [
          makeCake({ free: true, special: false, price: 500 }),         // 0
          makeCake({ free: true, special: true, price: 500, specialPrice: 200 }), // 200
          makeCake({ free: false, special: false, price: 400 }),         // 400
          makeCake({ free: false, special: true, price: 600, specialPrice: 300 }), // 600 (non-free uses price)
        ],
      }),
    );
    expect(result.cakesPricePaise).toBe(toPaise(200 + 400 + 600));
    expect(result.totalPriceRupees).toBe(1800 + 200 + 400 + 600);
  });

  test('zero people does not cause negative extra people charge', () => {
    const result = calculateBookingPrice(baseInput({ numberOfPeople: 0 }));
    expect(result.extraPeoplePricePaise).toBe(0);
  });
});

// ─── Package Custom Price ────────────────────────────────────────────────────

describe('getPackagePriceForDate', () => {
  const pkg = {
    price: 1500,
    customPrice: [
      { date: new Date('2026-12-25'), price: 2500 },
      { date: new Date('2026-12-31'), price: 3000 },
    ],
  };

  test('returns base price when no custom price for date', () => {
    expect(getPackagePriceForDate(pkg, new Date('2026-06-15'))).toBe(1500);
  });

  test('returns custom price when exact date match', () => {
    expect(getPackagePriceForDate(pkg, new Date('2026-12-25'))).toBe(2500);
  });

  test('returns custom price for another custom date', () => {
    expect(getPackagePriceForDate(pkg, new Date('2026-12-31'))).toBe(3000);
  });

  test('returns base price for non-custom date', () => {
    expect(getPackagePriceForDate(pkg, new Date('2026-12-26'))).toBe(1500);
  });
});
