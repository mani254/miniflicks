import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';

export interface ICoupon extends Document {
  _id: Types.ObjectId;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  expireDate: Date;
  status: boolean;
  scrollCoupon: boolean;
  scrollingText?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CouponModel = Model<ICoupon>;

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    expireDate: {
      type: Date,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    scrollCoupon: {
      type: Boolean,
      default: false,
    },
    scrollingText: {
      type: String,
    },
  },
  { timestamps: true },
);

couponSchema.pre('save', async function (this: ICoupon) {
  if (this.code) {
    this.code = this.code.toUpperCase();
  }
});

couponSchema.index({ expireDate: 1 });

export const Coupon = (mongoose.models['Coupon'] as CouponModel) || mongoose.model<ICoupon, CouponModel>('Coupon', couponSchema);
