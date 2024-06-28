const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const locationSchema = new Schema({
   name: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 40,
      validate: {
         validator: async function (value) {
            const existingLocation = await this.constructor.findOne({ name: value });
            return !existingLocation || this._id.equals(existingLocation._id);
         },
         message: 'Name already exists'
      },
      set: capitalizeName
   },
   image: {
      type: String,
      required: true,
   },
   address: {
      type: String,
      required: true,
      minlength: [5, 'Address must be at least 5 characters long'],
      maxlength: [100, 'Address cannot exceed 100 characters']
   },
   status: {
      type: Boolean,
      default: true
   },
   city: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: 'cities'
   },
   location: {
      require: true,
      type: String,
   },
   screens: [{
      type: Schema.Types.ObjectId,
      ref: 'Screens'
   }]
}, { timestamps: true });


function capitalizeName(name) {
   return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}


const Locations = mongoose.model('Locations', locationSchema, 'locations');

module.exports = Locations;
