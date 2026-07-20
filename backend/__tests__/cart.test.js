const request = require("supertest");
const { createTestApp, mockModels, mockUser, generateToken, mockFindByIdResult, mockFindOneResult, mockFindResult } = require("./setup");
const express = require("express");

const VALID_ID = "507f1f77bcf86cd799439011";
const VALID_ID_2 = "507f1f77bcf86cd799439012";
const VALID_ID_3 = "507f1f77bcf86cd799439013";

let app;

beforeAll(() => {
  const router = require("../routes/cart");
  app = express();
  app.use(express.json());
  app.use("/api/cart", router);
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Cart API", () => {
  describe("GET /api/cart", () => {
    it("should return user's cart", async () => {
      const user = mockUser();
      const token = generateToken(user);

      mockFindByIdResult(mockModels.User, { _id: user._id, role: user.role, isActive: true });

      const mockCart = {
        _id: VALID_ID,
        userId: user._id,
        restaurantId: VALID_ID_2,
        items: [],
        totalPrice: 0,
        itemCount: 0,
        subtotal: 0,
        deliveryFee: 0,
        taxAmount: 0,
        discountAmount: 0,
      };
      mockFindOneResult(mockModels.Cart, mockCart);

      const mockPopulatedCart = {
        ...mockCart,
        restaurantId: { _id: VALID_ID_2, name: "Pizza Place" },
        items: [],
      };

      const populateQuery = {
        populate: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => resolve(mockPopulatedCart)),
      };
      mockModels.Cart.findById.mockReturnValue(populateQuery);

      const res = await request(app)
        .get("/api/cart")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 404 when cart is empty", async () => {
      const user = mockUser();
      const token = generateToken(user);

      mockFindByIdResult(mockModels.User, { _id: user._id, role: user.role, isActive: true });
      mockFindOneResult(mockModels.Cart, null);

      const populateQuery = {
        populate: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => resolve(null)),
      };
      mockModels.Cart.findById.mockReturnValue(populateQuery);

      const res = await request(app)
        .get("/api/cart")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it("should reject without auth", async () => {
      const res = await request(app).get("/api/cart");

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/cart/add", () => {
    it("should add item to cart", async () => {
      const user = mockUser();
      const token = generateToken(user);

      mockFindByIdResult(mockModels.User, { _id: user._id, role: user.role, isActive: true });

      const mockMenuItem = {
        _id: VALID_ID_3,
        name: "Margherita",
        price: 12.99,
        restaurantId: VALID_ID_2,
        isAvailable: true,
      };
      mockFindByIdResult(mockModels.MenuItem, mockMenuItem);

      const mockCart = {
        _id: VALID_ID,
        userId: user._id,
        restaurantId: VALID_ID_2,
        items: [],
        itemCount: 0,
        subtotal: 0,
        deliveryFee: 0,
        taxAmount: 0,
        discountAmount: 0,
        totalPrice: 0,
        save: jest.fn().mockResolvedValue(true),
        restaurantId: {
          toString: () => VALID_ID_2,
        },
      };

      mockFindOneResult(mockModels.Cart, mockCart);

      mockFindResult(mockModels.MenuItem, []);

      mockFindByIdResult(mockModels.Restaurant, {
        _id: VALID_ID_2,
        deliveryFee: 0,
        minimumOrderAmount: 0,
        status: "approved",
        isOpen: true,
      });

      const populateQuery = {
        populate: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => resolve(mockCart)),
      };
      mockModels.Cart.findById.mockReturnValue(populateQuery);

      const res = await request(app)
        .post("/api/cart/add")
        .set("Authorization", `Bearer ${token}`)
        .send({
          menuItemId: VALID_ID_3,
          quantity: 2,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("should reject adding unavailable item", async () => {
      const user = mockUser();
      const token = generateToken(user);

      mockFindByIdResult(mockModels.User, { _id: user._id, role: user.role, isActive: true });

      mockFindByIdResult(mockModels.MenuItem, {
        _id: VALID_ID_3,
        isAvailable: false,
      });

      const res = await request(app)
        .post("/api/cart/add")
        .set("Authorization", `Bearer ${token}`)
        .send({ menuItemId: VALID_ID_3, quantity: 1 });

      expect(res.status).toBe(400);
    });
  });

  describe("PUT /api/cart/update/:menuItemId", () => {
    it("should update item quantity", async () => {
      const user = mockUser();
      const token = generateToken(user);

      mockFindByIdResult(mockModels.User, { _id: user._id, role: user.role, isActive: true });

      const mockCart = {
        _id: VALID_ID,
        userId: user._id,
        restaurantId: VALID_ID_2,
        items: [
          { menuItemId: VALID_ID_3, quantity: 2, price: 10 },
        ],
        itemCount: 2,
        subtotal: 20,
        deliveryFee: 0,
        taxAmount: 0,
        discountAmount: 0,
        totalPrice: 20,
        save: jest.fn().mockResolvedValue(true),
      };
      mockFindOneResult(mockModels.Cart, mockCart);

      mockFindResult(mockModels.MenuItem, [
        { _id: VALID_ID_3, price: 10 },
      ]);

      mockFindByIdResult(mockModels.Restaurant, {
        _id: VALID_ID_2,
        deliveryFee: 0,
        minimumOrderAmount: 0,
        status: "approved",
        isOpen: true,
      });

      const populateQuery = {
        populate: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => resolve(mockCart)),
      };
      mockModels.Cart.findById.mockReturnValue(populateQuery);

      const res = await request(app)
        .put(`/api/cart/update/${VALID_ID_3}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ quantity: 5 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("DELETE /api/cart/remove/:menuItemId", () => {
    it("should remove item from cart", async () => {
      const user = mockUser();
      const token = generateToken(user);

      mockFindByIdResult(mockModels.User, { _id: user._id, role: user.role, isActive: true });

      const mockCart = {
        _id: VALID_ID,
        userId: user._id,
        restaurantId: VALID_ID_2,
        items: [
          { menuItemId: VALID_ID_3, quantity: 2 },
          { menuItemId: VALID_ID_2, quantity: 1 },
        ],
        itemCount: 3,
        subtotal: 30,
        deliveryFee: 0,
        taxAmount: 0,
        discountAmount: 0,
        totalPrice: 30,
        save: jest.fn().mockResolvedValue(true),
      };
      mockFindOneResult(mockModels.Cart, mockCart);

      mockFindResult(mockModels.MenuItem, [
        { _id: VALID_ID_2, price: 10 },
      ]);

      mockFindByIdResult(mockModels.Restaurant, {
        _id: VALID_ID_2,
        deliveryFee: 0,
        minimumOrderAmount: 0,
        status: "approved",
        isOpen: true,
      });

      const populateQuery = {
        populate: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => resolve(mockCart)),
      };
      mockModels.Cart.findById.mockReturnValue(populateQuery);

      const res = await request(app)
        .delete(`/api/cart/remove/${VALID_ID_3}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("DELETE /api/cart/clear", () => {
    it("should clear entire cart", async () => {
      const user = mockUser();
      const token = generateToken(user);

      mockFindByIdResult(mockModels.User, { _id: user._id, role: user.role, isActive: true });

      const mockCart = {
        _id: VALID_ID,
        userId: user._id,
        items: [{ menuItemId: VALID_ID_3 }],
        save: jest.fn().mockResolvedValue(true),
      };
      mockFindOneResult(mockModels.Cart, mockCart);

      const res = await request(app)
        .delete("/api/cart/clear")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("POST /api/cart (sync)", () => {
    it("should sync entire cart", async () => {
      const user = mockUser();
      const token = generateToken(user);

      mockFindByIdResult(mockModels.User, { _id: user._id, role: user.role, isActive: true });

      const mockMenuItem = {
        _id: VALID_ID_3,
        price: 10,
        restaurantId: VALID_ID_2,
        isAvailable: true,
      };
      mockFindResult(mockModels.MenuItem, [mockMenuItem]);

      const mockCart = {
        _id: VALID_ID,
        userId: user._id,
        restaurantId: VALID_ID_2,
        items: [{ menuItemId: VALID_ID_3, quantity: 2 }],
        itemCount: 2,
        subtotal: 20,
        deliveryFee: 0,
        taxAmount: 0,
        discountAmount: 0,
        totalPrice: 20,
        save: jest.fn().mockResolvedValue(true),
      };

      mockFindOneResult(mockModels.Cart, mockCart);

      mockFindByIdResult(mockModels.Restaurant, {
        _id: VALID_ID_2,
        deliveryFee: 0,
        minimumOrderAmount: 0,
        status: "approved",
        isOpen: true,
      });

      const populateQuery = {
        populate: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => resolve(mockCart)),
      };
      mockModels.Cart.findById.mockReturnValue(populateQuery);

      const res = await request(app)
        .post("/api/cart")
        .set("Authorization", `Bearer ${token}`)
        .send({
          restaurantId: VALID_ID_2,
          items: [
            { menuItemId: VALID_ID_3, quantity: 2 },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
