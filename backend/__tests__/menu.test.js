const request = require("supertest");
const { createTestApp, mockModels, mockUser, generateToken, mockFindByIdResult, mockFindOneResult, mockFindByIdAndUpdateResult, mockFindByIdAndDeleteResult } = require("./setup");
const express = require("express");

let app;

beforeAll(() => {
  const router = require("../routes/menuRoutes");
  app = express();
  app.use(express.json());
  app.use("/api/menu", router);
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Menu API", () => {
  const VALID_RESTAURANT_ID = "507f1f77bcf86cd799439011";
  const VALID_MENU_ID = "507f1f77bcf86cd799439012";

  describe("GET /api/menu", () => {
    it("should return all menu items", async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => resolve([
          { _id: "m1", name: "Margherita", price: 12.99, category: "Pizza" },
          { _id: "m2", name: "Cheeseburger", price: 8.99, category: "Burgers" },
        ])),
      };
      mockModels.MenuItem.find.mockReturnValue(mockQuery);
      mockModels.MenuItem.countDocuments.mockResolvedValue(2);

      const res = await request(app).get("/api/menu");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should filter menu items by restaurant", async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => resolve([
          { _id: "m1", name: "Margherita", restaurantId: "r1" },
        ])),
      };
      mockModels.MenuItem.find.mockReturnValue(mockQuery);
      mockModels.MenuItem.countDocuments.mockResolvedValue(1);

      const res = await request(app)
        .get("/api/menu")
        .query({ restaurantId: "r1" });

      expect(res.status).toBe(200);
    });

    it("should search menu items by name", async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => resolve([
          { _id: "m1", name: "Margherita" },
        ])),
      };
      mockModels.MenuItem.find.mockReturnValue(mockQuery);
      mockModels.MenuItem.countDocuments.mockResolvedValue(1);

      const res = await request(app)
        .get("/api/menu")
        .query({ search: "Margherita" });

      expect(res.status).toBe(200);
    });
  });

  describe("GET /api/menu/restaurant/:restaurantId", () => {
    it("should return menu items for a restaurant", async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => resolve([
          { _id: "m1", name: "Margherita", restaurantId: "r1" },
        ])),
      };
      mockModels.MenuItem.find.mockReturnValue(mockQuery);

      const res = await request(app).get("/api/menu/restaurant/r1");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /api/menu/:id", () => {
    it("should return single menu item", async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => resolve({
          _id: "m1",
          name: "Margherita",
          price: 12.99,
        })),
      };
      mockModels.MenuItem.findById.mockReturnValue(mockQuery);

      const res = await request(app).get("/api/menu/m1");

      expect(res.status).toBe(200);
    });

    it("should return 404 for non-existent item", async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => resolve(null)),
      };
      mockModels.MenuItem.findById.mockReturnValue(mockQuery);

      const res = await request(app).get("/api/menu/nonexistent");

      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/menu", () => {
    it("should create menu item as restaurant owner", async () => {
      const user = mockUser({ role: "restaurant" });
      const token = generateToken(user);

      mockFindByIdResult(mockModels.User, { _id: user._id, role: user.role, isActive: true });

      mockFindByIdResult(mockModels.Restaurant, {
        _id: VALID_RESTAURANT_ID,
        ownerId: { toString: () => user._id },
      });

      mockModels.MenuItem.create.mockResolvedValue({
        _id: VALID_MENU_ID,
        name: "New Pizza",
        price: 10.99,
        restaurantId: VALID_RESTAURANT_ID,
      });

      const res = await request(app)
        .post("/api/menu")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "New Pizza",
          price: 10.99,
          category: "Pizza",
          restaurantId: VALID_RESTAURANT_ID,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("should reject creation without auth", async () => {
      const res = await request(app)
        .post("/api/menu")
        .send({ name: "Pizza", price: 10 });

      expect(res.status).toBe(401);
    });
  });

  describe("PUT /api/menu/:id", () => {
    it("should update menu item as owner", async () => {
      const user = mockUser({ role: "restaurant" });
      const token = generateToken(user);

      mockFindByIdResult(mockModels.User, { _id: user._id, role: user.role, isActive: true });

      mockFindByIdResult(mockModels.MenuItem, {
        _id: VALID_MENU_ID,
        restaurantId: VALID_RESTAURANT_ID,
      });

      mockFindByIdResult(mockModels.Restaurant, {
        _id: VALID_RESTAURANT_ID,
        ownerId: { toString: () => user._id },
      });

      mockModels.MenuItem.findByIdAndUpdate.mockResolvedValue({
        _id: VALID_MENU_ID,
        name: "Updated Pizza",
      });

      const res = await request(app)
        .put(`/api/menu/${VALID_MENU_ID}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Updated Pizza" });

      expect(res.status).toBe(200);
    });
  });

  describe("DELETE /api/menu/:id", () => {
    it("should delete menu item as owner", async () => {
      const user = mockUser({ role: "restaurant" });
      const token = generateToken(user);

      mockFindByIdResult(mockModels.User, { _id: user._id, role: user.role, isActive: true });

      mockFindByIdResult(mockModels.MenuItem, {
        _id: VALID_MENU_ID,
        restaurantId: VALID_RESTAURANT_ID,
      });

      mockFindByIdResult(mockModels.Restaurant, {
        _id: VALID_RESTAURANT_ID,
        ownerId: { toString: () => user._id },
      });

      mockFindByIdAndDeleteResult(mockModels.MenuItem, { _id: VALID_MENU_ID });

      const res = await request(app)
        .delete(`/api/menu/${VALID_MENU_ID}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should reject deletion by non-owner", async () => {
      const user = mockUser({ role: "restaurant" });
      const token = generateToken(user);

      mockFindByIdResult(mockModels.User, { _id: user._id, role: user.role, isActive: true });

      mockFindByIdResult(mockModels.MenuItem, {
        _id: VALID_MENU_ID,
        restaurantId: VALID_RESTAURANT_ID,
      });

      mockFindByIdResult(mockModels.Restaurant, {
        _id: VALID_RESTAURANT_ID,
        ownerId: { toString: () => "different-owner" },
      });

      const res = await request(app)
        .delete(`/api/menu/${VALID_MENU_ID}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
    });
  });
});
