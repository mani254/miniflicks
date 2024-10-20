const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
   },
   email: {
      type: String,
      required: [true, 'Email is required'],
      unique: [true, 'Email already exists'],
      trim: true,
      lowercase: true,
   },
   password: {
      type: String,
      required: [true, 'Password is required'],
   },
   superAdmin: {
      type: Boolean,
      default: true
   },
}, {
   timestamps: true,
});

adminSchema.pre('save', async function (next) {
   if (this.name) {
      this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1).toLowerCase();
   }

   if (this.isModified('password') && this.password) {
      this.password = await bcrypt.hash(this.password, 10);
   }
   next();
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
