const mongoose = require('mongoose');

const giftSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      unique: [true, "Gift Name is already existed"],
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

giftSchema.pre('save', function (next) {
   if (this.isModified('name')) {
      this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1).toLowerCase();
   }
   next();
});

const Gift = mongoose.model('Gift', giftSchema);

module.exports = Gift;
