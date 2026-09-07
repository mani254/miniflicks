import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdmin extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone?: string;
  /** true = global super-admin, false = location admin */
  superAdmin: boolean;
  /** Present only when superAdmin = false — the location this admin manages */
  location?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type AdminModel = Model<IAdmin>;

const adminSchema = new Schema<IAdmin>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Never return password in queries by default
    },
    phone: {
      type: String,
      trim: true,
    },
    superAdmin: {
      type: Boolean,
      default: false,
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      default: null,
    },
  },
  { timestamps: true },
);

adminSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

export const Admin =
  (mongoose.models['Admin'] as AdminModel) ||
  mongoose.model<IAdmin, AdminModel>('Admin', adminSchema);
