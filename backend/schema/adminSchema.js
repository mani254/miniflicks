const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
   phone: {
      type: Number,
      required: [true, 'Phone number is required'],
      unique: [true, 'Phone number already exists'],
      trim: true,
   },
   address: {
      type: String,
      trim: true,
   },
   image: {
      type: String,
      trim: true,
   },
   password: {
      type: String,
      required: [true, 'Password is required'],
   },
   otp: {
      code: {
         type: String,
      },
      expiresAt: {
         type: Date,
      },
   },
}, {
   timestamps: true,
});

// Pre-save hook to hash the password before saving
adminSchema.pre('save', async function (next) {
   if (this.isModified('password') && this.password) {
      this.password = await bcrypt.hash(this.password, 10);
   }
   next();
});

// Method to generate and set a new OTP
adminSchema.methods.generateOtp = async function () {
   const otpCode = crypto.randomBytes(3).toString('hex');
   const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

   this.otp = { code: otpCode, expiresAt };
   await this.save();
};

// Method to validate OTP
adminSchema.methods.validateOtp = function (otpCode) {
   if (this.otp && this.otp.code === otpCode && this.otp.expiresAt > Date.now()) {
      return true;
   }
   return false;
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
