const mongoose = require('mongoose');

const giftSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
   },
   description: {
      type: String,
      trim: true,
   },
   image: {
      type: String,
      required: [true, 'Image is required'],
   },
   position: {
      type: Number,
      default: 0
   },
   price: {
      type: Number,
      required: [true, 'Price is required'],
   },
});

const Gift = mongoose.model('Gift', giftSchema);

module.exports = Gift;