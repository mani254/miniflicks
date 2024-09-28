const mongoose = require('mongoose');
const slugify = require('slugify');


function formatFloat(value) {
   return parseFloat(value).toFixed(2);
}

const productSchema = new mongoose.Schema({
   title: {
      type: String,
      required: [true, 'Title is required'],
      unique: [true, 'Title is already existed'],
      maxlength: [100, 'Title should be less than 100 characters'],
      trim: true,
   },
   slug: {
      type: String,
      unique: true,
      lowercase: true,
   },
   overview: {
      type: String,
      required: [true, 'overview is required'],
      maxlength: [400, 'overview should be less than 400 characters'],
      trim: true
   },
   desctiption: {
      type: String,
   },
   variants: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Variant',
      }
   ],
   vendor: {
      type: String,
   },
   price: {
      type: Number,
      required: [true, 'Price is required'],
      set: formatFloat,
   },
   comparePrice: {
      type: Number,
      set: formatFloat,
   },
   gst: {
      type: Number,
      set: formatFloat,
   },
   stock: {
      type: Number,
      min: [0, 'Stock cannot be negative'],
      default: 0,
   },
   sku: {
      type: Number,
      required: [true, 'SKU is required'],
      unique: [true, 'SKU is already existed'],
   },
   metaTitle: {
      type: String,
      maxlength: [100, 'Meta title should be less than 100 characters'],
   },
   metaDescription: {
      type: String,
      maxlength: [400, 'Meta description should be less than 400 characters'],
   },
   keywords: {
      type: [String],
   },
   collection: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Collection',
      },
   ],
   tags: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Tag',
      },
   ],
   reviews: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Review'
      }
   ],
   status: {
      type: String,
      enum: ['active', 'inactive', 'draft'],
      default: 'active',
   },
   createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: True
   },
   updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
   },
   deletedAt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
   }
}, {
   timestamps: true
})


productSchema.pre('save', function (next) {
   if (!this.slug && this.title) {
      this.slug = slugify(this.title, { lower: true, strict: true });
   }
   next();
})


const Product = mongoose.model('Product', productSchema);

module.exports = Product;