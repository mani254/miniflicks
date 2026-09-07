import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';

export interface IGift extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  image: string;
  position: number;
  price: number;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type GiftModel = Model<IGift>;

const giftSchema = new Schema<IGift>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
    },
    position: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

giftSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1).toLowerCase();
  }
  next();
});

giftSchema.index({ position: 1 });

export const Gift = (mongoose.models['Gift'] as GiftModel) || mongoose.model<IGift, GiftModel>('Gift', giftSchema);
