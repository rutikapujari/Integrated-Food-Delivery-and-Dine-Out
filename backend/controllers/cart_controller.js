const Cart = require("../models/Cart");
const MenuItem = require("../models/Menuitem");
const mongoose = require("mongoose");

const getCartUserId = async (req) => {
  if (req.user?.id) return req.user.id;
  return null;
};

const calculateCartTotal = async (items) => {
  let total = 0;

  for (const item of items) {
    const menu = await MenuItem.findById(item.menuItemId);
    if (menu) {
      total += menu.price * item.quantity;
    }
  }

  return total;
};

const getMenuItemForCart = async (menuItemId) => {
  if (menuItemId && mongoose.Types.ObjectId.isValid(menuItemId)) {
    const menuItem = await MenuItem.findById(menuItemId);
    if (menuItem) return menuItem;
  }

  return null;
};

// ==============================
// Add Item To Cart
// ==============================
const addToCart = async (req, res) => {
  try {
    const { restaurantId, menuItemId, quantity } = req.body;
    const userId = await getCartUserId(req);
    const menuItem = await getMenuItemForCart(menuItemId);

    if (!userId || !menuItem) {
      return res.status(400).json({
        success: false,
        message: "Valid menuItemId is required",
      });
    }
    const resolvedMenuItemId = menuItem._id.toString();

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        restaurantId: restaurantId || menuItem.restaurantId,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) => item.menuItemId.toString() === resolvedMenuItemId
    );

    if (existingItem) {
      existingItem.quantity += Number(quantity || 1);
    } else {
      cart.items.push({
        menuItemId: menuItem._id,
        quantity: Number(quantity || 1),
      });
    }

    cart.totalPrice = await calculateCartTotal(cart.items);

    await cart.save();

    res.status(201).json({
      success: true,
      message: "Item added to cart",
      cart,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Get Cart
// ==============================
const getCart = async (req, res) => {
  try {
    const userId = await getCartUserId(req);

    const cart = await Cart.findOne({
      userId,
    }).populate("items.menuItemId");

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart is empty",
      });
    }

    res.status(200).json({
      success: true,
      cart,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ==============================
// Update Quantity
// ==============================
const updateCartItem = async (req, res) => {

  try {

    const { quantity } = req.body;
    const userId = await getCartUserId(req);

    const cart = await Cart.findOne({
      userId,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.find(
      (item) =>
        item.menuItemId.toString() === req.params.menuItemId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    item.quantity = quantity;

    cart.totalPrice = await calculateCartTotal(cart.items);

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart updated",
      cart,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

// ==============================
// Remove Item
// ==============================
const removeCartItem = async (req, res) => {

  try {
    const userId = await getCartUserId(req);

    const cart = await Cart.findOne({
      userId,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter(
      (item) =>
        item.menuItemId.toString() !== req.params.menuItemId
    );

    cart.totalPrice = await calculateCartTotal(cart.items);

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item removed successfully",
      cart,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

// ==============================
// Clear Cart
// ==============================
const clearCart = async (req, res) => {

  try {
    const userId = await getCartUserId(req);

    const cart = await Cart.findOne({
      userId,
    });

    if (!cart) {

      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });

    }

    cart.items = [];
    cart.totalPrice = 0;

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
