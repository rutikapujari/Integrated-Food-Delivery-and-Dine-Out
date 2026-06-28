const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true
    },

    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: 6,
        select: false
    },

    role: {
        type: String,
        enum: [
            "customer",
            "restaurant",
            "courier",
            "admin"
        ],
        default: "customer"
    },

    loyaltyPoints: {
        type: Number,
        default: 0
    },

    address: {
        type: String,
        default: ""
    },

    location: {

        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },

        coordinates: {
            type: [Number],
            default: [0, 0]
        }

    },


    // EMAIL VERIFICATION

    isVerified: {
        type: Boolean,
        default: false
    },

    emailToken: {
        type: String,
        default: null
    },


    // FORGOT PASSWORD

    resetToken: {
        type: String,
        default: null
    },

    resetExpire: {
        type: Date,
        default: null
    },

    refreshToken: {
        type: String,
        default: null,
        select: false
    },

    refreshExpire: {
        type: Date,
        default: null,
        select: false
    }

},

    {
        timestamps: true
    });


// GEO INDEX

userSchema.index({
    location: "2dsphere"
});


// HASH PASSWORD

userSchema.pre(
    "save",
    async function () {

        if (
            !this.isModified(
                "password"
            )
        ) return;

        this.password =
            await bcrypt.hash(
                this.password,
                12
            );

    }
);


// MATCH PASSWORD

userSchema.methods.matchPassword =
    async function (
        enteredPassword
    ) {

        return await bcrypt.compare(
            enteredPassword,
            this.password
        );

    };


module.exports =
    mongoose.model(
        "User",
        userSchema
    );
