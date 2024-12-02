const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({

   city: {
      type: Schema.Types.ObjectId,
      ref: "City",
      required: true,
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
   date: {
      type: Date,
      required: true
   },
   slot: {
      from: {
         type: String,
         required: true
      },
      to: {
         type: String,
         required: true
      }
   },
   package: {
      name: {
         type: String,
         required: true
      },
      price: {
         type: Number,
         required: true,
         default: 0
      },
      addons: [{
         type: String
      }]
   },
   occasion: {
      _id: {
         type: Schema.Types.ObjectId,
         required: true,
      },
      name: {
         type: String,
         required: true
      },
      price: {
         type: Number,
         required: true,
         default: 0
      },
      celebrantName: {
         type: String,
      }
   },
   addons: [{
      _id: {
         type: Schema.Types.ObjectId,
         required: true
      },
      name: {
         type: String,
         required: true
      },
      price: {
         type: Number,
         required: true,
         default: 0
      },
      count: {
         type: Number,
         required: true,
         default: 0
      },
   }],
   gifts: [{
      _id: {
         type: Schema.Types.ObjectId,
         required: true
      },
      name: {
         type: String,
         required: true
      },
      price: {
         type: Number,
         required: true,
         default: 0
      },
      count: {
         type: Number,
         required: true,
         default: 0
      }
   }],
   cakes: [{
      _id: {
         type: Schema.Types.ObjectId,
         required: true
      },
      name: {
         type: String,
         required: true
      },
      price: {
         type: Number,
         required: true,
         default: 0
      },
   }],
   customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
   },
   numberOfPeople: {
      type: Number,
      required: true
   },
   nameOnCake: {
      type: String,
   },
   ledName: {
      type: String
   },
   ledNumber:{
      type: String
   },
   couponCode: {
      type: String,
   },
   status: {
      type: String,
      enum: ['pending', 'booked', 'canceled'],
      default: 'pending'
   },
   couponPrice:{
      type:Number,
      default:0,
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
   razorpayOrderId: {
      type: String,
      required: false,
   },
   cancellationReason: {
      type: String,
      required: false
   }


}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
