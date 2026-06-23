const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    cuisine: {
        type: String,
        required: true      // e.g. "Indian", "Chinese", "Italian"
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',        // the User with role: 'restaurant'
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: [Number]  // [longitude, latitude]
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    openHours: {
        open: { type: String, default: '09:00' },  // "09:00"
        close: { type: String, default: '22:00' }   // "22:00"
    },
    isOpen: {
        type: Boolean,
        default: true        // restaurant owner can toggle this
    },
    image: {
        type: String,        // S3 URL for restaurant banner
        default: ''
    }
}, { timestamps: true });

restaurantSchema.index({ location: '2dsphere' });  // REQUIRED for geospatial search

module.exports = mongoose.model('Restaurant', restaurantSchema);