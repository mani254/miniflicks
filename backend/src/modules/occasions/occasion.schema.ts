import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';

export interface IOccasion extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  position: number;
  image: string;
  price: number;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type OccasionModel = Model<IOccasion>;

const occasionSchema = new Schema<IOccasion>(
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
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

occasionSchema.pre('save', function (next) {
  if (this.name) {
    this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1);
  }
  next();
});

occasionSchema.index({ position: 1 });

export const Occasion = (mongoose.models['Occasion'] as OccasionModel) || mongoose.model<IOccasion, OccasionModel>('Occasion', occasionSchema);
