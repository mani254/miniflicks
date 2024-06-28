const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt')

const adminSchema = new Schema({
   username: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 40
   },

   password: {
      type: String,
      required: true
   },
   email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
         validator: function (v) {
            return /\S+@\S+\.\S+/.test(v);
         },
         message: props => `${props.value} is not a valid email address!`
      }
   },
   superAdmin: {
      type: Boolean,
      default: false
   },

   locations: [{
      type: Schema.Types.ObjectId,
      ref: 'Locations'
   }],
   otp: {
      type: Number,
      default: function () {
         return Math.floor(100000 + Math.random() * 900000);
      },
   },
}, { timestamps: true });


adminSchema.pre("save", async function (next) {
   const admin = this;
   if (!admin.isModified("password")) {
      return next();
   }
   try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(admin.password, salt); // Fixed: Use admin.password instead of user.password
      admin.password = hashedPassword;
      return next();
   } catch (error) {
      return next(error);
   }
});


adminSchema.pre("save", function (next) {
   this.otp = Math.floor(100000 + Math.random() * 900000);
   next();
});

const Admins = mongoose.model('Admins', adminSchema, 'admins');

module.exports = Admins;
