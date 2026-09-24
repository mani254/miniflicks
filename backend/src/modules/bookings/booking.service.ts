/**
 * Booking Service
 *
 * All booking business logic lives here. Controllers are thin and delegate to this service.
 *
 * Architecture decisions:
 * - BookingClass (utils/bookinClass.js) is replaced by pure async functions
 * - Slot race condition (C4) mitigated via unique compound index + optimistic locking
 * - setTimeout cancellation (C5) replaced by a cron job
 * - Special cake pricing via pricingService.getCakeEffectivePricePaise()
 * - All prices recalculated server-side — never trusted from frontend
 */

import type { Types } from 'mongoose';
import mongoose from 'mongoose';
import { config } from '../../config/env';
import { getRazorpay } from '../../config/razorpay';
import {
  acquireSlotLock,
  getRedisClient,
  invalidateSlotCache,
  RedisKeys,
  releaseSlotLock,
} from '../../config/redis';
import { BookingStatus, isValidTransition } from '../../shared/constants/orderStatus';
import {
  BusinessRuleError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../shared/errors/AppError';
import {
  calculateBookingPrice,
  getPackagePriceForDate,
  validateCouponExpiry,
} from '../pricing/pricing.service';
import type { BookingAddon, BookingCake, BookingGift, PricingInput } from '../pricing/pricing.types';
import type { IAddonSnapshot, IBooking, ICakeSnapshot, IGiftSnapshot } from './booking.schema';
import { Booking } from './booking.schema';
import type { CreateBookingDto, GetBookingsQuery, UpdateBookingDto } from './booking.validators';

import { buildBookingConfirmationHtml, sendMail } from '../../infrastructure/mail/mailer';
import { Addon } from '../addons/addon.schema';
import { Cake } from '../cakes/cake.schema';
import { City } from '../cities/city.schema';
import { Coupon } from '../coupons/coupon.schema';
import { Customer } from '../customers/customer.schema';
import { Gift } from '../gifts/gift.schema';
import { Location } from '../locations/location.schema';
import { Occasion } from '../occasions/occasion.schema';
import { Screen } from '../screens/screen.schema';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BookingListResult {
  bookings: IBooking[];
  totalDocuments: number;
}

export interface CustomerBookingResult {
  booking: IBooking;
  razorpayOrderId: string;
}

// ─── Slot Validation ──────────────────────────────────────────────────────────

/**
 * Validates that the requested slot does not conflict with any existing booking.
 * Uses day range to avoid timezone boundary issues, and supports slots that wrap around midnight.
 */
async function validateSlot(
  date: Date,
  screenId: string,
  slot: { from: string; to: string },
  excludeBookingId?: string,
): Promise<void> {
  const bookingDate = new Date(date);
  const startOfDay = new Date(bookingDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(bookingDate);
  endOfDay.setHours(23, 59, 59, 999);

  const existingBookings = await Booking.find({
    date: { $gte: startOfDay, $lte: endOfDay },
    screen: screenId,
    status: { $in: [BookingStatus.PENDING, BookingStatus.BOOKED] },
    ...(excludeBookingId ? { _id: { $ne: excludeBookingId } } : {}),
  }).select('slot');

  const requestedFrom = toMinutes(slot.from);
  let requestedTo = toMinutes(slot.to);
  if (requestedTo <= requestedFrom) requestedTo += 24 * 60; // Handle midnight wrap

  for (const booking of existingBookings) {
    const existingFrom = toMinutes(booking.slot.from);
    let existingTo = toMinutes(booking.slot.to);
    if (existingTo <= existingFrom) existingTo += 24 * 60; // Handle midnight wrap

    if (
      (requestedFrom >= existingFrom && requestedFrom < existingTo) ||
      (requestedTo > existingFrom && requestedTo <= existingTo) ||
      (requestedFrom <= existingFrom && requestedTo >= existingTo)
    ) {
      throw new ConflictError('The requested time slot is already booked for this screen and date');
    }
  }
}

function toMinutes(time: string): number {
  const parts = time.split(':');
  const hours = parseInt(parts[0] ?? '0', 10);
  const minutes = parseInt(parts[1] ?? '0', 10);
  return hours * 60 + minutes;
}

// ─── Data Fetching ────────────────────────────────────────────────────────────

async function fetchAndValidateCity(cityId: string) {
  const city = await City.findById(cityId);
  if (!city) throw new NotFoundError('City');
  return city;
}

async function fetchAndValidateLocation(locationId: string) {
  const location = await Location.findById(locationId).populate('screens');
  if (!location) throw new NotFoundError('Location');
  return location;
}

async function fetchAndValidateScreen(screenId: string) {
  const screen = await Screen.findById(screenId);
  if (!screen) throw new NotFoundError('Screen');
  if (!screen.status) throw new BusinessRuleError('This screen is not currently available');
  return screen;
}

async function fetchAndValidatePackage(
  screen: any,
  packageName: string | undefined,
  bookingDate: Date,
) {
  const packagesList = screen.packages || [];
  const pkgDoc =
    packagesList.find(
      (p: any) =>
        p.name &&
        packageName &&
        p.name.toLowerCase().trim() === packageName.toLowerCase().trim(),
    ) ||
    packagesList.find((p: any) => p.name === packageName) ||
    packagesList[0];

  if (!pkgDoc) {
    throw new ValidationError(`Package "${packageName || 'Default'}" is not available for this screen`);
  }

  const pkgObj = typeof pkgDoc.toObject === 'function' ? pkgDoc.toObject() : pkgDoc;
  const priceForDate = getPackagePriceForDate(pkgObj, bookingDate);

  return {
    name: (pkgObj.name as string) || 'Standard Package',
    price: typeof priceForDate === 'number' ? priceForDate : (pkgObj.price as number) || 0,
    customPrice: pkgObj.customPrice || [],
    addons: Array.isArray(pkgObj.addons) ? (pkgObj.addons as string[]) : [],
  };
}

async function fetchAndValidateOccasion(occasionId: string) {
  const occasion = await Occasion.findById(occasionId).select('_id name price');
  if (!occasion) throw new NotFoundError('Occasion');
  return occasion;
}

async function fetchAddons(
  addonRequests: Array<{ _id: string; count: number }>,
): Promise<IAddonSnapshot[]> {
  if (!addonRequests.length) return [];
  const ids = addonRequests.map((r) => r._id);
  const addons = await Addon.find({ _id: { $in: ids } }).select('_id name price');
  const addonMap = new Map(addons.map((a) => [a._id.toString(), a]));

  const results: IAddonSnapshot[] = [];
  for (const req of addonRequests) {
    const addon = addonMap.get(req._id);
    if (!addon) throw new NotFoundError(`Addon ${req._id}`);
    results.push({
      _id: addon._id as Types.ObjectId,
      name: addon.name as string,
      price: addon.price as number,
      count: req.count,
    });
  }

  return results;
}

async function fetchGifts(
  giftRequests: Array<{ _id: string; count: number }>,
): Promise<IGiftSnapshot[]> {
  if (!giftRequests.length) return [];
  const ids = giftRequests.map((r) => r._id);
  const gifts = await Gift.find({ _id: { $in: ids } }).select('_id name price');
  const giftMap = new Map(gifts.map((g) => [g._id.toString(), g]));

  const results: IGiftSnapshot[] = [];
  for (const req of giftRequests) {
    const gift = giftMap.get(req._id);
    if (!gift) throw new NotFoundError(`Gift ${req._id}`);
    results.push({
      _id: gift._id as Types.ObjectId,
      name: gift.name as string,
      price: gift.price as number,
      count: req.count,
    });
  }

  return results;
}

async function fetchCakes(
  cakeRequests: Array<{ _id: string; free?: boolean }>,
  packageIncludesCake: boolean,
): Promise<{ snapshots: ICakeSnapshot[]; pricingCakes: BookingCake[] }> {
  if (!cakeRequests.length) return { snapshots: [], pricingCakes: [] };
  const ids = cakeRequests.map((r) => r._id);
  const cakes = await Cake.find({ _id: { $in: ids } }).select('_id name price specialPrice special');
  const cakeMap = new Map(cakes.map((c) => [c._id.toString(), c]));

  const snapshots: ICakeSnapshot[] = [];
  const pricingCakes: BookingCake[] = [];
  let freeSlotUsed = false;

  for (const req of cakeRequests) {
    const cake = cakeMap.get(req._id);
    if (!cake) throw new NotFoundError(`Cake ${req._id}`);

    // Determine if this cake slot gets the package-included free slot
    const useFreeSlot = packageIncludesCake && !freeSlotUsed && req.free === true;
    if (useFreeSlot) freeSlotUsed = true;

    const cakePrice = cake.price as number;
    const cakeSpecialPrice = (cake.specialPrice as number | undefined) ?? 0;
    const cakeIsSpecial = (cake.special as boolean | undefined) ?? false;

    const pricingCake: BookingCake = {
      _id: (cake._id as Types.ObjectId).toString(),
      name: cake.name as string,
      price: cakePrice,
      specialPrice: cakeSpecialPrice,
      special: cakeIsSpecial,
      free: useFreeSlot,
    };
    pricingCakes.push(pricingCake);

    // The stored snapshot preserves the pricing breakdown for invoice rendering
    snapshots.push({
      _id: cake._id as Types.ObjectId,
      name: cake.name as string,
      price: cakePrice,
      free: useFreeSlot,
      special: cakeIsSpecial,
      specialPrice: cakeSpecialPrice,
    });
  }

  return { snapshots, pricingCakes };
}

async function fetchOrCreateCustomer(customerData: { name: string; number: string; email: string }) {
  const existing = await Customer.findOne({ number: customerData.number });

  if (existing) {
    existing.name = customerData.name;
    existing.email = customerData.email;
    return await existing.save();
  }

  return await Customer.create(customerData);
}

async function fetchCoupon(couponCode: string | null | undefined, bookingDate: Date) {
  if (!couponCode || !couponCode.trim()) return null;

  const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase() });

  if (!coupon) throw new BusinessRuleError('Invalid coupon code');
  if (!coupon.status) throw new BusinessRuleError('This coupon is not active');

  const isValid = validateCouponExpiry(new Date(coupon.expireDate as Date), bookingDate);
  if (!isValid) throw new BusinessRuleError('This coupon has expired');

  return {
    type: coupon.type as 'fixed' | 'percentage',
    discount: coupon.discount as number,
    code: coupon.code as string,
  };
}

