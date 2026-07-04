# Backend Architecture & Deep Notes

Date: 2026-07-01

## Overview

This document summarizes the backend design, key features, data models, API surface, realtime behavior, and operational notes for the Integrated Food Delivery backend.

## Stack

- Node.js (Express)
- MongoDB with Mongoose
- Socket.IO for realtime updates
- Stripe (payments) and Cloudinary/S3 for media

## Key Components

- `server.js` — bootstrap, middleware, route registration, Socket.IO initialization.
- `config/db.js` — MongoDB connection.
- `routes/` — HTTP endpoints.
- `controllers/` — business logic (cart, orders, payments, reviews, AI suggestions).
- `models/` — Mongoose schemas (Cart, MenuItem, Order, Restaurant, User, Payment, Review).
- `sockets/socket.js` — Socket.IO rooms and emit helpers.

## Important Concepts

- Single-restaurant cart: a cart can only contain items from one restaurant. Replacing requires `replaceCart=true`.
- Server-side totals: subtotal, tax, delivery fee, discounts, and totalPrice are computed on the server.
- Geospatial search: restaurants expose `location` (GeoJSON Point) and use `$geoNear` for nearby queries.
- Auth & roles: JWT authentication and role-based middleware (`admin`, `restaurant`, `courier`).
- Webhook security: Stripe webhook validated via signature header.

## Notable Endpoints

- `GET /api/restaurants/nearby` — lat/lng geospatial search.
- Cart endpoints: `POST /api/cart/add`, `PUT /api/cart/update/:menuItemId`, `PUT /api/cart/sync`, `GET /api/cart`, `DELETE /api/cart/remove/:menuItemId`, `DELETE /api/cart/clear`.
- Payments: `POST /api/payments/checkout`, `POST /api/payments/verify`, `POST /api/payments/webhook`.
- AI suggestions: `GET /api/ai/suggestions` (protected).

## Realtime Behavior

- Socket rooms: `user:<id>`, `order:<id>`, `restaurant:<id>`, `role:<role>`.
- Emits: `cart:update`, `order:update` to targeted rooms.

## Operational Notes

- Environment variables: `PORT`, `MONGO_URI`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CLOUDINARY_*`.
- Starting locally: run `nodemon server.js` from the `backend` directory.
- Seed scripts: `npm run seed:food`, `npm run seed:demo-cart`.

## Generating PDF

Install a markdown-to-pdf tool and run the command from the `backend` folder. Example steps:

- Install: `npm i -D md-to-pdf`
- Convert: `npx md-to-pdf docs/backend-architecture-notes.md -o docs/backend-architecture-notes.pdf`

Or use the `npm` script added to `package.json` and run `npm run notes:pdf`.

## Week 3

- Checkout System: payments endpoints and server-side totals (see Payments).
- Review Engine: review model, controller, and review-related endpoints.
- AI Suggestions: `GET /api/ai/suggestions` (protected) — suggestion endpoint and controller logic.

---

For a longer, more detailed PDF (diagrams, sequence flows, and examples), tell me which sections to expand and I will generate an enhanced version.
