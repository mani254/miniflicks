import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';

export interface ISlot {
  from: string;
  to: string;
}

export interface ICustomPrice {
  date: Date;
  price: number;
}

export interface IPackage {
  name: string;
  price: number;
  customPrice: ICustomPrice[];
  addons: string[];
}

export interface IScreen extends Document {
  _id: Types.ObjectId;
  name: string;
  capacity: number;
  minPeople: number;
  extraPersonPrice: number;
  specifications: string[];
  description?: string;
  status: boolean;
  location: Types.ObjectId;
  images: string[];
  slots: ISlot[];
  packages: IPackage[];
  createdAt: Date;
  updatedAt: Date;
}

export type ScreenModel = Model<IScreen>;

const slotSchema = new Schema<ISlot>(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
  },
  { _id: false },
);

const customPriceSchema = new Schema<ICustomPrice>(
  {
    date: { type: Date, required: true },
    price: { type: Number, required: true },
  },
  { _id: false },
);

const packageSchema = new Schema<IPackage>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: [0, 'Price cannot be negative'] },
    customPrice: [customPriceSchema],
    addons: [{ type: String }],
  },
  { _id: false },
);

const screenSchema = new Schema<IScreen>(
  {
    name: {
      type: String,
      required: [true, 'Screen name is required'],
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: [1, 'Capacity must be at least 1'],
    },
    minPeople: {
      type: Number,
      required: true,
      min: [1, 'Minimum number of people must be at least 1'],
    },
    extraPersonPrice: {
      type: Number,
      required: true,
      min: [0, 'Extra person price cannot be negative'],
    },
    specifications: [{ type: String }],
    description: { type: String, trim: true },
    status: { type: Boolean, default: true },
    location: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
    },
    images: [{ type: String }],
    slots: { type: [slotSchema], required: true },
    packages: { type: [packageSchema], default: [] },
  },
  { timestamps: true },
);

screenSchema.index({ location: 1, status: 1 });

export const Screen = (mongoose.models['Screen'] as ScreenModel) || mongoose.model<IScreen, ScreenModel>('Screen', screenSchema);