// ─── Core Booking Builder ────────────────────────────────────────────────────

interface BuiltBookingData {
  cityId: string;
  locationId: string;
  screenId: string;
  bookingDate: Date;
  slot: { from: string; to: string };
  packageSnapshot: { name: string; price: number; addons: string[] };
  occasionSnapshot: { _id: Types.ObjectId; name: string; price: number; celebrantName?: string };
  addonSnapshots: IAddonSnapshot[];
  giftSnapshots: IGiftSnapshot[];
  cakeSnapshots: ICakeSnapshot[];
  customerId: Types.ObjectId;
  numberOfPeople: number;
  nameOnCake: string;
  ledName: string;
  ledNumber: string;
  note: string;
  couponCode: string | null;
  couponPrice: number;
  advancePrice: number;
  totalPrice: number;
  remainingAmount: number;
  screen: { minPeople: number; extraPersonPrice: number };
}

async function buildBookingData(dto: CreateBookingDto, isAdmin = false): Promise<BuiltBookingData> {
  // Fetch screen first to allow auto-resolving location and city if not explicitly provided
  const screen = await fetchAndValidateScreen(dto.screen);

  const resolvedLocationId =
    dto.location || (screen.location as any)?._id?.toString() || screen.location?.toString();
  const location = await fetchAndValidateLocation(resolvedLocationId);

  const resolvedCityId =
    dto.city || (location.city as any)?._id?.toString() || location.city?.toString();
  await fetchAndValidateCity(resolvedCityId);

  const pkg = await fetchAndValidatePackage(screen, dto.package?.name, dto.date);
  const occasion = await fetchAndValidateOccasion(dto.occasion?._id);

  // Slot validation
  await validateSlot(dto.date, dto.screen, dto.slot);

  const addons = await fetchAddons(dto.addons || []);
  const gifts = await fetchGifts(dto.gifts || []);

  // Check if package includes a free cake
  const packageIncludesCake = Array.isArray(pkg.addons)
    ? pkg.addons.some((a: string) => typeof a === 'string' && a.toLowerCase().includes('cake'))
    : false;
  const { snapshots: cakeSnapshots, pricingCakes } = await fetchCakes(dto.cakes || [], packageIncludesCake);

  // Validate cake selection if package requires it (for customer bookings; admin has flexibility)
  if (packageIncludesCake && (!dto.cakes || dto.cakes.length === 0) && !isAdmin) {
    throw new ValidationError('Please select at least one cake (included in your package)');
  }

  const customer = await fetchOrCreateCustomer(dto.customer || { name: 'Customer', number: '0000000000', email: '' });
  const otherInfo = dto.otherInfo || ({} as any);
  const coupon = await fetchCoupon(otherInfo.couponCode, dto.date);

  // Build pricing addons (with name for LED detection)
  const pricingAddons: BookingAddon[] = addons.map((a) => ({
    _id: a._id.toString(),
    name: a.name,
    price: a.price,
    count: a.count,
  }));

  const pricingGifts: BookingGift[] = gifts.map((g) => ({
    _id: g._id.toString(),
    name: g.name,
    price: g.price,
    count: g.count,
  }));

  const pricingInput: PricingInput = {
    screen: { minPeople: screen.minPeople as number, extraPersonPrice: screen.extraPersonPrice as number },
    packagePriceRupees: pkg.price,
    occasionPriceRupees: occasion.price as number,
    addons: pricingAddons,
    gifts: pricingGifts,
    cakes: pricingCakes,
    numberOfPeople: otherInfo.numberOfPeople ?? screen.minPeople ?? 2,
    ledName: otherInfo.ledName ?? '',
    coupon,
  };

  const pricing = calculateBookingPrice(pricingInput);

  const bookingDate = new Date(dto.date);
  bookingDate.setHours(0, 0, 0, 0);

  return {
    cityId: resolvedCityId,
    locationId: resolvedLocationId,
    screenId: dto.screen,
    bookingDate,
    slot: dto.slot,
    packageSnapshot: {
      name: pkg.name as string,
      price: pkg.price,
      addons: Array.isArray(pkg.addons) ? (pkg.addons as string[]) : [],
    },
    occasionSnapshot: {
      _id: occasion._id as Types.ObjectId,
      name: occasion.name as string,
      price: occasion.price as number,
      celebrantName: dto.occasion?.celebrantName || '',
    },
    addonSnapshots: addons,
    giftSnapshots: gifts,
    cakeSnapshots,
    customerId: customer._id as Types.ObjectId,
    numberOfPeople: otherInfo.numberOfPeople ?? screen.minPeople ?? 2,
    nameOnCake: otherInfo.nameOnCake ?? '',
    ledName: otherInfo.ledName ?? '',
    ledNumber: otherInfo.ledNumber ?? '',
    note: dto.note ?? '',
    couponCode: coupon ? coupon.code : null,
    couponPrice: Math.abs(pricing.couponDiscountPaise) / 100, // store in rupees (positive magnitude)
    advancePrice: pricing.advancePriceRupees,
    totalPrice: pricing.totalPriceRupees,
    remainingAmount: pricing.remainingAmountRupees,
    screen: { minPeople: screen.minPeople as number, extraPersonPrice: screen.extraPersonPrice as number },
  };
}

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Admin booking — creates a confirmed booking directly (no Razorpay payment).
 */
