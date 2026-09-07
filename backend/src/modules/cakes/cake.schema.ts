import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';

export interface ICake extends Document {
  _id: Types.ObjectId;
  name: string;
  position: number;
  image: string;
  price: number;
  special: boolean;
  specialPrice: number;
  status?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CakeModel = Model<ICake>;

const cakeSchema = new Schema<ICake>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    position: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    special: {
      type: Boolean,
      default: false,
    },
    specialPrice: {
      type: Number,
      default: 0,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

cakeSchema.pre('save', function (next) {
  if (this.name) {
    this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1);
  }
  next();
});

cakeSchema.index({ position: 1 });

export const Cake = (mongoose.models['Cake'] as CakeModel) || mongoose.model<ICake, CakeModel>('Cake', cakeSchema);
