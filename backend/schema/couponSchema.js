const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
   code: {
      type: String,
      required: true,
      unique: true,
   },
   discount: {
      type: Number,
      required: true,
   },
   type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
   },
   expireDate: {
      type: Date,
      required: true,
   },
   status: {
      type: Boolean,
      default: true,
   },
}, { timestamps: true });

couponSchema.pre('save', function (next) {
   this.code = this.code.toUpperCase();
   next();
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon
