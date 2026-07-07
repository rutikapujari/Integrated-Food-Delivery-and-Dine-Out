# Phase 4 — Code Quality Hardening (Agent-Ready Spec)

> **Status:** Pending
> **Scope:** Extract shared components, remove dead dependencies, fix structural issues
> **Est. Files:** 2 new | 6 modified | 1 deleted | 2 dep removals

---

## Background

A code review of the full Phase 1–3 implementation identified several structural issues. None are user-facing bugs — they are maintenance-quality improvements that bring the codebase into full compliance with the folder structure and anti-pattern rules defined in `design-system.md` and `README.md`.

---

## Prerequisites

- Phases 1, 2, 3 fully implemented
- All existing pages and components working
- `node_modules` installed

---

## Build Order

```
Step 1: Shared State Components    (2 new files)     → no deps
Step 2: Dependency Cleanup          (package.json)    → no deps
Step 3: OrderTracking Relocation    (2 files)         → no deps
```

Steps are independent and can be executed in any order.

---

## Step 1: Shared Empty & Error State Components

### Problem

`EmptyState` and `ErrorState` are defined inline and duplicated in two files:
- `src/components/restaurant/RestaurantList.jsx` (lines 11–30)
- `src/components/menu/MenuList.jsx` (lines 10–29)

The `design-system.md` already defines the `EmptyState` component pattern. The folder structure in `README.md` explicitly lists common components including an empty-state equivalent. Extracting these prevents future drift.

### File 1.1: CREATE `src/components/common/EmptyState.jsx`

```
Props:
  icon: PhosphorIcon       — duotone icon displayed above the message
  title: string            — main heading (e.g. "No restaurants found")
  description: string      — supporting text
  action?: {
    label: string          — button text
    onClick: () => void    — button handler
  }                        — optional; if omitted, no button renders

States: default (always rendered, no loading/error variant)
```

```jsx
import Button from './Button'

/**
 * EmptyState — Placeholder shown when a list or section has no data.
 *
 * Props:
 *   icon: PhosphorIcon      — duotone icon
 *   title: string           — main heading
 *   description: string     — supporting text
 *   action?: { label: string, onClick: () => void }  — optional CTA button
 */
function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Icon className="w-16 h-16 text-border mb-4" weight="duotone" />
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  )
}

export default EmptyState
```

### File 1.2: CREATE `src/components/common/ErrorState.jsx`

```jsx
import Button from './Button'

/**
 * ErrorState — Shown when a data fetch fails. Includes retry action.
 *
 * Props:
 *   message: string    — error description
 *   onRetry: () => void
 */
function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <h3 className="text-lg font-semibold mb-1">Something went wrong</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{message}</p>
      <Button variant="outline" onClick={onRetry}>Try Again</Button>
    </div>
  )
}

export default ErrorState
```

### File 1.3: MODIFY `src/components/restaurant/RestaurantList.jsx`

**Remove lines 11–30** (inline `EmptyState` and `ErrorState` function definitions).

**Add imports** at top:

```js
import EmptyState from '../common/EmptyState'
import ErrorState from '../common/ErrorState'
```

No other code changes. Usage lines 50–59 already match the shared component API.

After edit, the file should open with:

```js
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchRestaurants } from '../../redux/restaurantSlice'
import RestaurantCard from './RestaurantCard'
import Pagination from '../common/Pagination'
import Loader from '../common/Loader'
import EmptyState from '../common/EmptyState'
import ErrorState from '../common/ErrorState'
import { Storefront } from '../../utils/icons'
```

Everything from the old line 32 (`function RestaurantList...`) onward stays exactly the same.

### File 1.4: MODIFY `src/components/menu/MenuList.jsx`

**Remove lines 10–28** (inline `EmptyState` and `ErrorState` function definitions).

**Add imports** at top. The `Button` import is no longer needed unless `MenuList` uses it elsewhere — check: `Button` was only used inside the old `ErrorState`. Remove it.

After edit, the file should open with:

```js
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchMenuItems } from '../../redux/menuSlice'
import MenuCard from './MenuCard'
import MenuCategory from './MenuCategory'
import Loader from '../common/Loader'
import EmptyState from '../common/EmptyState'
import ErrorState from '../common/ErrorState'
import { ForkKnife } from '../../utils/icons'
```

Everything from the old line 30 (`function MenuList...`) onward stays exactly the same.

### Verification

