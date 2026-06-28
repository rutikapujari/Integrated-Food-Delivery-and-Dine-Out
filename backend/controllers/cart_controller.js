const Cart = require("../models/Cart");
const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");
const mongoose = require("mongoose");
const { emitCartUpdate } = require("../sockets/socket");

const TAX_RATE = Number(process.env.CART_TAX_RATE || 0);

const getCartUserId = async (req) => req.user?._id || req.user?.id || null;

const normalizeQuantity = (quantity, fallback = 1) => {
  const parsed = Number(quantity ?? fallback);
  return Number.isFinite(parsed) ? Math.max(Math.floor(parsed), 1) : fallback;
};

const safeEmitCartUpdate = (userId, cart) => {
  try {
    emitCartUpdate(userId, cart);
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("Cart socket emit skipped:", error.message);
    }
  }
};

const getMenuItemForCart = async (menuItemId) => {
  if (!menuItemId || !mongoose.Types.ObjectId.isValid(menuItemId)) return null;

  return MenuItem.findById(menuItemId);
};

const populateCart = (query) =>
  query.populate("restaurantId", "name deliveryFee minimumOrderAmount isOpen status")
    .populate("items.menuItemId", "name price image isAvailable restaurantId");

const calculateCartSummary = async (cart) => {
  const menuItemIds = cart.items.map((item) => item.menuItemId);
  const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } });
  const menuMap = new Map(menuItems.map((item) => [item._id.toString(), item]));
  const restaurant = await Restaurant.findById(cart.restaurantId);

  let subtotal = 0;
  let itemCount = 0;

  cart.items = cart.items.filter((item) => {
    const menuItem = menuMap.get(item.menuItemId.toString());
    if (!menuItem) return false;

    item.quantity = normalizeQuantity(item.quantity);
    subtotal += menuItem.price * item.quantity;
    itemCount += item.quantity;
    return true;
  });

  cart.itemCount = itemCount;
  cart.subtotal = subtotal;
  cart.deliveryFee = restaurant?.deliveryFee || 0;
  cart.taxAmount = Number((subtotal * TAX_RATE).toFixed(2));
  cart.discountAmount = Math.min(cart.discountAmount || 0, subtotal);
  cart.totalPrice = Number(
    (subtotal + cart.deliveryFee + cart.taxAmount - cart.discountAmount).toFixed(2)
  );

  return cart;
};

const validateRestaurantRules = async (cart) => {
  const restaurant = await Restaurant.findById(cart.restaurantId);

  if (!restaurant) {
    return "Restaurant not found";
  }

  if (restaurant.status && restaurant.status !== "approved") {
    return "Restaurant is not accepting orders right now";
  }

  if (restaurant.isOpen === false) {
    return "Restaurant is currently closed";
  }

  return null;
};

const findUserCart = async (userId) => Cart.findOne({ userId });