export async function createAdminBookingService(dto: CreateBookingDto): Promise<IBooking> {
  const data = await buildBookingData(dto, true);

  const booking = await Booking.create({
    city: data.cityId,
    location: data.locationId,
    screen: data.screenId,
    date: data.bookingDate,
    slot: data.slot,
    package: data.packageSnapshot,
    occasion: data.occasionSnapshot,
    addons: data.addonSnapshots,
    gifts: data.giftSnapshots,
    cakes: data.cakeSnapshots,
    customer: data.customerId,
    numberOfPeople: data.numberOfPeople,
    nameOnCake: data.nameOnCake,
    ledName: data.ledName,
    ledNumber: data.ledNumber,
    note: data.note,
    status: BookingStatus.BOOKED,
    couponCode: data.couponCode,
    couponPrice: data.couponPrice,
    advancePrice: dto.advance > 0 ? dto.advance : data.advancePrice,
    totalPrice: data.totalPrice,
    remainingAmount: data.remainingAmount,
  });

  // Invalidate slot cache immediately
  const dateKey = data.bookingDate.toISOString().split('T')[0] ?? '';
  await invalidateSlotCache(data.screenId, dateKey);

  // Send confirmation email asynchronously (non-blocking)
  sendBookingConfirmationEmail(booking._id as Types.ObjectId).catch(() => { });

  return booking;
}

/**
 * Admin update booking — modifies an existing booking record in place with full price recalculation.
 */
