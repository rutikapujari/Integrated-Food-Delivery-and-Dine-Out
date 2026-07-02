const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const authorize = require("../middleware/role");

const {
  createTicket,
  getTickets,
  getTicketById,
  addTicketReply,
  updateTicketStatus,
} = require("../controllers/supportController");

router.post("/tickets", auth, createTicket);
router.get("/tickets", auth, getTickets);
router.get("/tickets/:id", auth, getTicketById);
router.post("/tickets/:id/replies", auth, addTicketReply);
router.put(
  "/tickets/:id/status",
  auth,
  authorize("admin"),
  updateTicketStatus
);

module.exports = router;
