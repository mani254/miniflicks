import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';

export interface ICustomer extends Document {
  _id: Types.ObjectId;
  number: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CustomerModel = Model<ICustomer>;

const customerSchema = new Schema<ICustomer>(
  {
    number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true },
);

customerSchema.pre('save', function (next) {
  if (this.name) {
    this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1).toLowerCase();
    this.name = this.name.trim();
  }
  next();
});

export const Customer = (mongoose.models['Customer'] as CustomerModel) || mongoose.model<ICustomer, CustomerModel>('Customer', customerSchema);
