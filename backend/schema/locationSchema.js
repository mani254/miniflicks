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
   // screens: [{
   //    type: mongoose.Schema.Types.ObjectId,
   //    ref: 'Screen',
   // }]
});


locationSchema.statics.isNameUniqueInCity = async function (name, cityId, locationId = null) {
   // console.log(name, cityId, locationId)
   const city = await City.findById(cityId).populate('locations');
   if (!city) return false;
   // console.log(city)
   const locationExists = city.locations.some(location => location.name === name);
   // console.log(locationExists)

   if (locationExists && locationId) {
      return !city.locations.some(location => location._id.toString() !== locationId && location.name === name);
   }

   return !locationExists;
};

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
