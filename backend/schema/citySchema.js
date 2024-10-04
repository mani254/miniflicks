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
      ref: 'Screen'
   }]
})

const City = mongoose.model('City', citySchema)

module.exports = City