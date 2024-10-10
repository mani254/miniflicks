const mongoose = require('mongoose');
const City = require('./citySchema')


const locationSchema = new mongoose.Schema({
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
      default: true
   },
   city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: [true, 'City is required']
   },
   addons: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Addon'
      }
   ],
   gifts: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Gift',
      }
   ],
   admin: {
      name: {
         type: String,
         required: [true, 'Admin name is required'],
         trim: true,
      },
      email: {
         type: String,
         required: [true, 'Admin email is required'],
         match: [/.+\@.+\..+/, 'Please enter a valid email address'],
      },
      number: {
         type: String,
         required: [true, 'Admin number is required'],
         unique: true,
      },
      password: {
         type: String,
      }
   },
   screens: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
   }]
});

locationSchema.pre('save', function (next) {
   if (this.name) {
      this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1).toLowerCase();
   }
   next();
});

locationSchema.statics.isNameUniqueInCity = async function (name, cityId, locationId = null) {
   const city = await City.findById(cityId).populate('locations');
   if (!city) return false;
   const locationExists = city.locations.some(location => location.name === name);

   if (locationExists && locationId) {
      return !city.locations.some(location => location._id.toString() !== locationId && location.name === name);
   }

   return !locationExists;
};

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