// ==============================
// Add Item To Cart
// ==============================
const addToCart = async (req, res) => {
  try {
    const { menuItemId, quantity, replaceCart } = req.body;
    const userId = await getCartUserId(req);
    const menuItem = await getMenuItemForCart(menuItemId);

    if (!userId || !menuItem) {
      return res.status(400).json({
        success: false,
        message: "Valid menuItemId is required",
      });
    }

    if (menuItem.isAvailable === false) {
      return res.status(400).json({
        success: false,
        message: "Menu item is not available",
      });
    }

    let cart = await findUserCart(userId);

    if (!cart) {
      cart = new Cart({
        userId,
        restaurantId: menuItem.restaurantId,
        items: [],
      });
    }

    if (cart.restaurantId.toString() !== menuItem.restaurantId.toString()) {
      if (!replaceCart) {
        return res.status(409).json({
          success: false,
          message: "Cart already has items from another restaurant",
          action: "Send replaceCart=true to start a new cart",
        });
      }

      cart.restaurantId = menuItem.restaurantId;
      cart.items = [];
      cart.discountAmount = 0;
    }

    const requestedQuantity = normalizeQuantity(quantity);
    const existingItem = cart.items.find(
      (item) => item.menuItemId.toString() === menuItem._id.toString()
    );

    if (existingItem) {
      existingItem.quantity += requestedQuantity;
    } else {
      cart.items.push({
        menuItemId: menuItem._id,
        quantity: requestedQuantity,
      });
    }

    await calculateCartSummary(cart);
    const ruleError = await validateRestaurantRules(cart);

    if (ruleError) {
      return res.status(400).json({
        success: false,
        message: ruleError,
      });
    }

    await cart.save();
    const populatedCart = await populateCart(Cart.findById(cart._id));
    safeEmitCartUpdate(userId, populatedCart);

    res.status(201).json({
      success: true,
      message: "Item added to cart",
      cart: populatedCart,
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
    const cart = await populateCart(Cart.findOne({ userId }));

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
    const cart = await findUserCart(userId);

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.find(
      (cartItem) => cartItem.menuItemId.toString() === req.params.menuItemId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    item.quantity = normalizeQuantity(quantity);
    await calculateCartSummary(cart);
    await cart.save();

    const populatedCart = await populateCart(Cart.findById(cart._id));
    safeEmitCartUpdate(userId, populatedCart);

    res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: populatedCart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Bulk Update Cart Items
// ==============================
const syncCart = async (req, res) => {
  try {
    const userId = await getCartUserId(req);
    const incomingItems = Array.isArray(req.body.items) ? req.body.items : [];
    const mergedItems = new Map();

    for (const item of incomingItems) {
      if (!mongoose.Types.ObjectId.isValid(item.menuItemId)) continue;

      const key = item.menuItemId.toString();
      mergedItems.set(key, (mergedItems.get(key) || 0) + normalizeQuantity(item.quantity));
    }

    if (mergedItems.size === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one valid cart item is required",
      });
    }

    const menuItems = await MenuItem.find({
      _id: { $in: Array.from(mergedItems.keys()) },
      isAvailable: true,
    });

    const restaurantIds = new Set(menuItems.map((item) => item.restaurantId.toString()));

    if (menuItems.length !== mergedItems.size) {
      return res.status(400).json({
        success: false,
        message: "Cart contains unavailable or invalid menu items",
      });
    }

    if (restaurantIds.size !== 1) {
      return res.status(409).json({
        success: false,
        message: "Cart can contain items from only one restaurant",
      });
    }

    let cart = await findUserCart(userId);

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    cart.restaurantId = menuItems[0].restaurantId;
    cart.items = menuItems.map((item) => ({
      menuItemId: item._id,
      quantity: mergedItems.get(item._id.toString()),
    }));
    cart.discountAmount = 0;

    await calculateCartSummary(cart);
    const ruleError = await validateRestaurantRules(cart);

    if (ruleError) {
      return res.status(400).json({
        success: false,
        message: ruleError,
      });
    }

    await cart.save();
    const populatedCart = await populateCart(Cart.findById(cart._id));
    safeEmitCartUpdate(userId, populatedCart);

    res.status(200).json({
      success: true,
      message: "Cart synced",
      cart: populatedCart,
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
    const cart = await findUserCart(userId);

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.menuItemId.toString() !== req.params.menuItemId
    );

    await calculateCartSummary(cart);
    await cart.save();

    const populatedCart = await populateCart(Cart.findById(cart._id));
    safeEmitCartUpdate(userId, populatedCart);

    res.status(200).json({
      success: true,
      message: "Item removed successfully",
      cart: populatedCart,
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
    const cart = await findUserCart(userId);

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = [];
    cart.itemCount = 0;
    cart.subtotal = 0;
    cart.deliveryFee = 0;
    cart.taxAmount = 0;
    cart.discountAmount = 0;
    cart.totalPrice = 0;

    await cart.save();
    safeEmitCartUpdate(userId, cart);

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart,
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
  syncCart,
  removeCartItem,
  clearCart,
};
