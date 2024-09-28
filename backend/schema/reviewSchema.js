const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
   user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },
   product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
   },
   rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
   },
   comment: {
      type: String,
      maxlength: [1000, 'Comment should not exceed 1000 characters'],
   },
}, {
   timestamps: true,
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;