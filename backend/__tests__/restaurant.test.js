const request = require("supertest");
const { createTestApp, mockModels, mockUser, generateToken, mockFindByIdResult, mockFindByIdAndUpdateResult, mockFindByIdAndDeleteResult } = require("./setup");
const express = require("express");

let app;

beforeAll(() => {
  const router = require("../routes/restaurantRoutes");
  app = express();
  app.use(express.json());
  app.use("/api/restaurants", router);
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Restaurant API", () => {
  describe("GET /api/restaurants", () => {
    it("should return list of restaurants", async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        then: jest.fn((resolve) => resolve([
          { _id: "r1", name: "Pizza Place", status: "approved" },
          { _id: "r2", name: "Burger Joint", status: "approved" },
        ])),
      };
      mockModels.Restaurant.find.mockReturnValue(mockQuery);
      mockModels.Restaurant.countDocuments.mockResolvedValue(2);

      const res = await request(app).get("/api/restaurants");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /api/restaurants/:id", () => {
    it("should return restaurant by ID", async () => {
      mockFindByIdResult(mockModels.Restaurant, {
        _id: "r1",
        name: "Pizza Place",
        status: "approved",
      });

      const res = await request(app).get("/api/restaurants/r1");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 404 for non-existent restaurant", async () => {
      mockFindByIdResult(mockModels.Restaurant, null);

      const res = await request(app).get("/api/restaurants/nonexistent");

      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/restaurants", () => {
    it("should create restaurant with restaurant role", async () => {
      const user = mockUser({ role: "restaurant" });
      const token = generateToken(user);

      mockFindByIdResult(mockModels.User, { _id: user._id, role: user.role, isActive: true });

      mockModels.Restaurant.create.mockResolvedValue({
        _id: "r1",
        name: "New Place",
        ownerId: user._id,
      });

      const res = await request(app)
        .post("/api/restaurants")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "New Place",
          email: "place@example.com",
          phone: "1234567890",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("should reject creation without auth", async () => {
      const res = await request(app)
        .post("/api/restaurants")
        .send({ name: "New Place" });

      expect(res.status).toBe(401);
    });

    it("should reject creation with customer role", async () => {
      const user = mockUser({ role: "customer" });
      const token = generateToken(user);

      mockFindByIdResult(mockModels.User, { _id: user._id, role: user.role, isActive: true });

      const res = await request(app)
        .post("/api/restaurants")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "New Place" });

      expect(res.status).toBe(403);
    });
  });

  describe("PUT /api/restaurants/:id", () => {
    it("should update restaurant by owner", async () => {
      const user = mockUser({ role: "restaurant" });
      const token = generateToken(user);

      mockFindByIdResult(mockModels.User, { _id: user._id, role: user.role, isActive: true });

      mockFindByIdResult(mockModels.Restaurant, {
        _id: "r1",
        ownerId: { toString: () => user._id },
      });

      const updatedDoc = {
        _id: "r1",
        name: "Updated Name",
        save: jest.fn().mockResolvedValue(true),
      };
      mockFindByIdAndUpdateResult(mockModels.Restaurant, updatedDoc);

      const res = await request(app)
        .put("/api/restaurants/r1")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Updated Name" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("DELETE /api/restaurants/:id", () => {
    it("should delete restaurant with admin role", async () => {
      const user = mockUser({ role: "admin" });
      const token = generateToken(user);

      mockFindByIdResult(mockModels.User, { _id: user._id, role: user.role, isActive: true });
      mockFindByIdResult(mockModels.Restaurant, { _id: "r1" });
      mockFindByIdAndDeleteResult(mockModels.Restaurant, { _id: "r1" });

      const res = await request(app)
        .delete("/api/restaurants/r1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should reject deletion by non-admin", async () => {
      const user = mockUser({ role: "restaurant" });
      const token = generateToken(user);

      mockFindByIdResult(mockModels.User, { _id: user._id, role: user.role, isActive: true });

      const res = await request(app)
        .delete("/api/restaurants/r1")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
    });
  });
});
