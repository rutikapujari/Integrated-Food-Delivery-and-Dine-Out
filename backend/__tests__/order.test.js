const request = require("supertest");
const { createTestApp, mockModels, mockUser, generateToken, mockFindByIdResult, mockFindOneResult } = require("./setup");
const express = require("express");

const VALID_ID = "507f1f77bcf86cd799439011";
const VALID_ID_2 = "507f1f77bcf86cd799439012";
const VALID_ID_3 = "507f1f77bcf86cd799439013";

let app;

beforeAll(() => {
  const router = require("../routes/orderRoutes");
  app = express();
  app.use(express.json());
  app.use("/api/orders", router);
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Order API", () => {
  describe("POST /api/orders", () => {
    it("should create order from cart", async () => {
      const user = mockUser({ role: "customer" });
      const token = generateToken(user);

      mockFindByIdResult(mockModels.User, { _id: user._id, role: user.role, isActive: true });

      mockFindOneResult(mockModels.Cart, {
        _id: VALID_ID,
        userId: user._id,
        restaurantId: VALID_ID_2,
        items: [{ menuItemId: { _id: VALID_ID_3, price: 10 }, quantity: 2 }],
        subtotal: 20,
        totalPrice: 25,
        save: jest.fn().mockResolvedValue(true),
      });

      mockModels.Restaurant.findById.mockResolvedValue({
        _id: VALID_ID_2,
        minimumOrderAmount: 0,
      });

      mockModels.Order.create.mockResolvedValue({
        _id: VALID_ID,
        userId: user._id,
        restaurantId: VALID_ID_2,
        totalAmount: 25,
        status: "pending",
      });

      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${token}`)
        .send({
          deliveryAddress: "123 Test St",
          paymentMethod: "cod",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("should reject order without auth", async () => {
      const res = await request(app)
        .post("/api/orders")
        .send({ deliveryAddress: "123 Test St" });

      expect(res.status).toBe(401);
    });

    it("should reject order with empty cart", async () => {
      const user = mockUser({ role: "customer" });
      const token = generateToken(user);

      mockFindByIdResult(mockModels.User, { _id: user._id, role: user.role, isActive: true });
      mockFindOneResult(mockModels.Cart, null);
      mockModels.MenuItem.findById.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/orders", () => {
    it("should return user's orders", async () => {
      const user = mockUser({ role: "customer" });
      const token = generateToken(user);

      mockFindByIdResult(mockModels.User, { _id: user._id, role: user.role, isActive: true });

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => resolve([
          { _id: VALID_ID, userId: user._id, status: "delivered" },
        ])),
      };
      mockModels.Order.find.mockReturnValue(mockQuery);

      const res = await request(app)
        .get("/api/orders")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return all orders for admin", async () => {
      const user = mockUser({ role: "admin" });
      const token = generateToken(user);

      mockFindByIdResult(mockModels.User, { _id: user._id, role: user.role, isActive: true });

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => resolve([
          { _id: VALID_ID, status: "pending" },
          { _id: VALID_ID_2, status: "delivered" },
        ])),
      };
      mockModels.Order.find.mockReturnValue(mockQuery);

      const res = await request(app)
        .get("/api/orders")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /api/orders/available", () => {
    it("should return available orders for courier", async () => {
      const user = mockUser({ role: "courier" });
      const token = generateToken(user);

      mockFindByIdResult(mockModels.User, { _id: user._id, role: user.role, isActive: true });

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => resolve([
          { _id: VALID_ID, status: "confirmed", courierId: null },
        ])),
      };
      mockModels.Order.find.mockReturnValue(mockQuery);

      const res = await request(app)
        .get("/api/orders/available")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should reject available orders for non-courier", async () => {
      const user = mockUser({ role: "customer" });
      const token = generateToken(user);

      mockFindByIdResult(mockModels.User, { _id: user._id, role: user.role, isActive: true });

      const res = await request(app)
        .get("/api/orders/available")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
    });
  });

  describe("PUT /api/orders/:id/status", () => {
    it("should update order status", async () => {
      const user = mockUser({ role: "restaurant" });
      const token = generateToken(user);

      mockFindByIdResult(mockModels.User, { _id: user._id, role: user.role, isActive: true });

      const mockOrder = {
        _id: VALID_ID,
        status: "pending",
        userId: { toString: () => VALID_ID_3 },
        restaurantId: VALID_ID_2,
        courierId: null,
        save: jest.fn().mockResolvedValue(true),
        statusHistory: [],
      };
      mockFindByIdResult(mockModels.Order, mockOrder);

      const mockQuery = {
        then: jest.fn((resolve) => resolve({
          _id: VALID_ID_2,
          ownerId: { toString: () => user._id },
        })),
      };
      mockModels.Restaurant.findOne.mockReturnValue(mockQuery);

      const res = await request(app)
        .put(`/api/orders/${VALID_ID}/status`)
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "confirmed" });

      expect(res.status).toBe(200);
      expect(mockOrder.status).toBe("confirmed");
    });

    it("should reject invalid status", async () => {
      const user = mockUser({ role: "admin" });
      const token = generateToken(user);

      mockFindByIdResult(mockModels.User, { _id: user._id, role: user.role, isActive: true });

      const mockOrder = {
        _id: VALID_ID,
        status: "pending",
        save: jest.fn(),
        statusHistory: [],
      };
      mockFindByIdResult(mockModels.Order, mockOrder);

      const res = await request(app)
        .put(`/api/orders/${VALID_ID}/status`)
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "invalid_status" });

      expect(res.status).toBe(400);
    });
  });

  describe("PUT /api/orders/:id/cancel", () => {
    it("should cancel an order", async () => {
      const user = mockUser({ role: "customer" });
      const token = generateToken(user);

      mockFindByIdResult(mockModels.User, { _id: user._id, role: user.role, isActive: true });

      const mockOrder = {
        _id: VALID_ID,
        status: "pending",
        userId: { toString: () => user._id },
        restaurantId: VALID_ID_2,
        courierId: null,
        save: jest.fn().mockResolvedValue(true),
        statusHistory: [],
        cancellationReason: null,
      };
      mockFindByIdResult(mockModels.Order, mockOrder);

      const res = await request(app)
        .put(`/api/orders/${VALID_ID}/cancel`)
        .set("Authorization", `Bearer ${token}`)
        .send({ reason: "Changed my mind" });

      expect(res.status).toBe(200);
      expect(mockOrder.status).toBe("cancelled");
      expect(mockOrder.cancellationReason).toBe("Changed my mind");
    });

    it("should not cancel a delivered order", async () => {
      const user = mockUser({ role: "customer" });
      const token = generateToken(user);

      mockFindByIdResult(mockModels.User, { _id: user._id, role: user.role, isActive: true });

      const mockOrder = {
        _id: VALID_ID,
        status: "delivered",
        userId: { toString: () => user._id },
        restaurantId: VALID_ID_2,
        courierId: null,
        statusHistory: [],
      };
      mockFindByIdResult(mockModels.Order, mockOrder);

      const res = await request(app)
        .put(`/api/orders/${VALID_ID}/cancel`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/delivered/i);
    });
  });

  describe("PUT /api/orders/:id/assign", () => {
    it("should allow courier to claim delivery", async () => {
      const user = mockUser({ role: "courier" });
      const token = generateToken(user);

      mockFindByIdResult(mockModels.User, { _id: user._id, role: user.role, isActive: true });

      const mockOrder = {
        _id: VALID_ID,
        status: "confirmed",
        courierId: null,
        save: jest.fn().mockResolvedValue(true),
        statusHistory: [],
      };
      mockFindByIdResult(mockModels.Order, mockOrder);

      const res = await request(app)
        .put(`/api/orders/${VALID_ID}/assign`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should reject claim if already assigned", async () => {
      const user = mockUser({ role: "courier" });
      const token = generateToken(user);

      mockFindByIdResult(mockModels.User, { _id: user._id, role: user.role, isActive: true });

      const mockOrder = {
        _id: VALID_ID,
        status: "confirmed",
        courierId: "other-courier",
      };
      mockFindByIdResult(mockModels.Order, mockOrder);

      const res = await request(app)
        .put(`/api/orders/${VALID_ID}/assign`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already assigned/i);
    });
  });
});
