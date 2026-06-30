const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
  addToCart,
  getCart,
  updateCartItem,
  syncCart,
  removeCartItem,
  clearCart,
} = require("../controllers/cart_controller");

router.use(auth);

const normalizeCartItems = (req, res, next) => {
  if (Array.isArray(req.body.items)) {
    req.body.items = req.body.items.map((item) => ({
      ...item,
      menuItemId: item.menuItemId || item.menuItem,
    }));
  }

  next();
};

// Create/replace cart from a full cart payload
router.post("/", normalizeCartItems, syncCart);

// Add item to cart
router.post("/add", addToCart);

// Get cart
router.get("/", getCart);

// Update quantity
router.put("/update/:menuItemId", updateCartItem);

// Bulk sync cart items
router.put("/sync", normalizeCartItems, syncCart);

// Remove item from cart
router.delete("/remove/:menuItemId", removeCartItem);

// Clear entire cart
router.delete("/clear", clearCart);

module.exports = router;