export async function updateBookingService(dto: UpdateBookingDto): Promise<IBooking> {
  const existing = await Booking.findById(dto.id);
  if (!existing) throw new NotFoundError('Booking');

  // Fetch screen first to allow auto-resolving location and city if not explicitly provided
  const screen = await fetchAndValidateScreen(dto.screen);

  const resolvedLocationId =
    dto.location || (screen.location as any)?._id?.toString() || screen.location?.toString() || existing.location?.toString();
  const location = await fetchAndValidateLocation(resolvedLocationId);

  const resolvedCityId =
    dto.city || (location.city as any)?._id?.toString() || location.city?.toString() || existing.city?.toString();
  await fetchAndValidateCity(resolvedCityId);

  const pkg = await fetchAndValidatePackage(screen, dto.package?.name, dto.date);
  const occasion = await fetchAndValidateOccasion(dto.occasion?._id);

  // Validate slot with self-exclusion
  await validateSlot(dto.date, dto.screen, dto.slot, dto.id);

  const addons = await fetchAddons(dto.addons || []);
  const gifts = await fetchGifts(dto.gifts || []);

  const packageIncludesCake = Array.isArray(pkg.addons)
    ? pkg.addons.some((a: string) => typeof a === 'string' && a.toLowerCase().includes('cake'))
    : false;
  const { snapshots: cakeSnapshots, pricingCakes } = await fetchCakes(dto.cakes || [], packageIncludesCake);

  const otherInfo = dto.otherInfo || ({} as any);
  const coupon = await fetchCoupon(otherInfo.couponCode, dto.date);

  const pricingAddons: BookingAddon[] = addons.map((a) => ({
    _id: a._id.toString(),
    name: a.name,
    price: a.price,
    count: a.count,
  }));

  const pricingGifts: BookingGift[] = gifts.map((g) => ({
    _id: g._id.toString(),
    name: g.name,
    price: g.price,
    count: g.count,
  }));

  const pricingInput: PricingInput = {
    screen: { minPeople: screen.minPeople as number, extraPersonPrice: screen.extraPersonPrice as number },
    packagePriceRupees: pkg.price,
    occasionPriceRupees: occasion.price as number,
    addons: pricingAddons,
    gifts: pricingGifts,
    cakes: pricingCakes,
    numberOfPeople: otherInfo.numberOfPeople ?? screen.minPeople ?? 2,
    ledName: otherInfo.ledName ?? '',
    coupon,
  };

  const pricing = calculateBookingPrice(pricingInput);

  const bookingDate = new Date(dto.date);
  bookingDate.setHours(0, 0, 0, 0);

  const oldScreenId = existing.screen.toString();
  const oldDateKey = new Date(existing.date).toISOString().split('T')[0] ?? '';

  // Update existing document fields
  existing.city = new mongoose.Types.ObjectId(resolvedCityId);
  existing.location = new mongoose.Types.ObjectId(resolvedLocationId);
  existing.screen = new mongoose.Types.ObjectId(dto.screen);
  existing.date = bookingDate;
  existing.slot = dto.slot;
  existing.package = {
    name: pkg.name as string,
    price: pkg.price,
    addons: Array.isArray(pkg.addons) ? (pkg.addons as string[]) : [],
  };
  existing.occasion = {
    _id: occasion._id as Types.ObjectId,
    name: occasion.name as string,
    price: occasion.price as number,
    celebrantName: dto.occasion?.celebrantName || '',
  };
  existing.addons = addons;
  existing.gifts = gifts;
  existing.cakes = cakeSnapshots;
  existing.numberOfPeople = otherInfo.numberOfPeople ?? screen.minPeople ?? 2;
  existing.nameOnCake = otherInfo.nameOnCake ?? '';
  existing.ledName = otherInfo.ledName ?? '';
  existing.ledNumber = otherInfo.ledNumber ?? '';
  existing.note = dto.note ?? '';
  existing.couponCode = coupon ? coupon.code : null;
  existing.couponPrice = Math.abs(pricing.couponDiscountPaise) / 100;
  existing.totalPrice = pricing.totalPriceRupees;

  if (dto.fullPayment) {
    existing.advancePrice = pricing.totalPriceRupees;
    existing.remainingAmount = 0;
  } else {
    existing.advancePrice = dto.advance > 0 ? dto.advance : existing.advancePrice;
    existing.remainingAmount = Math.max(0, pricing.totalPriceRupees - existing.advancePrice);
  }

  await existing.save();

  // Invalidate slot cache for both old and new date/screen
  const newDateKey = bookingDate.toISOString().split('T')[0] ?? '';
  await invalidateSlotCache(oldScreenId, oldDateKey);
  await invalidateSlotCache(dto.screen, newDateKey);

  return existing;
}

/**
 * Customer booking — acquires a Redis distributed slot lock, creates a PENDING booking,
 * and returns a Razorpay order. The booking becomes BOOKED only after payment verification.
 */
export async function createCustomerBookingService(
  dto: CreateBookingDto,
): Promise<CustomerBookingResult> {
  const data = await buildBookingData(dto);

  if (data.totalPrice <= 0) {
    throw new BusinessRuleError('Total price for the booking is invalid');
  }

  const dateKey = data.bookingDate.toISOString().split('T')[0] ?? '';
  const slotKey = `${data.slot.from}-${data.slot.to}`;

  // Acquire Redis distributed slot lock (10 minutes)
  const lockAcquired = await acquireSlotLock(
    data.screenId,
    dateKey,
    slotKey,
    'pending',
    config.redis.ttl.pendingBookingSession,
  );

  if (!lockAcquired) {
    throw new ConflictError(
      'This slot is currently being booked by another customer. Please choose another slot or try again in a few minutes.',
    );
  }

  let booking: IBooking;
  try {
    booking = await Booking.create({
      city: data.cityId,
      location: data.locationId,
      screen: data.screenId,
      date: data.bookingDate,
      slot: data.slot,
      package: data.packageSnapshot,
      occasion: data.occasionSnapshot,
      addons: data.addonSnapshots,
      gifts: data.giftSnapshots,
      cakes: data.cakeSnapshots,
      customer: data.customerId,
      numberOfPeople: data.numberOfPeople,
      nameOnCake: data.nameOnCake,
      ledName: data.ledName,
      ledNumber: data.ledNumber,
      note: data.note,
      status: BookingStatus.PENDING,
      couponCode: data.couponCode,
      couponPrice: data.couponPrice,
      advancePrice: data.advancePrice,
      totalPrice: data.totalPrice,
      remainingAmount: data.remainingAmount,
    });
  } catch (dbErr) {
    await releaseSlotLock(data.screenId, dateKey, slotKey);
    throw dbErr;
  }

  // Create Razorpay order
  const razorpay = getRazorpay();
  let razorpayOrder;
  try {
    razorpayOrder = await razorpay.orders.create({
      amount: data.totalPrice * 100, // paise
      currency: 'INR',
      receipt: `rcpt_${booking._id.toString().slice(-8)}`,
      partial_payment: true,
      first_payment_min_amount: config.booking.minAdvancePaymentRupees * 100,
      notes: {
        booking_id: booking._id.toString(),
        customer_id: data.customerId.toString(),
      },
    });
  } catch (rzpErr) {
    await Booking.updateOne(
      { _id: booking._id },
      { status: BookingStatus.CANCELED, cancellationReason: 'Razorpay order creation failed' },
    );
    await releaseSlotLock(data.screenId, dateKey, slotKey);
    throw new BusinessRuleError('Failed to create payment order. Please try again.');
  }

  if (!razorpayOrder.id) {
    await Booking.updateOne(
      { _id: booking._id },
      { status: BookingStatus.CANCELED, cancellationReason: 'Razorpay order creation failed' },
    );
    await releaseSlotLock(data.screenId, dateKey, slotKey);
    throw new BusinessRuleError('Failed to create payment order. Please try again.');
  }

  // Store Razorpay order ID and associate booking ID with slot lock
  await Booking.updateOne({ _id: booking._id }, { razorpayOrderId: razorpayOrder.id });
  await acquireSlotLock(data.screenId, dateKey, slotKey, booking._id.toString(), config.redis.ttl.pendingBookingSession);

  // Invalidate slot cache so other customers immediately see this slot as unavailable
  await invalidateSlotCache(data.screenId, dateKey);

  return {
    booking,
    razorpayOrderId: razorpayOrder.id as string,
  };
}

