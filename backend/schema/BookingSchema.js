const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const bookingSchema = new Schema({
   customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
   },
   location: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      required: true
   },
   screen: {
      type: Schema.Types.ObjectId,
      ref: 'Screen',
      required: true
   },
   bookingDate: {
      type: Date,
      required: true
   },
   bookingSlot: {
      from: {
         type: String,
         required: true
      },
      to: {
         type: String,
         required: true
      }
   },
   status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancled'],
      default: 'pending'
   },
   note: {
      type: String,
      default: ''
   },
   advancePrice: {
      type: Number,
      required: true,
      min: 0
   },
   totalPrice: {
      type: Number,
      required: true,
      min: 0
   },
   remainingAmount: {
      type: Number,
      required: true,
      min: 0
   },
   addons: [{
      type: String
   }],
   gifts: [{
      type: String
   }],
   cake: {
      name: {
         type: String,
         required: true
      },
      price: {
         type: Number,
         required: true,
         min: 0
      },
      specialCake: {
         type: Boolean,
         default: false
      },
      NameOnCake: {
         type: String,
      }
   }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
