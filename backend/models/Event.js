const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },
    category: {
      type: String,
      enum: ["food-festival", "live-music", "workshop", "tasting", "pop-up", "holiday", "other"],
      default: "other",
    },
    image: {
      type: String,
      default: "",
    },
    venue: {
      type: String,
      default: "",
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    capacity: {
      type: Number,
      default: 0,
    },
    bookedCount: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ["draft", "published", "cancelled"],
      default: "published",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

eventSchema.index({ location: "2dsphere" });
eventSchema.index({ startDate: 1, status: 1 });

module.exports = mongoose.model("Event", eventSchema);
