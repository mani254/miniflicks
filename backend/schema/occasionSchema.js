const mongoose = require('mongoose');

const occasionSchema = new mongoose.Schema({
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

occasionSchema.pre('save', function (next) {
   if (this.name) {
      this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1);
   }
   next();
});

const Occasion = mongoose.model('Occasion', occasionSchema);

module.exports = Occasion;
