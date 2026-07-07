# FoodHub — Frontend Specification

## Project Intent

Complete frontend rebuild of the FoodHub food delivery and dine-out platform. The existing frontend is a skeleton prototype with hardcoded data, emoji icons, plain CSS, empty Redux store, and no API integration. This rebuild establishes a production-ready SPA connected to the fully-built Express.js backend.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 19.2.6 |
| Build Tool | Vite | 8.0.12 |
| Routing | React Router DOM | 7.18.1 |
| State | Redux Toolkit | 2.12.0 |
| HTTP | Axios | 1.18.1 |
| Styling | Tailwind CSS | 4.x |
| Forms | React Hook Form + Zod | 7.81.0 / 4.4.3 |
| Animation | Framer Motion | 12.42.2 |
| Icons | Phosphor (`@phosphor-icons/react`) | latest |
| Toasts | React Hot Toast | 2.6.0 |
| Realtime | Socket.IO Client | 4.8.3 |
| Payments | Stripe.js | 22.3.0 |
| Charts (Phase 2) | Recharts | latest |

---

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| Tailwind CSS over plain CSS | Matches PDF spec, faster development, utility-first |
| Phosphor over react-icons | Consistent vector icons, themable, no emojis |
| Pages extracted to `/pages/` | Better organization than inline components in routes |
| Central Axios instance with JWT interceptor | Single source for auth headers, refresh logic |
| Socket.IO via context provider | Reusable real-time connection across components |
| Bebas Neue + Source Sans 3 fonts | Bold impactful hero + clean readable body per design system |

---

## Folder Structure

```
src/
├── assets/              # Static assets (images, favicon)
├── components/
│   ├── cart/            # CartItem, CartList, CartSummary, Coupon, etc.
│   ├── common/          # Button, Input, Modal, Loader, Pagination, Toast
│   ├── layout/          # Navbar, Footer, MainLayout, ProtectedRoute, AdminLayout, AdminSidebar
│   ├── menu/            # MenuCard, MenuList, MenuSearch, MenuCategory, etc.
│   ├── order/           # OrderCard, OrderList, OrderTimeline, OrderTracking
│   ├── restaurant/      # RestaurantCard, RestaurantList, RestaurantSearch, Filters
│   ├── review/          # ReviewCard, ReviewList, ReviewForm, RatingStars
│   ├── notification/    # NotificationBell, NotificationDropdown, NotificationItem
│   └── admin/           # StatCard, RevenueChart (Phase 2)
├── pages/               # Page-level components
│   └── admin/           # Admin dashboard pages (Phase 2)
├── routes/              # AppRoutes, AdminRoutes, CustomerRoutes
├── services/            # API service modules (auth, cart, menu, order, etc.)
├── redux/               # Store + slices (auth, cart, menu, order, restaurant, review)
├── hooks/               # useAuth, useCart, useOrders, useSocket
├── socket/              # Socket.IO client config + provider
├── utils/               # Helpers (formatCurrency, constants, icons, motion, toast)
├── App.jsx
├── main.jsx
└── index.css            # Tailwind directives + global resets
```

---

## Design System

See [design-system.md](./design-system.md) for the complete token specification, component patterns, animation variants, icon mappings, and anti-patterns to avoid.

---

## Phases

| Phase | Scope | Status | Spec File |
|-------|-------|--------|-----------|
| 1 | Core Customer Flow (11 pages) | Pending | [phase-1-core-customer.md](./phase-1-core-customer.md) |
| 2 | Admin Dashboard (5 pages) | Planned | [phase-2-admin.md](./phase-2-admin.md) |
| 3 | Dine-Out + Extras (reservations, AI, support) | Planned | [phase-3-dine-out-extras.md](./phase-3-dine-out-extras.md) |

---

## Core User Flow

```
Login/Register → Browse Restaurants → View Menu → Add to Cart → Checkout → Payment → Order Tracking → Review
```

---

## Backend API Reference

The backend exposes the following route groups:

| Prefix | Purpose |
|--------|---------|
| `/api/auth` | Authentication (register, login, OTP, JWT) |
| `/api/restaurants` | Restaurant CRUD + nearby search |
| `/api/menu` | Menu items CRUD by restaurant |
| `/api/cart` | Cart management |
| `/api/orders` | Order creation + status tracking |
| `/api/reservations` | Table reservations (Phase 3) |
| `/api/reviews` | Customer reviews |
| `/api/payments` | Stripe checkout + webhook |
| `/api/notifications` | Push notifications |
| `/api/support` | Support tickets (Phase 3) |
| `/api/admin` | Admin analytics + management (Phase 2) |
| `/api/ai` | AI menu suggestions (Phase 3) |
| `/api/upload` | Image upload (Cloudinary) |

---

## Agent Usage Instructions

### For a New Agent Beginning Phase 1

Read these files in order:

1. **`design-system.md`** — All tokens, component patterns, anti-patterns. Every file you create must follow these patterns.
2. **`phase-1-core-customer.md`** — Complete spec. Follow the Build Order strictly (Step 1 → Step 2 → ... → Step 12). Do not skip steps. Each step lists dependencies.
3. Start building files **in the exact order specified** in the Build Order section. Do NOT skip ahead to later steps before earlier ones are verified working.

### Key Rules for All Agents

- **No emojis in UI.** Use Phosphor icons only. Import from `@/utils/icons`.
- **No inline styles.** All styling via Tailwind classes.
- **No hardcoded data.** All data comes from API services. Mock state only in Redux slice initial states.
- **No `<div onClick>` for interactive elements.** Use `<button>` or `<Button>` component.
- **Every data-fetching component must handle 4 states:** loading (skeleton), empty (EmptyState), error (toast + retry), data (render).
- **Every form uses React Hook Form + Zod validation.**
- **All API calls go through service files** (`src/services/*.js`), never direct `fetch`/`axios` in components.
- **Design tokens are NEVER hardcoded as hex values.** Use Tailwind classes (`text-primary`, `bg-surface-bg`, etc.).
- **Import aliases:** `@/` maps to `src/` (configured in vite.config.js).
- **Router:** Use `react-router-dom` v7 patterns. `useNavigate()` for navigation, `useParams()` for URL params, `Link` for anchor links.

### Component Template

Every new component should follow this structure:

```jsx
import { motion } from 'framer-motion'
// Phosphor icons from '@/utils/icons'
// Common components if needed

/**
 * ComponentName — Brief description
 *
 * Props:
 *   propName: type — description
 *
 * States: loading | empty | error | data | disabled
 */
function ComponentName({ prop1, prop2 }) {
  // hooks first (Redux, router, custom hooks)
  // local state if needed
  // effects
  // handlers
  // conditional rendering for states

  return (
    <div className="...">
      {/* component JSX */}
    </div>
  )
}

export default ComponentName
```

### Page Template

```jsx
import { motion } from 'framer-motion'
import { pageTransition } from '@/utils/motion'
// services, hooks, components

function PageName() {
  // data fetching, state management

  return (
    <motion.div {...pageTransition} className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* page content */}
    </motion.div>
  )
}

export default PageName
```

### File Creation Checklist

Before marking a file complete, verify:
- [ ] All 4 states covered (loading, empty, error, data)
- [ ] Phosphor icons used (no emojis, no raw Unicode)
- [ ] Tailwind classes used (no `style={{}}`)
- [ ] Form validation via Zod schema (if applicable)
- [ ] Touch/press feedback on interactive elements (`active:scale-95`, hover states)
- [ ] Responsive at 375px, 768px, 1280px
- [ ] Import path uses `@/` alias where applicable
- [ ] Component has JSDoc comment with props documentation
