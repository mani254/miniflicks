const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for the Users collection
const userSchema = new Schema({
   number: {
      type: String,
      required: true,
      unique: true
   },
   email: {
      type: String,
      required: true,
      unique: true
   },
   name: {
      type: String,
      required: true
   },
   orders: [{
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true
   }]
}, { timestamps: true });

// Create model for the Users schema
const Users = mongoose.model('Users', userSchema, 'users');

module.exports = Users;
