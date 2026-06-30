const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const restaurants = [
  {
    _id: "689100000000000000000001",
    name: "Spice Junction",
    cuisine: "Indian",
    description: "North Indian curries, biryani, and tandoor favorites.",
    address: "FC Road, Pune",
    location: {
      type: "Point",
      coordinates: [73.8412, 18.5204],
    },
    phone: "9876500001",
    email: "spice-junction@example.com",
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80",
    tags: ["biryani", "tandoor", "paneer"],
    deliveryFee: 35,
    minimumOrderAmount: 149,
    averagePrepTime: 30,
    rating: 4.4,
    totalReviews: 128,
    status: "approved",
    isOpen: true,
  },
  {
    _id: "689100000000000000000002",
    name: "Urban Pizza Co",
    cuisine: "Italian",
    description: "Fresh pizzas, pasta bowls, garlic breads, and desserts.",
    address: "Baner Road, Pune",
    location: {
      type: "Point",
      coordinates: [73.7898, 18.559],
    },
    phone: "9876500002",
    email: "urban-pizza@example.com",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80",
    tags: ["pizza", "pasta", "italian"],
    deliveryFee: 40,
    minimumOrderAmount: 199,
    averagePrepTime: 25,
    rating: 4.2,
    totalReviews: 93,
    status: "approved",
    isOpen: true,
  },
  {
    _id: "689100000000000000000003",
    name: "Green Bowl Cafe",
    cuisine: "Healthy",
    description: "Salads, wraps, smoothies, and light cafe meals.",
    address: "Koregaon Park, Pune",
    location: {
      type: "Point",
      coordinates: [73.905, 18.5362],
    },
    phone: "9876500003",
    email: "green-bowl@example.com",
    image:
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80",
    tags: ["salad", "wraps", "smoothies"],
    deliveryFee: 25,
    minimumOrderAmount: 129,
    averagePrepTime: 20,
    rating: 4.6,
    totalReviews: 76,
    status: "approved",
    isOpen: true,
  },
];

const menuItems = [
  {
    _id: "689200000000000000000001",
    restaurantId: "689100000000000000000001",
    name: "Paneer Butter Masala",
    description: "Cottage cheese in a creamy tomato and butter gravy.",
    category: "Main Course",
    price: 249,
    image:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "689200000000000000000002",
    restaurantId: "689100000000000000000001",
    name: "Chicken Dum Biryani",
    description: "Aromatic basmati rice layered with spiced chicken.",
    category: "Biryani",
    price: 299,
    image:
      "https://images.unsplash.com/photo-1563379091339-03246963d51a?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "689200000000000000000003",
    restaurantId: "689100000000000000000001",
    name: "Veg Thali",
    description: "Dal, sabzi, rice, roti, salad, pickle, and dessert.",
    category: "Thali",
    price: 199,
    image:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "689200000000000000000004",
    restaurantId: "689100000000000000000001",
    name: "Tandoori Roti",
    description: "Whole wheat roti cooked in a clay tandoor.",
    category: "Breads",
    price: 35,
    image:
      "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "689200000000000000000005",
    restaurantId: "689100000000000000000001",
    name: "Masala Chaas",
    description: "Chilled spiced buttermilk with roasted cumin.",
    category: "Beverages",
    price: 69,
    image:
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "689200000000000000000006",
    restaurantId: "689100000000000000000001",
    name: "Gulab Jamun",
    description: "Soft milk dumplings served in warm sugar syrup.",
    category: "Desserts",
    price: 89,
    image:
      "https://images.unsplash.com/photo-1605197228722-3c9f3f57e25f?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "689200000000000000000007",
    restaurantId: "689100000000000000000002",
    name: "Margherita Pizza",
    description: "Classic cheese pizza with tomato sauce and basil.",
    category: "Pizza",
    price: 239,
    image:
      "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "689200000000000000000008",
    restaurantId: "689100000000000000000002",
    name: "Farmhouse Pizza",
    description: "Loaded with capsicum, onion, tomato, corn, and olives.",
    category: "Pizza",
    price: 329,
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "689200000000000000000009",
    restaurantId: "689100000000000000000002",
    name: "Penne Alfredo",
    description: "Penne pasta tossed in creamy parmesan white sauce.",
    category: "Pasta",
    price: 279,
    image:
      "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "689200000000000000000010",
    restaurantId: "689100000000000000000002",
    name: "Garlic Breadsticks",
    description: "Toasted breadsticks brushed with garlic butter.",
    category: "Sides",
    price: 129,
    image:
      "https://images.unsplash.com/photo-1619531038896-deaff53d151f?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "689200000000000000000011",
    restaurantId: "689100000000000000000002",
    name: "Choco Lava Cake",
    description: "Warm chocolate cake with a molten center.",
    category: "Desserts",
    price: 119,
    image:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "689200000000000000000012",
    restaurantId: "689100000000000000000002",
    name: "Iced Lemon Tea",
    description: "Refreshing black tea with lemon and ice.",
    category: "Beverages",
    price: 89,
    image:
      "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "689200000000000000000013",
    restaurantId: "689100000000000000000003",
    name: "Greek Salad Bowl",
    description: "Lettuce, cucumber, olives, feta, and lemon dressing.",
    category: "Salads",
    price: 219,
    image:
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "689200000000000000000014",
    restaurantId: "689100000000000000000003",
    name: "Paneer Tikka Wrap",
    description: "Whole wheat wrap with paneer tikka and crunchy veggies.",
    category: "Wraps",
    price: 189,
    image:
      "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "689200000000000000000015",
    restaurantId: "689100000000000000000003",
    name: "Quinoa Power Bowl",
    description: "Quinoa, chickpeas, roasted vegetables, and tahini sauce.",
    category: "Bowls",
    price: 259,
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "689200000000000000000016",
    restaurantId: "689100000000000000000003",
    name: "Avocado Toast",
    description: "Sourdough toast topped with avocado, seeds, and chili flakes.",
    category: "Cafe",
    price: 179,
    image:
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "689200000000000000000017",
    restaurantId: "689100000000000000000003",
    name: "Mango Smoothie",
    description: "Mango, yogurt, honey, and chia seeds blended chilled.",
    category: "Beverages",
    price: 149,
    image:
      "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "689200000000000000000018",
    restaurantId: "689100000000000000000003",
    name: "Fruit Yogurt Parfait",
    description: "Greek yogurt layered with seasonal fruits and granola.",
    category: "Desserts",
    price: 159,
    image:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80",
  },
];

const seedFoodData = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from backend/.env");
  }

  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  for (const restaurant of restaurants) {
    await Restaurant.findByIdAndUpdate(restaurant._id, restaurant, {
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    });
  }

  for (const menuItem of menuItems) {
    await MenuItem.findByIdAndUpdate(
      menuItem._id,
      { ...menuItem, isAvailable: true },
      {
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );
  }

  console.log("Food delivery data seeded successfully.");
  console.log(`Restaurants added/updated: ${restaurants.length}`);
  console.log(`Menu items added/updated: ${menuItems.length}`);
};

seedFoodData()
  .catch((error) => {
    console.error("Food seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
