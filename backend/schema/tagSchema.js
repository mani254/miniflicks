const mongoose = require('mongoose');
const slugify = require('slugify');

const tagSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, 'Tag name is required'],
      unique: [true, 'Tag name already exists'],
      trim: true,
   },
   slug: {
      type: String,
      unique: true,
      lowercase: true,
   },
   status: {
      type: Boolean,
      default: true,
   },
}, {
   timestamps: true
});

tagSchema.pre('save', function (next) {
   if (!this.slug && this.name) {
      this.slug = slugify(this.name, { lower: true, strict: true });
   }
   next();
});

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;