import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';

export interface ICity extends Document {
  _id: Types.ObjectId;
  name: string;
  status: boolean;
  locations: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export type CityModel = Model<ICity>;

const citySchema = new Schema<ICity>(
  {
    name: {
      type: String,
      required: [true, 'City name is required'],
      trim: true,
      unique: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    locations: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Location',
      },
    ],
  },
  { timestamps: true },
);

citySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1);
  }
  next();
});

export const City = (mongoose.models['City'] as CityModel) || mongoose.model<ICity, CityModel>('City', citySchema);