/**
 * Cancel expired pending bookings.
 * Called by a cron job every minute — cancels expired sessions and releases slot locks.
 */
export async function cancelExpiredPendingBookings(): Promise<number> {
  const cutoff = new Date(
    Date.now() - config.booking.pendingCancellationMinutes * 60 * 1000,
  );

  const expiredBookings = await Booking.find({
    status: BookingStatus.PENDING,
    createdAt: { $lt: cutoff },
  });

  if (!expiredBookings.length) return 0;

  const result = await Booking.updateMany(
    {
      _id: { $in: expiredBookings.map((b) => b._id) },
    },
    {
      $set: {
        status: BookingStatus.CANCELED,
        cancellationReason: 'Payment not completed within the allowed time',
      },
    },
  );

  // Release Redis locks and invalidate slot caches
  for (const b of expiredBookings) {
    const dateKey = new Date(b.date).toISOString().split('T')[0] ?? '';
    const slotKey = `${b.slot.from}-${b.slot.to}`;
    await releaseSlotLock(b.screen.toString(), dateKey, slotKey);
    await invalidateSlotCache(b.screen.toString(), dateKey);
  }

  if (result.modifiedCount > 0) {
    console.log(`[Booking] Auto-canceled ${result.modifiedCount} expired pending booking(s) and released locks`);
  }

  return result.modifiedCount;
}

/**
 * Confirm booking after successful Razorpay payment verification.
 */
export async function confirmBookingPaymentService(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  amountPaidRupees?: number,
): Promise<IBooking> {
  const booking = await Booking.findOne({ razorpayOrderId });
  if (!booking) throw new NotFoundError('Booking');

  // Handle late payment / recovery:
  // If booking was marked canceled by timeout but customer successfully paid on gateway:
  if (booking.status === BookingStatus.CANCELED) {
    console.warn(`[Payment] Late payment verification for canceled booking ${booking._id}. Checking if slot is still free...`);
    try {
      await validateSlot(booking.date, booking.screen.toString(), booking.slot, booking._id.toString());
      booking.status = BookingStatus.BOOKED;
      booking.cancellationReason = undefined;
      console.log(`[Payment] Slot was free; recovered booking ${booking._id} to BOOKED status.`);
    } catch (conflictErr) {
      console.error(`[Payment] CRITICAL: Payment captured for order ${razorpayOrderId} on booking ${booking._id}, but slot is already taken! Admin must process refund.`);
      throw new BusinessRuleError('Payment received after session expired and slot has been booked by another customer. Please contact support for an immediate refund.');
    }
  } else if (!isValidTransition(booking.status, BookingStatus.BOOKED)) {
    throw new BusinessRuleError(`Cannot confirm booking in ${booking.status} status`);
  }

  // Determine actual amount paid (in rupees) from Razorpay payment details
  let actualPaidRupees = amountPaidRupees && amountPaidRupees > 0 ? amountPaidRupees : 0;
  if (!actualPaidRupees && razorpayPaymentId) {
    try {
      const razorpay = getRazorpay();
      const payment: any = await razorpay.payments.fetch(razorpayPaymentId);
      if (payment && typeof payment.amount === 'number' && payment.amount > 0) {
        actualPaidRupees = Math.round(payment.amount / 100);
      }
    } catch (rzpErr) {
      console.warn(`[Payment] Could not fetch payment ${razorpayPaymentId} from Razorpay:`, rzpErr);
    }
  }

  // Fallback: if Razorpay API could not be reached, use booking's pre-calculated advance or minimum advance
  if (!actualPaidRupees) {
    actualPaidRupees = booking.advancePrice && booking.advancePrice > 0
      ? booking.advancePrice
      : (config.booking.minAdvancePaymentRupees || 999);
  }

  booking.status = BookingStatus.BOOKED;
  booking.razorpayPaymentId = razorpayPaymentId;
  booking.advancePrice = actualPaidRupees;
  booking.remainingAmount = Math.max(0, booking.totalPrice - actualPaidRupees);
  await booking.save();

  // Release Redis slot lock and invalidate slot cache
  const dateKey = new Date(booking.date).toISOString().split('T')[0] ?? '';
  const slotKey = `${booking.slot.from}-${booking.slot.to}`;
  await releaseSlotLock(booking.screen.toString(), dateKey, slotKey);
  await invalidateSlotCache(booking.screen.toString(), dateKey);

  // Invalidate Redis session if any
  try {
    const redis = getRedisClient();
    await redis.del(RedisKeys.bookingSession(booking._id.toString()));
  } catch { }

  // Send confirmation email asynchronously (non-blocking)
  sendBookingConfirmationEmail(booking._id as Types.ObjectId).catch(() => { });

  return booking;
}

/**
 * Sends a structured booking confirmation email to the customer with full details.
 */
