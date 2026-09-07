import { z } from 'zod';
import mongoose from 'mongoose';

/** Validates that a string is a valid MongoDB ObjectId */
const objectIdString = z
  .string()
  .refine((v) => mongoose.Types.ObjectId.isValid(v), { message: 'Invalid ObjectId' });

const slotSchema = z.object({
  from: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Slot time must be in HH:MM format'),
  to: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Slot time must be in HH:MM format'),
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
  count: z.number().int().min(1, 'Addon count must be at least 1'),
});

const giftItemSchema = z.object({
  _id: objectIdString,
  count: z.number().int().min(1, 'Gift count must be at least 1'),
});

const cakeItemSchema = z.object({
  _id: objectIdString,
  free: z.boolean().optional().default(false),
});

const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  number: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number'),
  email: z.string().email('Invalid customer email'),
});

const otherInfoSchema = z.object({
  numberOfPeople: z.number().int().min(0).default(0),
  numberOfExtraPeople: z.number().int().min(0).default(0),
  nameOnCake: z.string().optional().default(''),
  ledName: z.string().optional().default(''),
  ledNumber: z.string().optional().default(''),
  couponCode: z.string().optional().nullable().default(null),
});

/** Request body for creating a booking (admin or customer) */
export const CreateBookingSchema = z.object({
  city: objectIdString,
  location: objectIdString,
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
  advance: z.number().min(0).default(0),
  note: z.string().optional().default(''),
});

export type CreateBookingDto = z.infer<typeof CreateBookingSchema>;

/** Request body for updating an existing booking (admin only) */
export const UpdateBookingSchema = z.object({
  id: objectIdString,
  city: objectIdString,
  location: objectIdString,
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
    couponCode: z.string().optional().nullable(),
  }),
  advance: z.number().min(0).default(0),
  note: z.string().optional().default(''),
  fullPayment: z.boolean().default(false),
});

export type UpdateBookingDto = z.infer<typeof UpdateBookingSchema>;

/** Query params for listing bookings */
export const GetBookingsQuerySchema = z.object({
  location: objectIdString.optional(),
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
