const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cuisine: {
    type: String,
    required: [true, 'Cuisine is required'],
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: [true, 'Restaurant coordinates are required'],
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length === 2;
        },
        message: 'Coordinates must be [longitude, latitude]'
      }
    }
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  openHours: {
    open: {
      type: String,
      default: '09:00'
    },
    close: {
      type: String,
      default: '22:00'
    }
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: 0
  }
}, { timestamps: true });

restaurantSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