async function sendBookingConfirmationEmail(bookingId: Types.ObjectId): Promise<void> {
  try {
    const booking = await Booking.findById(bookingId)
      .populate('customer', 'name email number')
      .populate('screen', 'name minPeople extraPersonPrice')
      .populate('location', 'name address');

    if (!booking) return;

    const customerDoc = booking.customer as any;
    const customerEmail = customerDoc?.email;
    const customerPhone = customerDoc?.number || '';
    const adminNotificationEmail = 'msmanikanta25@gmail.com';

    const recipients: string[] = [];
    if (customerEmail && typeof customerEmail === 'string' && customerEmail.includes('@')) {
      recipients.push(customerEmail.trim());
    }
    if (!recipients.includes(adminNotificationEmail)) {
      recipients.push(adminNotificationEmail);
    }

    if (recipients.length === 0) return;

    const customerName = customerDoc?.name || 'Valued Customer';
    const screenDoc = booking.screen as any;
    const screenName = screenDoc?.name || booking.package?.name || 'Private Theater';
    const locationDoc = booking.location as any;
    const locationName = locationDoc?.name || '';
    const locationAddress = locationDoc?.address || '';

    const minPeople = typeof screenDoc?.minPeople === 'number' ? screenDoc.minPeople : 2;
    const extraPersonPrice = typeof screenDoc?.extraPersonPrice === 'number' ? screenDoc.extraPersonPrice : 0;
    const numberOfPeople = booking.numberOfPeople || minPeople;
    const extraGuestsCount = Math.max(0, numberOfPeople - minPeople);
    const extraGuestsPrice = extraGuestsCount * extraPersonPrice;

    // LED extra characters surcharge
    const hasLedAddon = booking.addons?.some((a) => {
      const lower = a.name.toLowerCase();
      return lower.includes('name') && (lower.includes('led') || lower === 'led name');
    });
    let ledExtraChars = 0;
    let ledSurcharge = 0;
    if (hasLedAddon && booking.ledName && booking.ledName.trim().length > config.booking.ledFreeCharacters) {
      ledExtraChars = booking.ledName.trim().length - config.booking.ledFreeCharacters;
      ledSurcharge = ledExtraChars * config.booking.ledExtraChargePerChar;
    }

    const html = buildBookingConfirmationHtml({
      bookingId: booking._id.toString(),
      customerName,
      customerPhone,
      customerEmail: customerEmail || '',
      date: new Date(booking.date).toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      slot: booking.slot,
      screen: screenName,
      location: locationName,
      locationAddress,
      numberOfPeople,

      packageName: booking.package?.name || screenName,
      packagePrice: booking.package?.price || 0,
      minPeople,
      extraPersonPrice,
      extraGuestsCount,
      extraGuestsPrice,

      occasion: booking.occasion?.name,
      occasionPrice: booking.occasion?.price || 0,
      celebrantName: booking.occasion?.celebrantName,

      cakes: booking.cakes?.map((c) => ({
        name: c.name,
        price: c.price,
        free: c.free,
        special: c.special,
        specialPrice: c.specialPrice,
      })),
      nameOnCake: booking.nameOnCake,
      ledName: booking.ledName,
      ledNumber: booking.ledNumber,
      ledExtraChars,
      ledSurcharge,

      addons: booking.addons?.map((a) => ({
        name: a.name,
        price: a.price,
        count: a.count,
      })),
      gifts: booking.gifts?.map((g) => ({
        name: g.name,
        price: g.price,
        count: g.count,
      })),
      note: booking.note,

      couponCode: booking.couponCode,
      couponPrice: booking.couponPrice ? Math.abs(booking.couponPrice) : 0,
      totalPrice: booking.totalPrice,
      advancePrice: booking.advancePrice,
      remainingAmount: booking.remainingAmount,
      razorpayPaymentId: booking.razorpayPaymentId,
      createdAt: booking.createdAt,
    });

    await sendMail({
      to: recipients,
      subject: `Booking Confirmed & Tax Invoice #${booking._id.toString().slice(-6).toUpperCase()} - MiniFlicks (${screenName})`,
      html,
    });
  } catch (err) {
    console.error('[Mail] Error sending booking confirmation email:', err);
  }
}

/**
 * Cancel a booking by Razorpay order ID.
 * Used when customer explicitly cancels/closes modal before payment.
 * Immediately frees the slot in Redis and database.
 */
export async function cancelBookingByOrderIdService(
  orderId: string,
  reason: string,
): Promise<void> {
  const booking = await Booking.findOne({ razorpayOrderId: orderId });
  if (!booking) throw new NotFoundError('Booking');

  if (booking.status === BookingStatus.CANCELED) {
    return; // Already canceled, idempotent
  }

  if (!isValidTransition(booking.status, BookingStatus.CANCELED)) {
    throw new BusinessRuleError(`Cannot cancel booking in ${booking.status} status`);
  }

  await Booking.updateOne(
    { _id: booking._id },
    { status: BookingStatus.CANCELED, cancellationReason: reason },
  );

  // Immediately release Redis slot lock and invalidate cache so user can book again
  const dateKey = new Date(booking.date).toISOString().split('T')[0] ?? '';
  const slotKey = `${booking.slot.from}-${booking.slot.to}`;
  await releaseSlotLock(booking.screen.toString(), dateKey, slotKey);
  await invalidateSlotCache(booking.screen.toString(), dateKey);
}

/**
 * List bookings with pagination, filtering, and populated relations.
 * Used by admin dashboard.
 */
export async function getBookingsService(
  query: GetBookingsQuery,
  locationFilter?: Types.ObjectId | null,
): Promise<BookingListResult> {
  const { search, fromDate, toDate, limit, page } = query;
  const skip = (page - 1) * limit;

  // Build match conditions for the aggregation
  const matchConditions: Record<string, unknown> = {};

  if (query.status) {
    matchConditions['status'] = query.status;
  } else {
    matchConditions['status'] = { $in: [BookingStatus.PENDING, BookingStatus.BOOKED] };
  }

  if (locationFilter) {
    matchConditions['location'] = locationFilter;
  } else if (query.location) {
    matchConditions['location'] = new mongoose.Types.ObjectId(query.location);
  }

  if (search) {
    matchConditions['$or'] = [
      { 'customer.name': { $regex: search, $options: 'i' } },
      { 'customer.number': { $regex: search, $options: 'i' } },
    ];
  }

  if (fromDate || toDate) {
    const startDate = fromDate ? new Date(fromDate) : new Date('1970-01-01');
    const endDate = toDate ? new Date(toDate) : new Date();
    if (toDate) endDate.setHours(23, 59, 59, 999);
    matchConditions['date'] = { $gte: startDate, $lte: endDate };
  }

  // Single aggregation with $facet to get both count and results in one query (fixes M7)
  const [result] = await Booking.aggregate([
    {
      $lookup: {
        from: 'customers',
        localField: 'customer',
        foreignField: '_id',
        as: 'customer',
      },
    },
    { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
    { $match: matchConditions },
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        bookings: [
          {
            $lookup: {
              from: 'screens',
              localField: 'screen',
              foreignField: '_id',
              as: 'screen',
            },
          },
          { $unwind: { path: '$screen', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: 'locations',
              localField: 'location',
              foreignField: '_id',
              as: 'location',
            },
          },
          { $unwind: { path: '$location', preserveNullAndEmptyArrays: true } },
          { $sort: { date: -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $addFields: {
              location: { _id: '$location._id', name: '$location.name' },
              screen: { _id: '$screen._id', name: '$screen.name' },
            },
          },
        ],
      },
    },
  ]);

  const totalDocuments = (result?.metadata?.[0]?.total as number) ?? 0;
  const bookings = (result?.bookings as IBooking[]) ?? [];

  return { bookings, totalDocuments };
}

