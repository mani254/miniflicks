const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const citySchema = new Schema({
   name: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 40,
      set: capitalizeName
   },
   image: {
      type: String,
      required: true
   },
   status: {
      type: Boolean,
      default: true
   },
   locations: [{
      type: Schema.Types.ObjectId,
      ref: 'Locations'
   }]

}, { timestamps: true });

function capitalizeName(name) {
   return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

const Cities = mongoose.model('Cities', citySchema, 'cities');

module.exports = Cities;
