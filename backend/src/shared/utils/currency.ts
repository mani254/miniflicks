/**
 * Currency utilities — all monetary calculations use integer paise
 * to avoid floating-point precision errors.
 *
 * Rule: never store or compute amounts as fractional rupees internally.
 * Convert to rupees only for display and Razorpay API calls.
 *
 * 1 rupee = 100 paise
 */

/** Convert rupees (may be decimal) to integer paise */
export function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/** Convert paise to rupees (2 decimal places) */
export function fromPaise(paise: number): number {
  return Math.round(paise) / 100;
}

/** Add two paise amounts */
export function addPaise(a: number, b: number): number {
  return Math.round(a) + Math.round(b);
}

/** Subtract two paise amounts */
export function subtractPaise(a: number, b: number): number {
  return Math.round(a) - Math.round(b);
}

/** Multiply paise amount by a count (e.g. addon price × quantity) */
export function multiplyPaise(paise: number, count: number): number {
  return Math.round(paise) * Math.round(count);
}

/** Apply a percentage discount to a paise amount — always floors to nearest paise */
export function applyPercentageDiscountPaise(amountPaise: number, discountPercent: number): number {
  return Math.floor((discountPercent / 100) * Math.round(amountPaise));
}

/** Format paise as an INR currency string for logging / display */
export function formatInr(paise: number): string {
  return `₹${fromPaise(paise).toFixed(2)}`;
}
