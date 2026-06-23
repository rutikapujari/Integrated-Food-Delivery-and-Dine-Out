const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true    // e.g. "Starter", "Main Course", "Dessert", "Drinks"
  },
  image: {
    type: String,     // AWS S3 URL — uploaded via multer-s3
    default: ''
  },
  isAvailable: {
    type: Boolean,
    default: true     // owner can mark items out of stock
  },
  description: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);