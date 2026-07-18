const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Event = require("../models/Event");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const events = [
  {
    title: "Pune Street Food Festival",
    description: "Experience the best of Pune's iconic street food — from misal pav to vada pav, bhel puri to poha. Live counters, music, and more!",
    category: "food-festival",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80",
    venue: "Dagdusheth Halwai Ground",
    address: "Budhwar Peth, Pune",
    startDate: new Date(Date.now() + 7 * 86400000),
    endDate: new Date(Date.now() + 8 * 86400000),
    price: 0,
    capacity: 500,
    bookedCount: 187,
    tags: ["street-food", "pune", "free-entry", "live-counters"],
    status: "published",
  },
  {
    title: "Wine & Cheese Tasting Evening",
    description: "A curated evening of Indian and imported wines paired with artisanal cheeses. Guided by sommelier Ravi Deshmukh.",
    category: "tasting",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80",
    venue: "The Grand Hyatt",
    address: "Kalyani Nagar, Pune",
    startDate: new Date(Date.now() + 3 * 86400000),
    endDate: new Date(Date.now() + 3 * 86400000 + 4 * 3600000),
    price: 1500,
    capacity: 60,
    bookedCount: 42,
    tags: ["wine", "cheese", "sommelier", "premium"],
    status: "published",
  },
  {
    title: "Live Jazz & BBQ Night",
    description: "Enjoy live jazz performances by The Pune Trio while savoring smoky BBQ platters, craft beers, and cocktails under the stars.",
    category: "live-music",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80",
    venue: "Baalaamanda Garden",
    address: "Koregaon Park, Pune",
    startDate: new Date(Date.now() + 5 * 86400000),
    endDate: new Date(Date.now() + 5 * 86400000 + 5 * 3600000),
    price: 800,
    capacity: 200,
    bookedCount: 134,
    tags: ["jazz", "bbq", "outdoor", "live-music"],
    status: "published",
  },
  {
    title: "Masterclass: Authentic Thai Curry",
    description: "Learn to cook green curry, pad thai, and mango sticky rice from Chef Ananya. All ingredients provided. Take home your creations!",
    category: "workshop",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=80",
    venue: "FoodHub Kitchen Studio",
    address: "Baner Road, Pune",
    startDate: new Date(Date.now() + 10 * 86400000),
    endDate: new Date(Date.now() + 10 * 86400000 + 3 * 3600000),
    price: 2500,
    capacity: 20,
    bookedCount: 18,
    tags: ["thai", "cooking-class", "hands-on", "chef"],
    status: "published",
  },
  {
    title: "Diwali Mela & Food Bazaar",
    description: "Celebrate Diwali with festive sweets, savories, rangoli competition, dandiya night, and a grand fireworks display.",
    category: "holiday",
    image: "https://images.unsplash.com/photo-1699801676350-4182399f7cdd?auto=format&fit=crop&w=900&q=80",
    venue: "Shaniwar Wada Grounds",
    address: "Shaniwar Peth, Pune",
    startDate: new Date(Date.now() + 20 * 86400000),
    endDate: new Date(Date.now() + 21 * 86400000),
    price: 0,
    capacity: 1000,
    bookedCount: 456,
    tags: ["diwali", "mela", "sweets", "fireworks", "dandiya"],
    status: "published",
  },
  {
    title: "Farm-to-Table Pop-up by GreenLeaf",
    description: "A one-day pop-up featuring organic, locally-sourced dishes by GreenLeaf Café. Seasonal ingredients, zero-waste cooking.",
    category: "pop-up",
    image: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=900&q=80",
    venue: "The Farm Café",
    address: "Aundh, Pune",
    startDate: new Date(Date.now() + 4 * 86400000),
    endDate: new Date(Date.now() + 4 * 86400000 + 6 * 3600000),
    price: 350,
    capacity: 40,
    bookedCount: 28,
    tags: ["organic", "farm-to-table", "sustainable", "pop-up"],
    status: "published",
  },
  {
    title: "Biryani Battle Royale",
    description: "10 top biryani makers compete for the Golden Pot trophy! Taste, vote, and crown Pune's best biryani. Unlimited servings included.",
    category: "food-festival",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=900&q=80",
    venue: "Empress Garden",
    address: "Near Race Course, Pune",
    startDate: new Date(Date.now() + 14 * 86400000),
    endDate: new Date(Date.now() + 14 * 86400000 + 5 * 3600000),
    price: 499,
    capacity: 300,
    bookedCount: 89,
    tags: ["biryani", "competition", "unlimited", "food-fight"],
    status: "published",
  },
  {
    title: "Chocolate Making Workshop",
    description: "Dive into the world of chocolate — temper, mold, and decorate your own bonbons and bars. Perfect for couples and friends!",
    category: "workshop",
    image: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=900&q=80",
    venue: "Cocoa Bliss Studio",
    address: "JM Road, Pune",
    startDate: new Date(Date.now() + 6 * 86400000),
    endDate: new Date(Date.now() + 6 * 86400000 + 2 * 3600000),
    price: 1200,
    capacity: 15,
    bookedCount: 15,
    tags: ["chocolate", "workshop", "hands-on", "date-activity"],
    status: "published",
  },
];

async function seedEvents() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await Event.deleteMany({});
    console.log("Cleared existing events");

    const created = await Event.insertMany(events);
    console.log(`Seeded ${created.length} events`);

    await mongoose.disconnect();
    console.log("Done!");
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
}

seedEvents();
