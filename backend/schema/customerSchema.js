const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customerSchema = new Schema({
   number: {
      type: String,
      required: true,
      unique: true,
   },
   name: {
      type: String,
      required: true
   }
}, { timestamps: true });


customerSchema.pre('save', function (next) {
   if (this.name) {
      this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1).toLowerCase();
      this.name = this.name.trim();
   }
   next();
});


const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