- [ ] `RestaurantList` renders empty state (clear all filters to trigger)
- [ ] `RestaurantList` renders error state (disconnect backend to trigger)
- [ ] `MenuList` renders empty state (navigate to a restaurant with no menu items)
- [ ] `MenuList` renders error state (disconnect backend to trigger)
- [ ] No `EmptyState` or `ErrorState` inline definitions remain in any `components/*` file

---

## Step 2: Dependency Cleanup

### Problem

Two packages are listed in `package.json` but never imported in source code:

| Package | Why Remove |
|---------|-----------|
| `stripe` (^22.3.0) | Server-side Stripe SDK — should not be in a browser bundle. Not imported anywhere. |
| `react-icons` (^5.7.0) | Spec mandates `@phosphor-icons/react` only. Not imported anywhere. |

### File 2.1: MODIFY `package.json`

Run the following command:

```bash
cd frontend
npm uninstall stripe react-icons
```

This removes the entries from both `package.json` and `package-lock.json`.

### Verification

- [ ] `npm ls stripe` returns "empty" or error
- [ ] `npm ls react-icons` returns "empty" or error
- [ ] `npm run dev` starts without errors
- [ ] `npm run build` completes without errors

---

## Step 3: OrderTrackingPage Relocation

### Problem

`src/pages/OrderTrackingPage.jsx` is a 1-line proxy:

```js
export { default } from '../components/order/OrderTracking'
```

The real code lives in `components/order/OrderTracking.jsx` — but it IS a page (uses `useParams`, `pageTransition`, fetches its own data). It is not reusable. The folder structure rule is: pages belong in `pages/`, reusable building blocks belong in `components/`.

### File 3.1: MODIFY `src/pages/OrderTrackingPage.jsx`

Replace the entire file with the full content from `components/order/OrderTracking.jsx`. The import paths need adjusting:

**Before** (in `components/order/`) the imports were:
```js
import { pageTransition } from '../../utils/motion'
import { fetchOrderById } from '../../redux/orderSlice'
import { formatCurrency } from '../../utils/formatCurrency'
import { ORDER_STATUS_LABELS } from '../../utils/constants'
import { useSocket } from '../../hooks/useSocket'
import OrderTimeline from '../../components/order/OrderTimeline'
import Loader from '../../components/common/Loader'
import Button from '../../components/common/Button'
import { Truck, MapPin, Clock } from '../../utils/icons'
```

**After** (in `pages/`) the imports become:
```js
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pageTransition } from '../utils/motion'
import { fetchOrderById } from '../redux/orderSlice'
import { formatCurrency } from '../utils/formatCurrency'
import { ORDER_STATUS_LABELS } from '../utils/constants'
import { useSocket } from '../hooks/useSocket'
import OrderTimeline from '../components/order/OrderTimeline'
import Loader from '../components/common/Loader'
import { Truck, MapPin, Clock } from '../utils/icons'
```

The component name stays `OrderTrackingPage` (it was already named that internally). Nothing else changes — the JSX body is identical.

