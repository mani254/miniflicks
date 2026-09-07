import mongoose, { Schema, type Document, type Model } from 'mongoose';
import { BookingStatus } from '../../shared/constants/orderStatus';
import type { BookingStatusType } from '../../shared/constants/orderStatus';

// ─── Sub-document interfaces ──────────────────────────────────────────────────

export interface ISlot {
  from: string; // "HH:MM"
  to: string;   // "HH:MM"
}

export interface IPackageSnapshot {
  name: string;
  price: number;
  addons: string[];
}

export interface IOccasionSnapshot {
  _id: mongoose.Types.ObjectId;
  name: string;
  price: number;
  celebrantName?: string;
}

export interface IAddonSnapshot {
  _id: mongoose.Types.ObjectId;
  name: string;
  price: number;
  count: number;
}

export interface IGiftSnapshot {
  _id: mongoose.Types.ObjectId;
  name: string;
  price: number;
  count: number;
}

export interface ICakeSnapshot {
  _id: mongoose.Types.ObjectId;
  name: string;
  price: number;
  free: boolean;
}

// ─── Main booking document interface ─────────────────────────────────────────

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId;
  city: mongoose.Types.ObjectId;
  location: mongoose.Types.ObjectId;
  screen: mongoose.Types.ObjectId;
  date: Date;
  slot: ISlot;
  package: IPackageSnapshot;
  occasion: IOccasionSnapshot;
  addons: IAddonSnapshot[];
  gifts: IGiftSnapshot[];
  cakes: ICakeSnapshot[];
  customer: mongoose.Types.ObjectId;
  numberOfPeople: number;
  nameOnCake: string;
  ledName: string;
  ledNumber: string;
  note: string;
  status: BookingStatusType;
  couponCode: string | null;
  couponPrice: number;
  advancePrice: number;
  totalPrice: number;
  remainingAmount: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;   // Fix M12 — was set in code but not declared in schema
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingModel = Model<IBooking>;

// ─── Schema definition ────────────────────────────────────────────────────────

const bookingSchema = new Schema<IBooking>(
  {
    city: { type: Schema.Types.ObjectId, ref: 'City', required: true },
    location: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    screen: { type: Schema.Types.ObjectId, ref: 'Screen', required: true },
    date: { type: Date, required: true },
    slot: {
      from: { type: String, required: true },
      to: { type: String, required: true },
    },
    package: {
      name: { type: String, required: true },
      price: { type: Number, required: true, default: 0 },
      addons: [{ type: String }],
    },
    occasion: {
      _id: { type: Schema.Types.ObjectId, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true, default: 0 },
      celebrantName: { type: String },
    },
    addons: [
      {
        _id: { type: Schema.Types.ObjectId, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true, default: 0 },
        count: { type: Number, required: true, default: 0 },
      },
    ],
    gifts: [
      {
        _id: { type: Schema.Types.ObjectId, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true, default: 0 },
        count: { type: Number, required: true, default: 0 },
      },
    ],
    cakes: [
      {
        _id: { type: Schema.Types.ObjectId, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true, default: 0 },
        free: { type: Boolean, default: false },
      },
    ],
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    numberOfPeople: { type: Number, required: true },
    nameOnCake: { type: String, default: '' },
    ledName: { type: String, default: '' },
    ledNumber: { type: String, default: '' },
    note: { type: String, default: '' },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
    },
    couponCode: { type: String, default: null },
    couponPrice: { type: Number, default: 0 },
    advancePrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    remainingAmount: { type: Number, required: true, min: 0 },
    razorpayOrderId: { type: String, sparse: true },
    razorpayPaymentId: { type: String, sparse: true }, // Fix M12 — was missing from schema
    cancellationReason: { type: String },
  },
  { timestamps: true },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Only indexes justified by actual query patterns in booking service.

/** Slot conflict detection: find all bookings for a given screen on a date */
bookingSchema.index({ date: 1, screen: 1, status: 1 });

/** Payment verification: look up booking by Razorpay order ID */
bookingSchema.index({ razorpayOrderId: 1 }, { sparse: true });

/** Dashboard queries: filter by status + sort by most recent */
bookingSchema.index({ status: 1, createdAt: -1 });

/** Admin booking list: filter by location + date range */
bookingSchema.index({ location: 1, date: -1 });

/** Customer booking history */
bookingSchema.index({ customer: 1, createdAt: -1 });

export const Booking = mongoose.model<IBooking, BookingModel>('Booking', bookingSchema);
