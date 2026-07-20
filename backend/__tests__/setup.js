const crypto = require("crypto");

process.env.JWT_SECRET = "test-secret-key-for-testing";
process.env.JWT_EXPIRES_IN = "1h";
process.env.PORT = "0";
process.env.NODE_ENV = "test";

const mockDocuments = new Map();

const createMockQuery = (resolveWith) => {
  const query = {
    _resolveWith: resolveWith,
    select: jest.fn(function () { return query; }),
    sort: jest.fn(function () { return query; }),
    skip: jest.fn(function () { return query; }),
    limit: jest.fn(function () { return query; }),
    populate: jest.fn(function () { return query; }),
    lean: jest.fn(() => query),
    then: jest.fn(function (resolve, reject) {
      if (resolve) resolve(resolveWith !== undefined ? resolveWith : null);
    }),
  };
  return query;
};

const createMockModel = (name) => {
  const Model = jest.fn(function (data) {
    this._id = data._id || crypto.randomBytes(12).toString("hex");
    this.save = jest.fn().mockResolvedValue(this);
    Object.assign(this, data);
  });

  Model.modelName = name;

  Model.find = jest.fn(() => createMockQuery());
  Model.findOne = jest.fn(() => createMockQuery());
  Model.findById = jest.fn(() => createMockQuery());
  Model.findByIdAndUpdate = jest.fn(() => createMockQuery());
  Model.findByIdAndDelete = jest.fn(() => createMockQuery());
  Model.findOneAndUpdate = jest.fn(() => createMockQuery());
  Model.countDocuments = jest.fn(() => Promise.resolve(0));
  Model.exists = jest.fn(() => Promise.resolve(null));
  Model.aggregate = jest.fn(() => Promise.resolve([]));
  Model.create = jest.fn(async function (data) {
    const doc = { _id: crypto.randomBytes(12).toString("hex"), ...data, save: jest.fn().mockResolvedValue(true) };
    return doc;
  });

  return Model;
};

const mockModels = {
  User: createMockModel("User"),
  Restaurant: createMockModel("Restaurant"),
  MenuItem: createMockModel("MenuItem"),
  Order: createMockModel("Order"),
  Cart: createMockModel("Cart"),
  Payment: createMockModel("Payment"),
  Reservation: createMockModel("Reservation"),
  Review: createMockModel("Review"),
  Notification: createMockModel("Notification"),
  SupportTicket: createMockModel("SupportTicket"),
  Event: createMockModel("Event"),
};

jest.mock("../models/User", () => mockModels.User);
jest.mock("../models/Restaurant", () => mockModels.Restaurant);
jest.mock("../models/MenuItem", () => mockModels.MenuItem);
jest.mock("../models/Order", () => mockModels.Order);
jest.mock("../models/Cart", () => mockModels.Cart);
jest.mock("../models/Payment", () => mockModels.Payment);
jest.mock("../models/Reservation", () => mockModels.Reservation);
jest.mock("../models/Review", () => mockModels.Review);
jest.mock("../models/Notification", () => mockModels.Notification);
jest.mock("../models/SupportTicket", () => mockModels.SupportTicket);
jest.mock("../models/Event", () => mockModels.Event);

jest.mock("../config/db", () => jest.fn(() => Promise.resolve()));
jest.mock("../sockets/socket", () => ({
  emitOrderUpdate: jest.fn(),
  initializeSocket: jest.fn(),
}));
jest.mock("../services/notificationService", () => ({
  sendNotificationEmail: jest.fn(() => Promise.resolve()),
}));
jest.mock("../services/emailService", () => jest.fn(() => Promise.resolve()));

const express = require("express");

const createTestApp = (router) => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(router);
  return app;
};

const generateToken = (user) => {
  const jwt = require("jsonwebtoken");
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

const mockUser = (overrides = {}) => ({
  _id: crypto.randomBytes(12).toString("hex"),
  name: "Test User",
  email: "test@example.com",
  role: "customer",
  isVerified: true,
  isActive: true,
  ...overrides,
});

const mockFindByIdResult = (model, value) => {
  model.findById.mockImplementation(() => createMockQuery(value));
};

const mockFindOneResult = (model, value) => {
  model.findOne.mockImplementation(() => createMockQuery(value));
};

const mockFindResult = (model, value) => {
  model.find.mockImplementation(() => createMockQuery(value));
};

const mockFindByIdAndUpdateResult = (model, value) => {
  model.findByIdAndUpdate.mockImplementation(() => createMockQuery(value));
};

const mockFindByIdAndDeleteResult = (model, value) => {
  model.findByIdAndDelete.mockImplementation(() => createMockQuery(value));
};

const mockFindOneAndUpdateResult = (model, value) => {
  model.findOneAndUpdate.mockImplementation(() => createMockQuery(value));
};

module.exports = {
  mockModels,
  createTestApp,
  generateToken,
  mockUser,
  mockDocuments,
  createMockQuery,
  mockFindByIdResult,
  mockFindOneResult,
  mockFindResult,
  mockFindByIdAndUpdateResult,
  mockFindByIdAndDeleteResult,
  mockFindOneAndUpdateResult,
};
