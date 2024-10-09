const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
   from: {
      type: String,
      required: true,
   },
   to: {
      type: String,
      required: true,
   },
}, { _id: false });

const packageSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true,
   },
   price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
   },
   customPrice: [{
      date: {
         type: Date,
         required: true
      },
      price: {
         type: Number,
         required: true,
      }
   }],
   addons: [String]
}, { _id: false })

const screenSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, 'Screen name is required'],
      trim: true,
   },
   capacity: {
      type: Number,
      required: true,
      min: [1, 'Capacity must be at least 1'],
   },
   minPeople: {
      type: Number,
      required: true,
      min: [1, 'Minimum number of people must be at least 1'],
   },
   extraPersonPrice: {
      type: Number,
      required: true,
      min: [0, 'Extra person price cannot be negative'],
   },
   specifications: {
      type: [String],
   },
   description: {
      type: String,
      trim: true,
   },
   status: {
      type: Boolean,
      default: true,
   },
   location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
   },

   images: {
      type: [String],
   },
   slots: {
      type: [slotSchema],
      required: true,
   },
   packages: {
      type: [packageSchema],
   },

}, { timestamps: true });

const Screen = mongoose.model('Screen', screenSchema);

module.exports = Screen;
