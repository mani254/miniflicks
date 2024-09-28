const mongoose = require('mongoose');
const slugify = require('slugify');

const collectionSchema = new mongoose.Schema({
   title: {
      type: String,
      required: [true, 'Title is required'],
      unique: [true, 'Title already exists'],
      trim: true,
   },
   slug: {
      type: String,
      unique: true,
      lowercase: true,
   },
   image: {
      type: String,
      required: [true, 'Collection image is required'],
   },
   description: {
      type: String,
   },
   status: {
      type: Boolean,
      default: true,
   },
}, {
   timestamps: true
});


collectionSchema.pre('save', function (next) {
   if (!this.slug && this.title) {
      this.slug = slugify(this.title, { lower: true, strict: true });
   }
   next();
});


const Collection = mongoose.model('Collection', collectionSchema);

module.exports = Collection;
