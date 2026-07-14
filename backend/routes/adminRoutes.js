const express = require("express");
const auth = require("../middleware/auth");
const authorize = require("../middleware/role");
const {
  getUsers,
  getOrders,
  getRevenue,
  getRestaurants,
  getAnalytics,
  updateUserRole,
} = require("../controllers/adminController");

const router = express.Router();

router.use(auth, authorize("admin"));

router.get("/users", getUsers);
router.put("/users/:id/role", updateUserRole);
router.get("/orders", getOrders);
router.get("/revenue", getRevenue);
router.get("/restaurants", getRestaurants);
router.get("/analytics", getAnalytics);

module.exports = router;
