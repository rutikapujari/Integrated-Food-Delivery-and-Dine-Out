const request = require("supertest");
const { createTestApp, mockModels, mockUser, generateToken, mockFindByIdResult } = require("./setup");
const express = require("express");

let app;
let server;

beforeAll(() => {
  const router = require("../routes/authRoutes");
  app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/api/auth", router);
});

afterAll(() => {
  if (server) server.close();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Auth API", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new customer successfully", async () => {
      mockModels.User.findOne.mockResolvedValue(null);
      mockModels.User.create.mockResolvedValue({
        _id: "user123",
        name: "Test User",
        email: "test@example.com",
        role: "customer",
      });

      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(mockModels.User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(mockModels.User.create).toHaveBeenCalled();
    });

    it("should reject registration if user already exists and is verified", async () => {
      mockModels.User.findOne.mockResolvedValue({
        _id: "existing",
        email: "test@example.com",
        isVerified: true,
      });

      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it("should re-register unverified user", async () => {
      const mockExisting = {
        _id: "existing",
        email: "test@example.com",
        isVerified: false,
        save: jest.fn().mockResolvedValue(true),
      };
      mockModels.User.findOne.mockResolvedValue(mockExisting);

      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        });

      expect(res.status).toBe(200);
      expect(mockExisting.save).toHaveBeenCalled();
    });

    it("should register with minimal fields", async () => {
      mockModels.User.findOne.mockResolvedValue(null);
      mockModels.User.create.mockResolvedValue({
        _id: "user123",
        name: "",
        email: "",
        role: "customer",
      });

      const res = await request(app)
        .post("/api/auth/register")
        .send({});

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("should register restaurant owner", async () => {
      mockModels.User.findOne.mockResolvedValue(null);
      mockModels.User.create.mockResolvedValue({
        _id: "owner123",
        name: "Owner",
        email: "owner@example.com",
        role: "restaurant",
      });

      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Owner",
          email: "owner@example.com",
          password: "password123",
          role: "restaurant",
        });

      expect(res.status).toBe(201);
      expect(mockModels.User.create).toHaveBeenCalled();
    });
  });

  describe("POST /api/auth/verify-otp", () => {
    it("should verify OTP successfully", async () => {
      const mockFoundUser = {
        _id: "user123",
        email: "test@example.com",
        isVerified: false,
        save: jest.fn().mockResolvedValue(true),
      };
      mockModels.User.findOne.mockResolvedValue(mockFoundUser);

      const res = await request(app)
        .post("/api/auth/verify-otp")
        .send({ email: "test@example.com", otp: "123456" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockFoundUser.isVerified).toBe(true);
    });

    it("should reject invalid OTP", async () => {
      mockModels.User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/auth/verify-otp")
        .send({ email: "test@example.com", otp: "000000" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/invalid or expired/i);
    });
  });

  describe("POST /api/auth/resend-otp", () => {
    it("should resend OTP for unverified user", async () => {
      const mockFoundUser = {
        _id: "user123",
        email: "test@example.com",
        isVerified: false,
        save: jest.fn().mockResolvedValue(true),
      };
      mockModels.User.findOne.mockResolvedValue(mockFoundUser);

      const res = await request(app)
        .post("/api/auth/resend-otp")
        .send({ email: "test@example.com" });

      expect(res.status).toBe(200);
      expect(mockFoundUser.save).toHaveBeenCalled();
    });

    it("should reject resend for verified user", async () => {
      mockModels.User.findOne.mockResolvedValue({
        _id: "user123",
        email: "test@example.com",
        isVerified: true,
      });

      const res = await request(app)
        .post("/api/auth/resend-otp")
        .send({ email: "test@example.com" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already verified/i);
    });

    it("should return 404 for unknown email", async () => {
      mockModels.User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/auth/resend-otp")
        .send({ email: "unknown@example.com" });

      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/auth/forgot", () => {
    it("should generate reset OTP for existing user", async () => {
      const mockFoundUser = {
        _id: "user123",
        email: "test@example.com",
        save: jest.fn().mockResolvedValue(true),
      };
      mockModels.User.findOne.mockResolvedValue(mockFoundUser);

      const res = await request(app)
        .post("/api/auth/forgot")
        .send({ email: "test@example.com" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockFoundUser.save).toHaveBeenCalled();
    });

    it("should return 404 for non-existent email", async () => {
      mockModels.User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/auth/forgot")
        .send({ email: "noone@example.com" });

      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should logout authenticated user", async () => {
      const user = mockUser();
      mockFindByIdResult(mockModels.User, { _id: user._id, role: user.role, isActive: true });
      mockModels.User.findByIdAndUpdate.mockResolvedValue(true);

      const token = generateToken(user);

      const res = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should reject logout without token", async () => {
      const res = await request(app)
        .post("/api/auth/logout");

      expect(res.status).toBe(401);
    });
  });
});
