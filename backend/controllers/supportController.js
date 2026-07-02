const mongoose = require("mongoose");
const SupportTicket = require("../models/SupportTicket");

const normalizeTicketPayload = (body) => ({
  orderId: body.orderId || body.order || body.order_id || null,
  category: body.category || body.type || "other",
  subject: body.subject || body.title,
  description: body.description || body.message || body.issue,
  priority: body.priority || "medium",
});

const canAccessTicket = (user, ticket) => {
  if (user?.role === "admin") return true;

  return ticket.userId?._id
    ? ticket.userId._id.toString() === user?._id?.toString()
    : ticket.userId?.toString() === user?._id?.toString();
};

const sendError = (res, error) => {
  const statusCode = error.name === "ValidationError" ? 400 : 500;

  return res.status(statusCode).json({
    success: false,
    message: error.message,
  });
};

const createTicket = async (req, res) => {
  try {
    const { orderId, category, subject, description, priority } =
      normalizeTicketPayload(req.body);

    if (!subject || !description) {
      return res.status(400).json({
        success: false,
        message: "Subject and description are required",
      });
    }

    if (orderId && !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Valid orderId is required",
      });
    }

    const ticket = await SupportTicket.create({
      userId: req.user._id,
      orderId,
      category,
      subject,
      description,
      priority,
      messages: [
        {
          senderId: req.user._id,
          message: description,
          isStaffReply: false,
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Support ticket created successfully",
      ticket,
    });
  } catch (error) {
    sendError(res, error);
  }
};

const getTickets = async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { userId: req.user._id };

    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;

    const tickets = await SupportTicket.find(filter)
      .populate("userId", "name email")
      .populate("orderId", "totalAmount status createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    sendError(res, error);
  }
};

const getTicketById = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate("userId", "name email")
      .populate("orderId", "totalAmount status createdAt")
      .populate("messages.senderId", "name role");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found",
      });
    }

    if (!canAccessTicket(req.user, ticket)) {
      return res.status(403).json({
        success: false,
        message: "You can view only your own support tickets",
      });
    }

    res.status(200).json({
      success: true,
      ticket,
    });
  } catch (error) {
    sendError(res, error);
  }
};

const addTicketReply = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Reply message is required",
      });
    }

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found",
      });
    }

    if (!canAccessTicket(req.user, ticket)) {
      return res.status(403).json({
        success: false,
        message: "You can reply only to your own support tickets",
      });
    }

    ticket.messages.push({
      senderId: req.user._id,
      message,
      isStaffReply: req.user.role === "admin",
    });

    if (ticket.status === "closed") {
      ticket.status = "open";
      ticket.resolvedAt = null;
    }

    await ticket.save();

    res.status(200).json({
      success: true,
      message: "Reply added successfully",
      ticket,
    });
  } catch (error) {
    sendError(res, error);
  }
};

const updateTicketStatus = async (req, res) => {
  try {
    const { status, priority } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found",
      });
    }

    if (status) {
      ticket.status = status;
      ticket.resolvedAt = ["resolved", "closed"].includes(status)
        ? new Date()
        : null;
    }

    if (priority) ticket.priority = priority;

    await ticket.save();

    res.status(200).json({
      success: true,
      message: "Support ticket updated successfully",
      ticket,
    });
  } catch (error) {
    sendError(res, error);
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  addTicketReply,
  updateTicketStatus,
};
