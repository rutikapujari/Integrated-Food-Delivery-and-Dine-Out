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
  deleteCartByIdOrItem,
} = require("../controllers/cart_controller");

router.use(auth);

const normalizeCartItems = (req, res, next) => {
  if (Array.isArray(req.body.items)) {
    req.body.items = req.body.items.map((item) => ({
      ...item,
      menuItemId:
        item.menuItemId ||
        item.menuItem ||
        item.menu_item_id ||
        item.id ||
        item._id,
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

// Compatibility route for clients that update cart by URL id
router.put("/:id", normalizeCartItems, syncCart);

// Remove item from cart
router.delete("/remove/:menuItemId", removeCartItem);

// Clear entire cart
router.delete("/clear", clearCart);

// Compatibility route: deletes the cart if id is cart id, otherwise removes item id
router.delete("/:id", deleteCartByIdOrItem);

module.exports = router;
