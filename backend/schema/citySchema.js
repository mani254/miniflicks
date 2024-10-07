const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, 'City name is required'],
      trim: true,
      unique: [true, 'City name alredy exists'],
   },
   status: {
      type: Boolean,
      default: true
   },
   locations: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location'
   }]
})

citySchema.pre('save', function (next) {
   if (this.isModified('name')) {
      this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1);
   }
   next();
});

const City = mongoose.model('City', citySchema)

module.exports = City