```jsx
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pageTransition } from '../utils/motion'
import { fetchOrderById } from '../redux/orderSlice'
import { formatCurrency } from '../utils/formatCurrency'
import { ORDER_STATUS_LABELS } from '../utils/constants'
import { useSocket } from '../hooks/useSocket'
import OrderTimeline from '../components/order/OrderTimeline'
import Loader from '../components/common/Loader'
import { Truck, MapPin, Clock } from '../utils/icons'

/**
 * OrderTrackingPage — Live order status tracking with timeline.
 * Route: /orders/:id (protected)
 *
 * States: loading | error (order not found) | data (timeline + items)
 */
function OrderTrackingPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { activeOrder, loading } = useSelector((state) => state.order)
  const { joinOrderRoom, leaveOrderRoom } = useSocket()

  useEffect(() => {
    dispatch(fetchOrderById(id))
  }, [dispatch, id])

  useEffect(() => {
    joinOrderRoom(id)
    return () => leaveOrderRoom(id)
  }, [id, joinOrderRoom, leaveOrderRoom])

  if (loading && !activeOrder) return <Loader variant="page" />
  if (!activeOrder) {
    return (
      <motion.div {...pageTransition} className="flex flex-col items-center justify-center py-16">
        <h3 className="text-lg font-semibold">Order not found</h3>
      </motion.div>
    )
  }

  const statusLabel = ORDER_STATUS_LABELS[activeOrder.status] || activeOrder.status

  return (
    <motion.div {...pageTransition} className="max-w-3xl mx-auto px-4 md:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Truck className="w-8 h-8 text-primary" />
        <div>
          <h1 className="font-display text-3xl">Track Order</h1>
          <p className="text-muted-foreground text-sm">Order #{activeOrder._id?.slice(-8).toUpperCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-border rounded-[var(--radius-lg)] p-4 text-center">
          <p className="text-muted-foreground text-xs mb-1">Status</p>
          <p className="text-primary font-bold">{statusLabel}</p>
        </div>
        <div className="bg-white border border-border rounded-[var(--radius-lg)] p-4 text-center">
          <p className="text-muted-foreground text-xs mb-1">Estimated Delivery</p>
          <p className="text-foreground font-semibold flex items-center justify-center gap-1">
            <Clock className="w-4 h-4" /> {activeOrder.estimatedDelivery || '30-40 min'}
          </p>
        </div>
        <div className="bg-white border border-border rounded-[var(--radius-lg)] p-4 text-center">
          <p className="text-muted-foreground text-xs mb-1">Total Amount</p>
          <p className="text-primary font-bold">{formatCurrency(activeOrder.totalAmount)}</p>
        </div>
      </div>

      <div className="bg-white border border-border rounded-[var(--radius-lg)] p-6 mb-8">
        <h2 className="font-semibold text-lg mb-4">Order Timeline</h2>
        <OrderTimeline status={activeOrder.status} />
      </div>

      {activeOrder.address && (
        <div className="bg-white border border-border rounded-[var(--radius-lg)] p-6 mb-8">
          <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" /> Delivery Address
          </h2>
          <p className="text-muted-foreground text-sm">
            {activeOrder.address.street}, {activeOrder.address.city}, {activeOrder.address.state} {activeOrder.address.zipCode}
          </p>
        </div>
      )}

      <div className="bg-white border border-border rounded-[var(--radius-lg)] p-6">
        <h2 className="font-semibold text-lg mb-4">Order Items</h2>
        <div className="space-y-3">
          {activeOrder.items?.map((item, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
              <div>
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground">&times;{item.quantity}</p>
              </div>
              <span className="font-semibold text-sm">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <hr className="my-4" />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span className="text-primary">{formatCurrency(activeOrder.totalAmount)}</span>
        </div>
      </div>
    </motion.div>
  )
}

export default OrderTrackingPage
```

### File 3.2: DELETE `src/components/order/OrderTracking.jsx`

This file is no longer needed. The component was never imported by any other file — no other component references `OrderTracking`; it was only reached via the proxy in `OrderTrackingPage.jsx`.

### Verification

- [ ] `src/components/order/OrderTracking.jsx` no longer exists
- [ ] `src/pages/OrderTrackingPage.jsx` contains full component code (not a re-export)
- [ ] Navigate to `/orders/:id` → page renders correctly
- [ ] Order status updates in real-time via socket
- [ ] `npm run build` succeeds with no import errors

---

## Step 4: Navbar Redux Access (No Action Required)

### Finding (Accepted as-is)

`src/components/layout/Navbar.jsx` reads cart state via raw `useSelector` instead of the `useCart()` hook. Decision: **no change needed.**

- `useCart()` wraps Redux with add/remove/coupon logic. Navbar only needs `items.length` for the badge count.
- Importing the full hook would add complexity without benefit.
- This is documented here so future agents understand the rationale.

---

## File Dependency Map

```
Step 1 (Shared Components):
  components/common/EmptyState.jsx   → Button
  components/common/ErrorState.jsx   → Button
  components/restaurant/RestaurantList.jsx → EmptyState, ErrorState
  components/menu/MenuList.jsx            → EmptyState, ErrorState

Step 2 (Dependencies):
  package.json  → stripe (removed), react-icons (removed)

Step 3 (Relocation):
  pages/OrderTrackingPage.jsx              → orderSlice, useSocket, OrderTimeline, common
  components/order/OrderTracking.jsx       → DELETED
```

---

## Acceptance Checklist

- [ ] `EmptyState.jsx` exists in `src/components/common/` with JSDoc and `action` prop
- [ ] `ErrorState.jsx` exists in `src/components/common/` with JSDoc
- [ ] No inline `EmptyState` or `ErrorState` definitions remain in other files
- [ ] `stripe` and `react-icons` removed from `package.json` dependencies
- [ ] `npm run build` succeeds
- [ ] `OrderTrackingPage.jsx` is a self-contained page (not a re-export)
- [ ] `components/order/OrderTracking.jsx` is deleted
- [ ] `/orders/:id` page renders correctly
- [ ] Restaurant list and menu list empty/error states still display correctly
- [ ] No regression in any existing page or component