/**
 * Get a single booking by ID with full population.
 */
export async function getBookingByIdService(bookingId: string): Promise<IBooking> {
  const booking = await Booking.findById(bookingId)
    .populate('customer')
    .populate({ path: 'location', select: 'name _id addressLink' })
    .populate({ path: 'screen', select: 'name _id minPeople extraPersonPrice' });

  if (!booking) throw new NotFoundError('Booking');
  return booking;
}

/**
 * Get booked time slots for a screen on a date.
 * Uses Redis cache for performance (30s TTL).
 */
export async function getBookedSlotsService(
  screenId: string,
  date: Date,
): Promise<Array<{ from: string; to: string }>> {
  const dateKey = date.toISOString().split('T')[0] ?? '';
  const cacheKey = RedisKeys.slotCache(screenId, dateKey);

  // Try Redis cache first
  try {
    const redis = getRedisClient();
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as Array<{ from: string; to: string }>;
    }
  } catch {
    // Cache miss or Redis error — fall through to DB
  }

  const bookingDate = new Date(date);
  const startOfDay = new Date(bookingDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(bookingDate);
  endOfDay.setHours(23, 59, 59, 999);

  const bookings = await Booking.find({
    date: { $gte: startOfDay, $lte: endOfDay },
    screen: screenId,
    status: { $in: [BookingStatus.PENDING, BookingStatus.BOOKED] },
  }).select('slot');

  const slots = bookings.map((b) => ({ from: b.slot.from, to: b.slot.to }));

  // Cache result
  try {
    const redis = getRedisClient();
    await redis.setex(cacheKey, config.redis.ttl.slotAvailabilityCache, JSON.stringify(slots));
  } catch {
    // Non-critical
  }

  return slots;
}

export interface CheckSlotResult {
  available: boolean;
  reason?: 'booked' | 'overlapping' | 'locked';
  message?: string;
  conflictingSlot?: { from: string; to: string };
}

/**
 * Pre-flight check to verify if a slot is available before initiating booking / opening payment modal.
 * Checks both MongoDB (exact and overlapping reservations) and Redis checkout locks.
 */
export async function checkSlotAvailabilityService(
  screenId: string,
  date: Date,
  slot: { from: string; to: string },
): Promise<CheckSlotResult> {
  const bookingDate = new Date(date);
  const startOfDay = new Date(bookingDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(bookingDate);
  endOfDay.setHours(23, 59, 59, 999);

  // 1. Check MongoDB for existing bookings for this screen & date
  const existingBookings = await Booking.find({
    date: { $gte: startOfDay, $lte: endOfDay },
    screen: screenId,
    status: { $in: [BookingStatus.PENDING, BookingStatus.BOOKED] },
  }).select('slot');

  const requestedFrom = toMinutes(slot.from);
  let requestedTo = toMinutes(slot.to);
  if (requestedTo <= requestedFrom) requestedTo += 24 * 60; // Handle midnight wrap

  for (const b of existingBookings) {
    const existingFrom = toMinutes(b.slot.from);
    let existingTo = toMinutes(b.slot.to);
    if (existingTo <= existingFrom) existingTo += 24 * 60; // Handle midnight wrap

    // Check overlap
    if (
      (requestedFrom >= existingFrom && requestedFrom < existingTo) ||
      (requestedTo > existingFrom && requestedTo <= existingTo) ||
      (requestedFrom <= existingFrom && requestedTo >= existingTo)
    ) {
      const isExact = b.slot.from === slot.from && b.slot.to === slot.to;
      return {
        available: false,
        reason: isExact ? 'booked' : 'overlapping',
        conflictingSlot: { from: b.slot.from, to: b.slot.to },
        message: isExact
          ? `The slot (${slot.from} – ${slot.to}) has already been booked.`
          : `The requested slot (${slot.from} – ${slot.to}) overlaps with an existing booking (${b.slot.from} – ${b.slot.to}).`,
      };
    }
  }

  // 2. Check Redis for active checkout locks
  const dateKey = date.toISOString().split('T')[0] ?? '';
  const slotKey = `${slot.from}-${slot.to}`;
  try {
    const redis = getRedisClient();
    const lockKey = RedisKeys.slotLock(screenId, dateKey, slotKey);
    const locked = await redis.get(lockKey);
    if (locked) {
      return {
        available: false,
        reason: 'locked',
        conflictingSlot: slot,
        message: `This slot (${slot.from} – ${slot.to}) is currently in checkout by another customer. Please choose another slot or try again in a few minutes.`,
      };
    }
  } catch {
    // Non-critical
  }

  return {
    available: true,
  };
}

/**
 * Delete a booking (admin only).
 */
export async function deleteBookingService(bookingId: string): Promise<void> {
  const booking = await Booking.findByIdAndDelete(bookingId);
  if (!booking) throw new NotFoundError('Booking');
}

/**
 * Admin dashboard summary statistics.
 * Parallel aggregation and real counts for screens, locations, and cities.
 */
export async function getDashboardInfoService(
  locationId: Types.ObjectId | null,
  fromDate?: string,
  toDate?: string,
  statusFilter?: string,
  isSuperAdmin?: boolean,
) {
  const matchConditions: Record<string, unknown> = {};

  if (locationId) matchConditions['location'] = locationId;
  if (statusFilter && statusFilter !== 'all') matchConditions['status'] = statusFilter;

  if (fromDate || toDate) {
    const start = fromDate ? new Date(fromDate) : new Date('1970-01-01');
    const end = toDate ? new Date(toDate) : new Date();
    end.setHours(23, 59, 59, 999);
    matchConditions['date'] = { $gte: start, $lte: end };
  }

  const today = new Date();
  const todayStart = new Date(today); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today); todayEnd.setHours(23, 59, 59, 999);

  const todayMatch: Record<string, unknown> = {
    date: { $gte: todayStart, $lte: todayEnd },
  };
  if (locationId) todayMatch['location'] = locationId;

  const [totalsResult, todayBookingsCount, screensCount, locationsCount, citiesCount] = await Promise.all([
    Booking.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: '$totalPrice' },
          totalBookings: { $sum: 1 },
          pendingAmount: { $sum: '$remainingAmount' },
          advanceAmount: { $sum: '$advancePrice' },
        },
      },
    ]),
    Booking.countDocuments(todayMatch),
    Screen.countDocuments(locationId ? { location: locationId, status: true } : { status: true }),
    isSuperAdmin && !locationId ? Location.countDocuments({ status: true }) : Promise.resolve(0),
    isSuperAdmin && !locationId ? City.countDocuments({ status: true }) : Promise.resolve(0),
  ]);

  const totals = totalsResult[0];
  const totalIncome = (totals?.totalIncome as number) ?? 0;
  const pendingAmount = (totals?.pendingAmount as number) ?? 0;
  const advanceAmount = (totals?.advanceAmount as number) ?? 0;
  const currentAmount = parseFloat((totalIncome - pendingAmount).toFixed(2));
  const totalBookings = (totals?.totalBookings as number) ?? 0;
  const averageBookingValue = totalBookings > 0 ? parseFloat((totalIncome / totalBookings).toFixed(2)) : 0;

  return {
    totalIncome,
    advanceAmount,
    currentAmount,
    pendingAmount,
    totalBookings,
    todayBookings: todayBookingsCount,
    totalScreens: screensCount,
    totalLocations: locationsCount,
    totalCities: citiesCount,
    averageBookingValue,
  };
}

