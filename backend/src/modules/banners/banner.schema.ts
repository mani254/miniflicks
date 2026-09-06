import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';

export interface IBanner extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  link: string;
  image: string;
  position: number;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type BannerModel = Model<IBanner>;

const bannerSchema = new Schema<IBanner>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    link: {
      type: String,
      required: [true, 'Link is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
    },
    position: {
      type: Number,
      default: 1,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

bannerSchema.pre('save', function (next) {
  if (this.title) {
    this.title = this.title.charAt(0).toUpperCase() + this.title.slice(1).toLowerCase();
  }
  if (this.description) {
    this.description = this.description.charAt(0).toUpperCase() + this.description.slice(1).toLowerCase();
  }
  next();
});

bannerSchema.index({ position: 1 });

export const Banner = (mongoose.models['Banner'] as BannerModel) || mongoose.model<IBanner, BannerModel>('Banner', bannerSchema);
