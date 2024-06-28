const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
   position: {
      type: Number,
      default: 1
   },
   status: {
      type: Boolean,
      default: true,
      require: true
   },
   image: {
      type: String,
      required: true
   },
   heading: {
      type: String,
      required: true,
      default: '',
      minlength: 3,
      maxlength: 40,
   },
   content: {
      type: String,
      required: true,
      default: ''
   },
   redirection: {
      type: String,
      default: '/'
   }
}, { timestamps: true });

const Banner = mongoose.model('Banners', bannerSchema, 'banners');

module.exports = Banner;