/**
 * Graph & Analytics data — supports location-wise and screen-wise breakdown plus timeline trend.
 */
export async function getGraphDataService(
  locationId: Types.ObjectId | null,
  fromDate?: string,
  toDate?: string,
  isSuperAdmin?: boolean,
) {
  const matchConditions: Record<string, unknown> = {};

  if (locationId) matchConditions['location'] = locationId;

  if (fromDate || toDate) {
    const start = fromDate ? new Date(fromDate) : new Date('1970-01-01');
    const end = toDate ? new Date(toDate) : new Date();
    end.setHours(23, 59, 59, 999);
    matchConditions['date'] = { $gte: start, $lte: end };
  }

  let distributionPromise;
  if (!locationId && isSuperAdmin) {
    // SuperAdmin viewing all locations -> break down by Location
    distributionPromise = Booking.aggregate([
      { $match: matchConditions },
      {
        $lookup: {
          from: 'locations',
          localField: 'location',
          foreignField: '_id',
          as: 'locationDoc',
        },
      },
      { $unwind: { path: '$locationDoc', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$location',
          name: { $first: { $ifNull: ['$locationDoc.name', 'Unknown Location'] } },
          totalAmount: { $sum: '$totalPrice' },
          bookingsCount: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);
  } else {
    // Location Admin or filtered SuperAdmin -> break down by Screen in that location
    distributionPromise = Booking.aggregate([
      { $match: matchConditions },
      {
        $lookup: {
          from: 'screens',
          localField: 'screen',
          foreignField: '_id',
          as: 'screenDoc',
        },
      },
      { $unwind: { path: '$screenDoc', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$screen',
          name: { $first: { $ifNull: ['$screenDoc.name', 'Unknown Screen'] } },
          totalAmount: { $sum: '$totalPrice' },
          bookingsCount: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);
  }

  // Timeline: Daily revenue and booking counts
  const timelinePromise = Booking.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        revenue: { $sum: '$totalPrice' },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: '$_id',
        revenue: 1,
        bookings: 1,
      },
    },
  ]);

  const [distributionRaw, timeline] = await Promise.all([
    distributionPromise,
    timelinePromise,
  ]);

  const overallTotal = distributionRaw.reduce((sum: number, r: any) => sum + (r.totalAmount || 0), 0);

  const distribution = distributionRaw.map((r: any) => ({
    id: r._id,
    name: r.name,
    location: r.name,
    totalAmount: r.totalAmount || 0,
    bookingsCount: r.bookingsCount || 0,
    percentage: overallTotal > 0 ? parseFloat((((r.totalAmount || 0) / overallTotal) * 100).toFixed(2)) : 0,
  }));

  return {
    distribution,
    timeline,
    overallTotal,
    type: !locationId && isSuperAdmin ? 'location' : 'screen',
  };
}

/**
 * Fetch emails of customers who booked yesterday (for review emails).
 */
export async function getYesterdayBookingEmails(): Promise<string[]> {
  const today = new Date();
  const yesterdayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  yesterdayStart.setHours(0, 0, 0, 0);
  const yesterdayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  yesterdayEnd.setHours(23, 59, 59, 999);

  const bookings = await Booking.find(
    { date: { $gte: yesterdayStart, $lte: yesterdayEnd } },
    '_id',
  ).populate({ path: 'customer', select: 'email' });

  const emails = bookings
    .map((b) => (b.customer as { email?: string } | null)?.email)
    .filter((e): e is string => typeof e === 'string');

  return [...new Set(emails)];
}

/**
 * Fetch bookings from 360 days ago (for anniversary reminders).
 */
export async function getBookingsFrom360DaysAgo(): Promise<Array<{ customer: string; date: Date }>> {
  const today = new Date();
  const start360 = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 360);
  start360.setHours(0, 0, 0, 0);
  const end360 = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 360);
  end360.setHours(23, 59, 59, 999);

  const bookings = await Booking.find(
    { date: { $gte: start360, $lte: end360 } },
    '_id date',
  ).populate({ path: 'customer', select: 'email' });

  return bookings.map((b) => ({
    customer: (b.customer as { email?: string } | null)?.email ?? '',
    date: b.date,
  }));
}
