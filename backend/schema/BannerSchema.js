const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
   title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
   },
   description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
   },
   link: {
      type: String,
      required: [true, 'Link is required'],
      trim: true,
   },
   image: {
      type: String,
      required: [true, 'Image is required'],
   },
   position: {
      type: Number,
      default: 1
   },
   status: {
      type: Boolean,
      default: true,
   },
});

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
