import { z } from 'zod';
import mongoose from 'mongoose';

/** Validates that a string is a valid MongoDB ObjectId */
const objectIdString = z
  .string()
  .refine((v) => mongoose.Types.ObjectId.isValid(v), { message: 'Invalid ObjectId' });

/** Optional ObjectId that cleanly converts empty string/null to undefined */
const optionalObjectIdString = z
  .string()
  .optional()
  .nullable()
  .transform((v) => (v && v.trim() !== '' ? v.trim() : undefined))
  .refine((v) => v === undefined || mongoose.Types.ObjectId.isValid(v), {
    message: 'Invalid ObjectId',
  });

const slotSchema = z.object({
  from: z
    .string()
    .regex(/^\d{1,2}:\d{2}$/, 'Slot time must be in HH:MM format'),
  to: z
    .string()
    .regex(/^\d{1,2}:\d{2}$/, 'Slot time must be in HH:MM format'),
});

const packageSchema = z.object({
  name: z.string().min(1, 'Package name is required'),
});

const occasionSchema = z.object({
  _id: objectIdString,
  celebrantName: z.string().optional(),
});

const addonItemSchema = z.object({
  _id: objectIdString,
  count: z.coerce.number().int().min(1, 'Addon count must be at least 1'),
});

const giftItemSchema = z.object({
  _id: objectIdString,
  count: z.coerce.number().int().min(1, 'Gift count must be at least 1'),
});

const cakeItemSchema = z.object({
  _id: objectIdString,
  free: z.boolean().optional().default(false),
});

const customerSchema = z.object({
  name: z.string().trim().min(1, 'Customer name is required'),
  number: z
    .string()
    .transform((v) => v.replace(/[\s-]/g, ''))
    .refine((v) => /^\+?[0-9]{10,15}$/.test(v), {
      message: 'Invalid phone number (must be 10-15 digits)',
    }),
  email: z
    .string()
    .transform((v) => v.trim())
    .refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
      message: 'Invalid customer email',
    }),
});

const otherInfoSchema = z.object({
  numberOfPeople: z.coerce.number().int().min(0).default(0),
  numberOfExtraPeople: z.coerce.number().int().min(0).default(0),
  nameOnCake: z.string().optional().default(''),
  ledName: z.string().optional().default(''),
  ledNumber: z.string().optional().default(''),
  couponCode: z.string().optional().nullable().transform((val) => (val && val.trim() ? val.trim() : null)).default(null),
});

/** Request body for creating a booking (admin or customer) */
export const CreateBookingSchema = z.object({
  city: optionalObjectIdString,
  location: optionalObjectIdString,
  screen: objectIdString,
  date: z
    .string()
    .or(z.date())
    .transform((v) => new Date(v))
    .refine((d) => !isNaN(d.getTime()), 'Invalid date'),
  slot: slotSchema,
  package: packageSchema,
  occasion: occasionSchema,
  addons: z.array(addonItemSchema).default([]),
  gifts: z.array(giftItemSchema).default([]),
  cakes: z.array(cakeItemSchema).default([]),
  customer: customerSchema,
  otherInfo: otherInfoSchema,
  advance: z.coerce.number().min(0).default(0),
  note: z.string().optional().default(''),
});

export type CreateBookingDto = z.infer<typeof CreateBookingSchema>;

/** Request body for updating an existing booking (admin only) */
export const UpdateBookingSchema = z.object({
  id: objectIdString,
  city: optionalObjectIdString,
  location: optionalObjectIdString,
  screen: objectIdString,
  date: z
    .string()
    .or(z.date())
    .transform((v) => new Date(v)),
  slot: slotSchema,
  package: packageSchema,
  occasion: occasionSchema,
  addons: z.array(addonItemSchema).default([]),
  gifts: z.array(giftItemSchema).default([]),
  cakes: z.array(cakeItemSchema).default([]),
  otherInfo: otherInfoSchema.extend({
    couponCode: z.string().optional().nullable().transform((val) => (val && val.trim() ? val.trim() : null)),
  }),
  advance: z.coerce.number().min(0).default(0),
  note: z.string().optional().default(''),
  fullPayment: z.boolean().default(false),
});

export type UpdateBookingDto = z.infer<typeof UpdateBookingSchema>;

/** Query params for listing bookings */
export const GetBookingsQuerySchema = z.object({
  location: optionalObjectIdString,
  search: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  status: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  page: z.coerce.number().int().min(1).default(1),
});

export type GetBookingsQuery = z.infer<typeof GetBookingsQuerySchema>;

/** Request body for verifying Razorpay payment */
export const VerifyPaymentSchema = z.object({
  razorpay_payment_id: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export type VerifyPaymentDto = z.infer<typeof VerifyPaymentSchema>;

/** Request body for getting booked slots */
export const GetBookedSlotsSchema = z.object({
  currentDate: z
    .string()
    .or(z.date())
    .transform((v) => new Date(v))
    .refine((d) => !isNaN(d.getTime()), 'Invalid date'),
  screenId: objectIdString,
});

export type GetBookedSlotsDto = z.infer<typeof GetBookedSlotsSchema>;

/** Request body for checking slot availability before booking / opening payment modal */
export const CheckSlotAvailabilitySchema = z.object({
  screenId: objectIdString,
  date: z
    .string()
    .or(z.date())
    .transform((v) => new Date(v))
    .refine((d) => !isNaN(d.getTime()), 'Invalid date'),
  slot: slotSchema,
});

export type CheckSlotAvailabilityDto = z.infer<typeof CheckSlotAvailabilitySchema>;

