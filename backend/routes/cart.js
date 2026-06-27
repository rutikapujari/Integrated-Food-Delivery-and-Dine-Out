const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cart_controller");

router.use(auth);

// Add item to cart
router.post("/add", addToCart);

// Get cart
router.get("/", getCart);

// Update quantity
router.put("/update/:menuItemId", updateCartItem);

// Remove item from cart
router.delete("/remove/:menuItemId", removeCartItem);

// Clear entire cart
router.delete("/clear", clearCart);

module.exports = router;
