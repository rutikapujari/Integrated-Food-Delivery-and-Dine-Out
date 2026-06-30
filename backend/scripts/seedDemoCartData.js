const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const demoRestaurantId = "6890b234c567d890e1234567";

const demoRestaurant = {
  _id: demoRestaurantId,
  name: "Demo Burger House",
  cuisine: "Fast Food",
  description: "Demo restaurant for cart API testing",
  address: "Demo Street, Mumbai",
  location: {
    type: "Point",
    coordinates: [72.8777, 19.076],
  },
  phone: "9876543210",
  email: "demo-burger-house@example.com",
  deliveryFee: 30,
  minimumOrderAmount: 0,
  status: "approved",
  isOpen: true,
};

const demoMenuItems = [
  {
    _id: "6890c345d678e901f2345678",
    restaurantId: demoRestaurantId,
    name: "Veg Burger",
    description: "Demo veg burger",
    category: "Burger",
    price: 149,
    isAvailable: true,
  },
  {
    _id: "6890d456e789f012a3456789",
    restaurantId: demoRestaurantId,
    name: "French Fries",
    description: "Demo french fries",
    category: "Sides",
    price: 99,
    isAvailable: true,
  },
  {
    _id: "6890e567f890a123b4567890",
    restaurantId: demoRestaurantId,
    name: "Veg Burger",
    description: "Demo veg burger",
    category: "Burger",
    price: 149,
    isAvailable: true,
  },
  {
    _id: "6890f678a901b234c5678901",
    restaurantId: demoRestaurantId,
    name: "French Fries",
    description: "Demo french fries",
    category: "Sides",
    price: 99,
    isAvailable: true,
  },
];

const seedDemoCartData = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from backend/.env");
  }

  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  await Restaurant.findByIdAndUpdate(demoRestaurantId, demoRestaurant, {
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true,
  });

  for (const item of demoMenuItems) {
    await MenuItem.findByIdAndUpdate(item._id, item, {
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    });
  }

  console.log("Demo cart data seeded successfully.");
  console.log(`Restaurant ID: ${demoRestaurantId}`);
  console.log("Menu item IDs:");
  demoMenuItems.forEach((item) => {
    console.log(`- ${item._id} (${item.name})`);
  });
};

seedDemoCartData()
  .catch((error) => {
    console.error("Demo seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
