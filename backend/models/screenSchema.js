const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true,
      unique: true,
      maxlength: [15, 'Name must be less than or equal to 15 characters']
   },
   smallDescription: {
      type: String,
      maxlength: [100, 'Small description must be less than or equal to 100 characters']
   },
   longDescription: {
      type: String,
      maxlength: [400, 'Long description must be less than or equal to 400 characters']
   },
   allowed: {
      type: Number,
      required: true
   },
   price: {
      type: Number,
      required: true
   },
   capacity: {
      type: Number,
      required: true
   },
   extraPrice: {
      type: Number,
      required: true
   },
   images: {
      type: [String],
      validate: {
         validator: function (v) {
            return Array.isArray(v) && v.every(item => typeof item === 'string');
         },
         message: 'Images must be an array of strings'
      }
   },
   slots: {
      type: [{
         startTime: { type: String },
         endTime: { type: String },
         id: { type: Number, unique: true }
      }]
   },
   customizedSlots: {
      type: [{
         date: { type: Date },
         slot: {
            startTime: { type: String },
            endTime: { type: String }
         },
         price: { type: Number, required: true }
      }]
   },
   location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location'
   }
});

const Screen = mongoose.model('Screens', screenSchema, 'screens');

module.exports = Screen;
