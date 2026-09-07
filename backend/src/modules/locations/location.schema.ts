import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';

export interface ILocation extends Document {
  _id: Types.ObjectId;
  name: string;
  address: string;
  addressLink?: string;
  image?: string;
  status: boolean;
  city: Types.ObjectId;
  addons: Types.ObjectId[];
  gifts: Types.ObjectId[];
  occasions: Types.ObjectId[];
  cakes?: Types.ObjectId[];
  /** Reference to the Admin document that manages this location */
  admin: Types.ObjectId;
  screens: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LocationModel extends Model<ILocation> {
  isNameUniqueInCity(
    name: string,
    cityId: string | Types.ObjectId,
    locationId?: string | Types.ObjectId | null,
  ): Promise<boolean>;
}

const locationSchema = new Schema<ILocation, LocationModel>(
  {
    name: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    addressLink: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    status: {
      type: Boolean,
      default: true,
    },
    city: {
      type: Schema.Types.ObjectId,
      ref: 'City',
      required: [true, 'City is required'],
    },
    addons: [{ type: Schema.Types.ObjectId, ref: 'Addon' }],
    gifts: [{ type: Schema.Types.ObjectId, ref: 'Gift' }],
    occasions: [{ type: Schema.Types.ObjectId, ref: 'Occasion' }],
    cakes: [{ type: Schema.Types.ObjectId, ref: 'Cake' }],
    /** Reference to Admin doc — use .populate('admin') to get name/email/phone */
    admin: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: [true, 'Admin is required'],
    },
    screens: [{ type: Schema.Types.ObjectId, ref: 'Screen' }],
  },
  { timestamps: true },
);

locationSchema.pre('save', function (next) {
  if (this.name) {
    this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1).toLowerCase();
  }
  next();
});

locationSchema.statics['isNameUniqueInCity'] = async function (
  name: string,
  cityId: string | Types.ObjectId,
  locationId: string | Types.ObjectId | null = null,
): Promise<boolean> {
  const City = mongoose.model('City');
  const city = (await City.findById(cityId).populate('locations')) as {
    locations?: Array<{ _id: Types.ObjectId; name: string }>;
  } | null;
  if (!city || !city.locations) return false;
  const locationExists = city.locations.some(
    (loc: { _id: Types.ObjectId; name: string }) => loc.name === name,
  );

  if (locationExists && locationId) {
    return !city.locations.some(
      (loc: { _id: Types.ObjectId; name: string }) =>
        loc._id.toString() !== locationId.toString() && loc.name === name,
    );
  }

  return !locationExists;
};

export const Location =
  (mongoose.models['Location'] as LocationModel) ||
  mongoose.model<ILocation, LocationModel>('Location', locationSchema);
