const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");
const mongoose = require("mongoose");

const getRestaurantForMenu = async (restaurantId, restaurantName) => {
  if (restaurantId && mongoose.Types.ObjectId.isValid(restaurantId)) {
    const restaurant = await Restaurant.findById(restaurantId);
    if (restaurant) return restaurant;
  }

  if (restaurantName) {
    const restaurant = await Restaurant.findOne({ name: restaurantName });
    if (restaurant) return restaurant;
  }

  return null;
};

// ==============================
// Create Menu Item
// ==============================
const createMenuItem = async (req, res) => {
  try {
    const {
      restaurantId,
      name,
      description,
      category,
      price,
      image,
      isAvailable,
      restaurantName,
    } = req.body;

    const restaurant = await getRestaurantForMenu(restaurantId, restaurantName);

    if (!restaurant) {
      return res.status(400).json({
        success: false,
        message: "Valid restaurantId or restaurantName is required",
      });
    }

    if (
      req.user?.role !== "admin" &&
      restaurant.ownerId?.toString() !== req.user?._id?.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can create menu items only for your own restaurant",
      });
    }

    const menuItem = await MenuItem.create({
      restaurantId: restaurant._id,
      name,
      description,
      category,
      price,
      image,
      isAvailable,
    });

    res.status(201).json({
      success: true,
      message: "Menu item created successfully",
      menuItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Get All Menu Items
// ==============================
const getMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find()
      .populate("restaurantId", "name cuisine")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: menuItems.length,
      menuItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Get Menu By Restaurant
// ==============================
const getMenuByRestaurant = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({
      restaurantId: req.params.restaurantId,
    });

    res.status(200).json({
      success: true,
      count: menuItems.length,
      menuItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Get Menu Item By ID
// ==============================
const getMenuItemById = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    res.status(200).json({
      success: true,
      menuItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Update Menu Item
// ==============================
const updateMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    const restaurant = await Restaurant.findById(menuItem.restaurantId);
    if (
      req.user?.role !== "admin" &&
      restaurant?.ownerId?.toString() !== req.user?._id?.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can update only your own restaurant menu",
      });
    }

    const updatedMenu = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Menu item updated successfully",
      menuItem: updatedMenu,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Delete Menu Item
// ==============================
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    const restaurant = await Restaurant.findById(menuItem.restaurantId);
    if (
      req.user?.role !== "admin" &&
      restaurant?.ownerId?.toString() !== req.user?._id?.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own restaurant menu",
      });
    }

    await MenuItem.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createMenuItem,
  getMenuItems,
  getMenuByRestaurant,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
};
