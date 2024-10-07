const mongoose = require('mongoose');

const addonSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
   },
   description: {
      type: String,
      trim: true,
   },
   position: {
      type: Number,
      default: 0
   },
   image: {
      type: String,
      required: [true, 'Image is required'],
   },
   price: {
      type: Number,
      required: [true, 'Price is required'],
   },
});

const Addon = mongoose.model('Addon', addonSchema);

module.exports = Addon;
