const mongoose = require('mongoose');

const cakeSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, 'Name is required'],
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
   special: {
      type: Boolean,
      default: false
   },
   specialPrice: {
      type: Number,
      default: 0
   }
});

cakeSchema.pre('save', function (next) {
   if (this.name) {
      this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1);
   }
   next();
});

const Cake = mongoose.model('Cake', cakeSchema);

module.exports = Cake;
