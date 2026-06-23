const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false        // never returned in queries by default
    },
    role: {
        type: String,
        enum: ['customer', 'restaurant', 'courier', 'admin'],
        default: 'customer'
    },
    loyaltyPoints: {
        type: Number,
        default: 0           // earned by placing orders + writing reviews
    },
    address: {
        type: String,
        default: ''
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],    // [longitude, latitude]
            default: [0, 0]
        }
    }
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });  // needed for geospatial queries

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare entered password with hashed
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);