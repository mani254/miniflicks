const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, 'Variant name is required'],
   },
   options: [
      {
         option: {
            type: String,
            required: [true, 'Option name is required'],
         },
         stock: {
            type: Number,
            required: [true, 'Option stock is required'],
            min: [0, 'Stock cannot be negative'],
         },
      },
   ],
   images: {
      type: [String],
      required: [true, 'Images are required'],
      validate: {
         validator: function (arr) {
            return arr.length > 0;
         },
         message: 'There must be at least one image for each variant',
      },
   },
   stock: {
      type: Number,
      required: [true, 'Variant stock is required'],
      min: [0, ' Variant stock cannot be negative'],
   },
});

const Variant = mongoose.model('Variant', variantSchema);

module.exports = Variant;
