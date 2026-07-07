# Phase 1 — Core Customer Flow (Agent-Ready Spec)

> **Status:** Pending
> **Pages:** 11 | **Services:** 7 | **Redux Slices:** 6 | **Est. Files:** ~55

---

## Build Order (Must Follow)

Agents must work through these steps sequentially. Each step has dependencies on previous steps.

```
Step 1: Foundation         (10 files) → no deps
Step 2: Redux Store        (8 files)  → depends on Step 1 (api.js, constants)
Step 3: Auth Flow          (5 files)  → depends on Step 2 (store, authSlice)
Step 4: Layout             (4 files)  → depends on Step 3 (useAuth, ProtectedRoute)
Step 5: Common Components  (5 files)  → depends on Step 1 (design tokens)
Step 6: Restaurant Pages   (8 files)  → depends on Steps 2-5
Step 7: Menu Pages         (7 files)  → depends on Steps 2-5
Step 8: Cart + Checkout    (9 files)  → depends on Steps 2-5
Step 9: Orders + Tracking  (7 files)  → depends on Steps 2-5
Step 10: Profile           (5 files)  → depends on Steps 2-5
Step 11: Routing           (3 files)  → depends on ALL previous steps
Step 12: Reviews           (2 files)  → depends on Steps 2-5
```

---

## Pre-Build: Environment Variable

Create `frontend/.env`:

```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxx
```

---

## Step 1: Foundation

### File 1.1: `src/utils/constants.js`

```js
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
}

export const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const ORDER_STATUS_COLORS = {
  pending: 'warning',
  confirmed: 'accent',
  preparing: 'accent',
  out_for_delivery: 'primary',
  delivered: 'success',
  cancelled: 'destructive',
}

export const CUISINE_TYPES = [
  'Italian', 'Chinese', 'Indian', 'Japanese', 'Mexican',
  'Thai', 'American', 'French', 'Mediterranean', 'Korean',
  'Fast Food', 'Dessert', 'Beverages',
]

export const DELIVERY_FEE = 50

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
}
```

### File 1.2: `src/utils/formatCurrency.js`

```js
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
```

### File 1.3: `src/utils/icons.js`

Copy from `design-system.md` → Phosphor Icon Imports section.

### File 1.4: `src/utils/motion.js`

Copy from `design-system.md` → Framer Motion Variants section.

### File 1.5: `src/utils/toast.js`

Copy from `design-system.md` → Toast Notification Pattern section.

### File 1.6: `src/services/api.js`

```js
import axios from 'axios'
import { API_URL } from '../utils/constants'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// Request interceptor — attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — handle 401 refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken })
        localStorage.setItem('token', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return api(originalRequest)
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
```

### File 1.7: Replace `src/index.css`

Copy entire file from `design-system.md` → `src/index.css` section.

### File 1.8: `vite.config.js` (modify existing)

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
      },
    },
  },
})
```

### Files 1.9–1.10: Install + cleanup

```bash
cd frontend
npm install tailwindcss @tailwindcss/vite @phosphor-icons/react
```

Remove `src/App.css` (delete file). Remove import of `App.css` from `src/App.jsx`.

---

## Step 2: Redux Store + Slices

### File 2.1: `src/redux/store.js`

```js
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import cartReducer from './cartSlice'
import restaurantReducer from './restaurantSlice'
import menuReducer from './menuSlice'
import orderReducer from './orderSlice'
import notificationReducer from './notificationSlice'
import reviewReducer from './reviewSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    restaurant: restaurantReducer,
    menu: menuReducer,
    order: orderReducer,
    notification: notificationReducer,
    review: reviewReducer,
  },
})
```

### File 2.2: `src/redux/authSlice.js`

```js
// State shape:
// {
//   user: null | { _id, name, email, phone, role, addresses[] },
//   token: null | string,
//   refreshToken: null | string,
//   isAuthenticated: boolean,
//   loading: boolean,
//   error: null | string,
// }

// Thunks:
// loginUser({ email, password }) → POST /api/auth/login
// registerUser({ name, email, phone, password }) → POST /api/auth/register
// verifyOTP({ email, otp }) → POST /api/auth/verify-otp
// fetchCurrentUser() → GET /api/auth/me
// logoutUser() → POST /api/auth/logout, clear storage

// Reducers:
// setCredentials(token, refreshToken) → localStorage + state
// clearCredentials() → remove token from localStorage + state
// clearError() → reset error to null
```

### File 2.3: `src/redux/cartSlice.js`

```js
// State shape:
// {
//   items: [{ menuItemId, name, price, quantity, image, restaurantId, restaurantName }],
//   restaurantId: null | string,
//   subtotal: number,
//   deliveryFee: number, // constant from DELIVERY_FEE
//   tax: number,         // computed: subtotal * 0.05
//   discount: number,    // from coupon
//   coupon: null | { code, discountPercent, discountAmount },
//   total: number,       // computed: subtotal + deliveryFee + tax - discount
//   loading: boolean,
//   error: null | string,
// }

// Thunks:
// fetchCart() → GET /api/cart → sync state
// addToCart({ menuItemId, name, price, image, restaurantId, restaurantName, quantity? }) → POST /api/cart/add
// updateQuantity({ menuItemId, quantity }) → PUT /api/cart/update/:menuItemId
// removeFromCart(menuItemId) → DELETE /api/cart/remove/:menuItemId
// clearCart() → DELETE /api/cart/clear
// applyCoupon(code) → validate locally or via API

// Note: When adding from a different restaurant, clear cart first and warn user via toast.
// "Your cart contains items from [OldRestaurant]. Clear cart and add from [NewRestaurant]?"
```

### File 2.4: `src/redux/restaurantSlice.js`

```js
// State shape:
// {
//   list: [],
//   selected: null,
//   filters: { cuisine: null | string, rating: null | number, deliveryTime: null | number },
//   search: '',
//   pagination: { page: 1, limit: 12, total: 0, pages: 0 },
//   loading: boolean,
//   error: null | string,
// }

// Thunks:
// fetchRestaurants({ page?, limit?, search?, cuisine?, rating?, deliveryTime? }) → GET /api/restaurants
// fetchRestaurantById(id) → GET /api/restaurants/:id
// fetchNearbyRestaurants({ lat, lng, radius? }) → GET /api/restaurants/nearby

// Reducers:
// setSearch(string)
// setFilters({ cuisine?, rating?, deliveryTime? })
// clearFilters()
// setPage(number)
```

### File 2.5: `src/redux/menuSlice.js`

```js
// State shape:
// {
//   items: [],
//   categories: [],     // unique categories from items
//   search: '',
//   loading: boolean,
//   error: null | string,
// }

// Thunks:
// fetchMenuItems({ search?, restaurantId? }) → GET /api/menu or /api/menu/restaurant/:id
// fetchMenuItemById(id) → GET /api/menu/:id

// Reducers:
// setSearch(string)
```

### File 2.6: `src/redux/orderSlice.js`

```js
// State shape:
// {
//   list: [],
//   activeOrder: null,   // currently tracked order
//   loading: boolean,
//   error: null | string,
// }

// Thunks:
// createOrder({ items, restaurantId, address, paymentMethod, coupon? }) → POST /api/orders/create
// fetchOrders() → GET /api/orders
// fetchOrderById(id) → GET /api/orders/:id
// cancelOrder(id) → PUT /api/orders/:id/cancel

// Reducers:
// updateOrderStatus({ orderId, status }) (called from socket)
// setActiveOrder(order)
```

### File 2.7: `src/redux/notificationSlice.js`

```js
// State shape:
// {
//   list: [],
//   unread: 0,
//   loading: boolean,
// }

// Thunks:
// fetchNotifications() → GET /api/notifications
// markAsRead(id) → PUT /api/notifications/:id/read
// markAllRead() → PUT /api/notifications/read-all

// Reducers:
// addNotification(notification) (called from socket)
```

### File 2.8: `src/redux/reviewSlice.js`

```js
// State shape:
// {
//   restaurantReviews: {},  // keyed by restaurantId → array of reviews
//   userReviews: [],
//   loading: boolean,
//   error: null | string,
// }

// Thunks:
// fetchReviews(restaurantId) → GET /api/reviews/restaurant/:restaurantId
// createReview({ restaurantId, orderId, rating, comment }) → POST /api/reviews
```

---

## Step 3: Auth Flow

### File 3.1: `src/services/authService.js`

```js
import api from './api'

export const authService = {
  register: (data) => api.post('/auth/register', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (email) => api.post('/auth/resend-otp', { email }),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot', { email }),
  resetPassword: (data) => api.post('/auth/reset-with-otp', data),
}
```

### File 3.2: `src/hooks/useAuth.js`

```js
// Custom hook — use throughout app
// Returns: { user, isAuthenticated, loading, error, login, register, verifyOTP, logout, isAdmin }
// Connects to authSlice via useSelector/useDispatch
// login: (email, password) → dispatch(loginUser(...)) → toast success/error
// register: (data) → dispatch(registerUser(...)) → returns user for OTP flow
// logout: () → dispatch(logoutUser(...)) → navigate to '/login'
```

### File 3.3: `src/pages/LoginPage.jsx`

```jsx
// Layout: Centered card on warm gradient background
// <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-bg to-primary-light px-4">
//   <div className="w-full max-w-md bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-modal)] p-8">
//     <Logo /> (centered, mb-6)
//     <h1 className="font-display text-3xl text-center mb-2">Welcome Back</h1>
//     <p className="text-muted-foreground text-center mb-8">Sign in to your FoodHub account</p>

//     Form: React Hook Form + Zod
//     Fields:
//       email: required, valid email
//       password: required, min 6 chars
//
//     Submit: "Sign In" button (full width, lg)
//     Below: "Don't have an account? <Link to="/register">Sign Up</Link>" (centered)
//     Below: "<Link to="/forgot-password">Forgot Password?</Link>" (centered, text-sm)

// States:
//   default: empty form
//   loading: button shows spinner, inputs disabled
//   error: inline error under inputs, toast with server message
//   success: store tokens, navigate to "/"

// Dependencies: useAuth hook, Input component, Button component
```

### File 3.4: `src/pages/RegisterPage.jsx`

```jsx
// Two-step wizard:
// Step 1: Registration form
//   Layout: Same centered card as LoginPage
//   <h1>Create Account</h1>
//   <p>Join FoodHub for delicious meals delivered fast</p>

//   Fields (React Hook Form + Zod):
//     name: required, min 2 chars, max 50 chars
//     email: required, valid email
//     phone: required, 10-digit Indian mobile (regex: /^[6-9]\d{9}$/)
//     password: required, min 8 chars, 1 uppercase, 1 number, 1 special
//     confirmPassword: required, must match password
//
//   Submit: "Create Account" button
//   Below: "Already have an account? <Link to="/login">Sign In</Link>"

// Step 2: OTP Verification
//   Triggered after successful registration (api returns success, OTP sent to email)
//   Layout: Same centered card, but shows email being verified
//   <h1>Verify Email</h1>
//   <p>Enter the 6-digit code sent to {email}</p>

//   Fields:
//     otp: required, 6 digits (use 6 separate input boxes or single input)
//     Resend OTP button (with 30s cooldown timer)

// States:
//   step1-default: empty registration form
//   step1-loading: button spinner, inputs disabled
//   step1-error: inline field errors + toast
//   step1-success: transition to step 2 (store temp email in local state)
//   step2-default: OTP input boxes
//   step2-loading: verify button spinner
//   step2-error: "Invalid OTP" shake animation + toast
//   step2-success: auto-login, navigate to "/"

// Dependencies: useAuth hook, Input component, Button component
```

### File 3.5: `src/components/layout/ProtectedRoute.jsx`

```jsx
// Props: children (ReactNode)
// Behavior:
// - If loading: show full page Loader
// - If !isAuthenticated: Navigate to "/login?redirect={currentPath}"
// - If authenticated: render children
// Dependencies: useSelector(auth), Navigate from react-router-dom
// Note: AdminRoute (Phase 2) can extend this by also checking user.role === 'admin'
```

---

## Step 4: Layout Components

### File 4.1: `src/components/layout/Navbar.jsx`

```jsx
// Props: none (reads auth/cart from Redux)

// Layout zones:
// ┌──────────────────────────────────────────────────────────┐
// │ [Logo]  [Home] [Restaurants] [Menu]  [Search...]  [🛒3] [🔔] [👤] │
// └──────────────────────────────────────────────────────────┘

// Mobile (<768px):
// ┌──────────────────────────────────────────┐
// │ [☰]  [Logo]                    [🛒3]  │
// └──────────────────────────────────────────┘
// Hamburger opens Sidebar overlay

// Logo: "FoodHub" in font-display text-primary text-2xl
// NavLink: font-medium, active = text-primary border-b-2 border-primary
// Search: Input with MagnifyingGlass icon, debounced 300ms, on submit navigates to /restaurants?search=...
// CartIcon: ShoppingCart icon, badge showing items.length, links to /cart
// NotificationBell: Bell icon, badge showing unread count, dropdown on click
// UserMenu: User icon or avatar, dropdown: Profile | Orders | Logout
//   - If not logged in: "Sign In" button instead

// States:
//   - User logged in: show avatar + dropdown
//   - User not logged in: show "Sign In" button
//   - Cart empty: no badge
//   - Cart has items: red badge with count
//   - Notifications unread: orange badge with count

// Dependencies: useSelector(auth, cart, notification), useAuth, Link
```

### File 4.2: `src/components/layout/Footer.jsx`

```jsx
// Props: none

// Layout:
// ┌────────────────────────────────────────────────────────────┐
// │ About Us        Customer Service  Quick Links    Contact    │
// │ Our Story        Help Center       Home           support@.. │
// │ Careers          FAQs              Restaurants    1800-xxx   │
// │ Blog             Privacy Policy    Menu           Social     │
// │ Press            Terms of Service  Orders         [icons]   │
// ├────────────────────────────────────────────────────────────┤
// │              © 2026 FoodHub. All rights reserved.           │
// └────────────────────────────────────────────────────────────┘

// Each column: flex flex-col gap-2
// Column title: font-semibold mb-1
// Links: text-muted-foreground hover:text-primary transition-colors
// Bottom bar: border-t border-border pt-6 mt-8 text-center text-sm text-muted-foreground
```

### File 4.3: `src/components/layout/MainLayout.jsx`

```jsx
// Props: none
// Structure:
// <div className="flex flex-col min-h-screen">
//   <Navbar />
//   <main className="flex-1">
//     <Outlet />
//   </main>
//   <Footer />
// </div>
//
// Wrap <Outlet /> with AnimatePresence for page transitions
// Dependencies: Navbar, Footer, Outlet from react-router-dom
```

### File 4.4: `src/components/layout/Sidebar.jsx`

```jsx
// Props:
//   isOpen: boolean
//   onClose: () => void

// Layout: Slide-in drawer from left (mobile only, <768px)
// Uses framer-motion for slide animation
// Overlay: fixed inset-0 bg-black/50 z-40 (click to close)
// Drawer: fixed left-0 top-0 bottom-0 w-72 bg-white z-50 p-6 flex flex-col gap-4

// Content:
//   [✕ Close button] (top-right)
//   [Logo]
//   <hr />
//   Nav links (same as Navbar, vertical list)
//   <hr />
//   User section (avatar + name + email) OR Sign In button
//
// Dependencies: framer-motion, Link, useAuth
```

---

## Step 5: Common Components

### File 5.1: `src/components/common/Button.jsx`

```jsx
// Props interface:
// {
//   variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
//   size?: 'sm' | 'md' | 'lg'
//   loading?: boolean
//   disabled?: boolean
//   icon?: PhosphorIcon      // renders 20px left of children
//   iconRight?: PhosphorIcon  // renders 20px right of children
//   children: ReactNode
//   className?: string
//   ...rest (onClick, type, etc.)
// }

// States:
//   default  → styled by variant
//   hover    → darker bg, slight scale (via CSS :hover)
//   active   → scale-95
//   loading  → Spinner icon spins, pointer-events-none, opacity not changed
//   disabled → opacity-50, cursor-not-allowed, no hover effects

// Implementation: Use class-variance-authority pattern or simple conditional classes
// Example: <Button variant="primary" size="lg" icon={ShoppingCart} loading={loading}>Add to Cart</Button>
```

### File 5.2: `src/components/common/Input.jsx`

```jsx
// Props interface:
// {
//   label: string
//   name: string
//   type?: 'text' | 'email' | 'password' | 'number' | 'tel'
//   placeholder?: string
//   error?: string           // from react-hook-form formState.errors
//   helperText?: string
//   icon?: PhosphorIcon
//   iconRight?: PhosphorIcon
//   iconRightOnClick?: () => void  // e.g. eye toggle for password
//   required?: boolean
//   disabled?: boolean
//   register?: ReturnType<typeof useForm>['register']  // react-hook-form integration
//   className?: string
// }

// States:
//   default  → border-border
//   focused  → border-primary, ring-2 ring-primary/20 (CSS :focus-within)
//   error    → border-destructive, red error text below
//   disabled → bg-surface-muted, opacity-60
//   filled   → no visual change (keep it simple)

// Password type: iconRight is Eye/EyeSlash toggle, iconRightOnClick toggles type

// Layout:
// <div className="flex flex-col gap-1.5">
//   {label && <label className="text-sm font-semibold">{label}{required && ' *'}</label>}
//   <div className="relative">
//     {icon && <icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />}
//     <input className="w-full h-11 px-4 ..." />
//     {iconRight && <button onClick={iconRightOnClick}>...</button>}
//   </div>
//   {error && <p className="text-sm text-destructive">{error}</p>}
//   {helperText && !error && <p className="text-sm text-muted-foreground">{helperText}</p>}
// </div>
```

### File 5.3: `src/components/common/Modal.jsx`

```jsx
// Props interface:
// {
//   isOpen: boolean
//   onClose: () => void
//   title?: string
//   children: ReactNode
//   footer?: ReactNode
//   size?: 'sm' | 'md' | 'lg' | 'xl'
// }

// Behavior:
// - Close on overlay click
// - Close on Escape key (useEffect with keydown listener)
// - Prevent body scroll when open (useEffect: document.body.style.overflow)
// - Framer Motion AnimatePresence for enter/exit animation

// States:
//   entering → scale-in animation (200ms)
//   open     → visible
//   exiting  → scale-out animation (150ms)
//   closed   → return null (AnimatePresence unmounts)

// Sizes: sm=max-w-sm, md=max-w-md, lg=max-w-lg, xl=max-w-xl
```

### File 5.4: `src/components/common/Loader.jsx`

```jsx
// Props interface:
// {
//   variant?: 'spinner' | 'card' | 'text' | 'page'
//   count?: number     // for 'card' variant: number of skeleton cards
//   className?: string
// }

// Variants:
//   spinner → centered Spinner icon, animate-spin, text-primary, size-8
//   card    → grid of count skeleton cards (image + 3 text lines), gap-6
//   text    → single line, h-4 w-full rounded bg-border animate-pulse
//   page    → full page centered spinner with "Loading..." text below

// Card skeleton structure:
// <div className="bg-white border border-border rounded-[var(--radius-lg)] overflow-hidden animate-pulse">
//   <div className="h-48 bg-border" />   {/* image */}
//   <div className="p-4 space-y-3">
//     <div className="h-5 w-3/4 bg-border rounded" />
//     <div className="h-4 w-1/2 bg-border rounded" />
//     <div className="h-4 w-full bg-border rounded" />
//   </div>
// </div>
```

### File 5.5: `src/components/common/Pagination.jsx`

```jsx
// Props interface:
// {
//   currentPage: number
//   totalPages: number
//   onPageChange: (page: number) => void
// }

// Layout:
// <div className="flex items-center justify-center gap-2 mt-8">
//   <Prev button> (disabled on page 1)
//   [1] [2] [3] ... [last]   (show max 5 page numbers with ellipsis)
//   <Next button> (disabled on last page)
// </div>

// Logic: Generate page numbers array with ellipsis for large page counts
// Button: rounded-full w-10 h-10 flex items-center justify-center
//   active: bg-primary text-white
//   inactive: hover:bg-surface-muted
//   disabled: opacity-40 cursor-not-allowed
```

---

## Step 6: Restaurant Pages

### File 6.1: `src/services/restaurantService.js`

```js
import api from './api'

export const restaurantService = {
  getAll: (params) => api.get('/restaurants', { params }),
  getById: (id) => api.get(`/restaurants/${id}`),
  getNearby: (params) => api.get('/restaurants/nearby', { params }),
}
```

### File 6.2: `src/components/restaurant/RestaurantCard.jsx`

```jsx
// Props interface:
// {
//   restaurant: {
//     _id: string
//     name: string
//     cuisine: string | string[]
//     rating: number
//     deliveryTime: number     // in minutes
//     image: string
//     address?: string
//     minOrder?: number
//     isOpen?: boolean
//   }
//   onClick?: () => void       // navigates to /restaurants/:id
// }

// Layout:
// <motion.div variants={cardHover} initial="rest" whileHover="hover" onClick={onClick}>
//   <div className="relative">
//     <img src={image} alt={name} className="w-full h-48 object-cover rounded-t-[var(--radius-lg)]" />
//     {!isOpen && <ClosedOverlay />}
//     <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold">
//       {deliveryTime} min
//     </div>
//   </div>
//   <div className="p-4">
//     <div className="flex items-start justify-between">
//       <h3 className="font-semibold text-lg truncate">{name}</h3>
//       <span className="flex items-center gap-1 text-sm font-semibold bg-success-light text-success px-2 py-0.5 rounded-md shrink-0">
//         <Star weight="fill" className="w-4 h-4" /> {rating}
//       </span>
//     </div>
//     <p className="text-muted-foreground text-sm mt-1">{Array.isArray(cuisine) ? cuisine.join(', ') : cuisine}</p>
//     {address && <p className="text-muted-foreground text-xs mt-1 truncate">{address}</p>}
//   </div>
// </motion.div>

// States:
//   - default: normal card
//   - hover: lift -4px, shadow increase
//   - loading: show RestaurantSkeleton
//   - restaurant closed: gray overlay + "Currently Closed" badge
```

### File 6.3: `src/components/restaurant/RestaurantList.jsx`

```jsx
// Props: none (reads from Redux restaurant slice)

// Behavior:
// - On mount: dispatch fetchRestaurants()
// - Renders responsive grid: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6
// - Each card: <RestaurantCard onClick={() => navigate(`/restaurants/${_id}`)} />

// States:
//   loading  → <Loader variant="card" count={8} />
//   empty    → <EmptyState icon={Storefront} title="No restaurants found" description="Try adjusting your filters" />
//   error    → <ErrorState message={error} onRetry={...} />
//   data     → grid of RestaurantCards + Pagination at bottom
```

### File 6.4: `src/components/restaurant/RestaurantSearch.jsx`

```jsx
// Props:
// {
//   value: string
//   onChange: (value: string) => void
//   placeholder?: string   // default: "Search restaurants or cuisines..."
// }

// Layout: Full-width input with MagnifyingGlass icon, rounded-full, h-12
// Behavior: onChange calls parent, parent uses useEffect + debounce 300ms to dispatch search
```

### File 6.5: `src/components/restaurant/RestaurantFilters.jsx`

```jsx
// Props: none (reads filters from Redux, dispatches setFilters)

// Layout: Horizontal row of filter chips/dropdowns
// <div className="flex flex-wrap items-center gap-3 mb-6">
//   {/* Cuisine dropdown */}
//   <select className="...">
//     <option value="">All Cuisines</option>
//     {CUISINE_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
//   </select>

//   {/* Rating filter — row of buttons */}
//   <div className="flex gap-1">
//     {[4.5, 4.0, 3.5].map(r => <button key={r} className={...}>{r}+ <Star /></button>)}
//   </div>

//   {/* Delivery time filter */}
//   <select className="...">
//     <option value="">Any Time</option>
//     <option value="30">Under 30 min</option>
//     <option value="45">Under 45 min</option>
//     <option value="60">Under 60 min</option>
//   </select>

//   {/* Clear all filter button — only shows when filters active */}
//   {hasFilters && <button onClick={dispatch(clearFilters())}><X /> Clear</button>}
// </div>

// Behavior: On change, dispatch setFilters + fetchRestaurants with updated params
```

### File 6.6: `src/components/restaurant/RestaurantCategories.jsx`

```jsx
// Props:
// {
//   categories: string[]
//   selected: string | null
//   onSelect: (category: string | null) => void
// }

// Layout: Horizontally scrollable row of category buttons (overflow-x-auto, no scrollbar)
// Each button: px-4 py-2 rounded-full whitespace-nowrap
//   selected: bg-primary text-white
//   default: bg-surface-muted hover:bg-border text-foreground
// "All" button as first item (selected = null)
```

### File 6.7: `src/components/restaurant/RestaurantHeader.jsx`

```jsx
// Props:
// {
//   restaurant: { name, image, cuisine, rating, deliveryTime, address, hours, minOrder, isOpen }
//   reviewCount?: number
// }

// Layout (full-width, below navbar):
// <div className="relative h-64 md:h-80 overflow-hidden">
//   <img src={image} alt={name} className="w-full h-full object-cover" />
//   <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
//   <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
//     <h1 className="font-display text-4xl md:text-5xl">{name}</h1>
//     <p className="text-white/80 text-lg">{cuisine}</p>
//     <div className="flex items-center gap-4 mt-2 text-sm">
//       <span className="flex items-center gap-1"><Star weight="fill" className="text-warning" /> {rating} ({reviewCount} reviews)</span>
//       <span>•</span>
//       <span>{deliveryTime} min</span>
//       <span>•</span>
//       <span>{minOrder ? `Min order ${formatCurrency(minOrder)}` : ''}</span>
//     </div>
//     {isOpen
//       ? <span className="inline-block mt-2 px-3 py-1 bg-success text-white text-xs rounded-full">Open Now</span>
//       : <span className="inline-block mt-2 px-3 py-1 bg-destructive text-white text-xs rounded-full">Closed</span>
//     }
//   </div>
// </div>
```

### File 6.8: `src/pages/HomePage.jsx`

```jsx
// Layout sections (top to bottom):

// SECTION 1: Hero
// <section className="relative min-h-[85vh] flex items-center">
//   {/* Background: gradient + food image overlay */}
//   <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/90 via-primary/80 to-primary-light/60" />
//   <div className="absolute inset-0 bg-[url('hero-image.jpg')] bg-cover bg-center mix-blend-overlay opacity-30" />
//   <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-20 w-full">
//     <div className="max-w-2xl">
//       <motion.div {...fadeInUp}>
//         <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-full mb-4 uppercase tracking-wider">
//           Fine Dining • Fast Delivery
//         </span>
//         <h1 className="font-display text-5xl md:text-7xl text-white leading-[0.95] mb-4">
//           Delicious food,<br />delivered to your door
//         </h1>
//         <p className="text-white/80 text-lg md:text-xl mb-8 max-w-lg">
//           Order from the best local restaurants with easy online ordering and live tracking.
//         </p>
//         <div className="flex gap-4 flex-wrap">
//           <Button size="lg" icon={Storefront} onClick={() => navigate('/restaurants')}>Browse Restaurants</Button>
//           <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={() => navigate('/menu')}>Explore Menu</Button>
//         </div>
//       </motion.div>
//     </div>
//   </div>
// </section>

// SECTION 2: "Why FoodHub?" — Features
// <section className="py-20 bg-white">
//   <div className="max-w-7xl mx-auto px-4 md:px-8">
//     <h2 className="font-display text-3xl md:text-4xl text-center mb-4">Why FoodHub?</h2>
//     <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">We make food ordering simple, fast, and delightful.</p>
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//       {features.map(f => <FeatureCard key={f.title} {...f} />)}
//     </div>
//   </div>
// </section>

// FeatureCard props: { icon: PhosphorIcon, title: string, description: string }
// Layout: text-center, icon in primary-light circle, h3, p

// SECTION 3: Popular Restaurants
// <section className="py-20 bg-surface-bg">
//   <div className="max-w-7xl mx-auto px-4 md:px-8">
//     <div className="flex items-end justify-between mb-8">
//       <div>
//         <h2 className="font-display text-3xl md:text-4xl">Popular Restaurants</h2>
//         <p className="text-muted-foreground mt-1">Top-rated places near you</p>
//       </div>
//       <Link to="/restaurants" className="text-primary font-semibold hover:underline flex items-center gap-1">
//         View All <ArrowRight />
//       </Link>
//     </div>
//     <RestaurantList /> (with default limit=8, no pagination — just top 8)
//   </div>
// </section>

// SECTION 4: CTA Banner
// <section className="py-16 bg-primary">
//   <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
//     <h2 className="font-display text-3xl md:text-4xl text-white mb-4">Ready to order?</h2>
//     <p className="text-white/80 mb-8 max-w-md mx-auto">Hungry? We've got you covered. Browse restaurants and get food delivered in minutes.</p>
//     <Button size="lg" variant="secondary" onClick={() => navigate('/restaurants')}>Get Started</Button>
//   </div>
// </section>

// States:
//   restaurants-loading → section shows Loader variant="card" count={4}
//   restaurants-error → section shows ErrorState
//   restaurants-empty → section shows EmptyState
```

### File 6.9: `src/pages/RestaurantListPage.jsx`

```jsx
// Layout:
// <motion.div {...pageTransition} className="max-w-7xl mx-auto px-4 md:px-8 py-8">
//   <h1 className="font-display text-3xl md:text-4xl mb-6">Restaurants</h1>
//   <RestaurantSearch value={search} onChange={handleSearch} />
//   <RestaurantFilters />  (cuisine, rating, delivery time)
//   {hasActiveFilters && <p className="text-sm text-muted-foreground mb-4">{total} restaurants found</p>}
//   <RestaurantList />
//   <Pagination currentPage={page} totalPages={pages} onPageChange={handlePageChange} />
// </motion.div>

// Behavior:
// - URL query params sync: ?search=...&cuisine=...&rating=...&deliveryTime=...&page=...
// - On mount: read URL params → dispatch setSearch/setFilters → dispatch fetchRestaurants
// - On filter change: update URL params, reset page to 1, fetch
// - On page change: update URL, fetch, scroll to top

// States: same as RestaurantList (loading/empty/error/data)
```

### File 6.10: `src/pages/RestaurantDetailPage.jsx`

```jsx
// Layout:
// <motion.div {...pageTransition}>
//   <RestaurantHeader restaurant={selected} reviewCount={reviews.length} />
//   <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
//     <div className="flex gap-8">
//       {/* Main: Menu */}
//       <div className="flex-1">
//         <h2 className="font-display text-2xl mb-6">Menu</h2>
//         <MenuList /> (filtered by restaurant._id)
//       </div>

//       {/* Sidebar: Order summary (sticky) — show when cart has items from this restaurant */}
//       {cartHasItems && cart.restaurantId === restaurantId &&
//         <div className="hidden lg:block w-80 shrink-0">
//           <div className="sticky top-24 bg-white border border-border rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-card)]">
//             <h3 className="font-semibold mb-4">Your Order</h3>
//             {cart.items.map(item => <MiniCartItem key={item.menuItemId} {...item} />)}
//             <hr className="my-4" />
//             <div className="flex justify-between font-semibold">
//               <span>Total</span><span>{formatCurrency(cart.total)}</span>
//             </div>
//             <Button className="w-full mt-4" onClick={() => navigate('/cart')}>View Cart</Button>
//           </div>
//         </div>
//       }
//     </div>
//   </div>
// </motion.div>

// Behavior:
// - On mount: dispatch fetchRestaurantById(id) + fetchMenuItems({ restaurantId: id })
// - URL: /restaurants/:id (useParams)

// States:
//   loading → RestaurantSkeleton for header + Loader for menu
//   error  → ErrorState
//   not found → EmptyState "Restaurant not found"
//   data   → full page
```

---

## Step 7: Menu Pages

### File 7.1: `src/services/menuService.js`

```js
import api from './api'

export const menuService = {
  getAll: (params) => api.get('/menu', { params }),
  getByRestaurant: (restaurantId) => api.get(`/menu/restaurant/${restaurantId}`),
  getById: (id) => api.get(`/menu/${id}`),
}
```

### File 7.2: `src/components/menu/MenuCard.jsx`

```jsx
// Props:
// {
//   item: {
//     _id: string
//     name: string
//     description: string
//     price: number
//     image: string
//     category: string
//     isVegetarian?: boolean
//     isAvailable?: boolean
//     restaurantId: string
//     restaurantName: string
//   }
//   onClick?: () => void     // opens detail
//   showAddToCart?: boolean  // default true — shows AddToCartButton inline
// }

// Layout:
// <motion.div variants={cardHover} initial="rest" whileHover="hover" className="...">
//   <div className="relative">
//     <img src={image} alt={name} className="w-full h-44 object-cover rounded-t-[var(--radius-lg)]" />
//     {isVegetarian && <span className="absolute top-3 left-3 bg-success text-white text-xs px-2 py-0.5 rounded-full">Veg</span>}
//     {!isAvailable && <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-t-[var(--radius-lg)]">
//       <span className="text-foreground font-semibold">Currently Unavailable</span>
//     </div>}
//   </div>
//   <div className="p-4">
//     <h3 className="font-semibold">{name}</h3>
//     <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{description}</p>
//     <div className="flex items-center justify-between mt-3">
//       <span className="text-primary font-bold text-lg">{formatCurrency(price)}</span>
//       {showAddToCart && isAvailable && <AddToCartButton item={item} />}
//     </div>
//   </div>
// </motion.div>

// States:
//   available   → full card with AddToCartButton
//   unavailable → gray overlay, no add to cart
//   loading     → MenuSkeleton
```

### File 7.3: `src/components/menu/MenuList.jsx`

```jsx
// Props:
// {
//   restaurantId?: string          // if provided, only show items from this restaurant
//   category?: string              // if provided, filter by category
//   showCategories?: boolean       // default false — group by category with headers
// }

// Behavior:
// - On mount: dispatch fetchMenuItems({ restaurantId, search })
// - If showCategories: render in sections with category headers <h3>
// - Grid: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6

// States: loading/empty/error/data (same pattern as RestaurantList)
```

### File 7.4: `src/components/menu/MenuCategory.jsx`

```jsx
// Props:
// {
//   category: string
//   items: MenuItem[]
// }

// Layout:
// <div className="mb-8">
//   <h3 className="font-display text-xl mb-4 flex items-center gap-2">
//     {category}
//     <span className="text-muted-foreground text-sm font-body">({items.length})</span>
//   </h3>
//   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//     {items.map(item => <MenuCard key={item._id} item={item} />)}
//   </div>
// </div>
```

### File 7.5: `src/components/menu/MenuSearch.jsx`

```jsx
// Same pattern as RestaurantSearch but searches menu items
// Props: { value, onChange }
// Placeholder: "Search dishes..."
```

### File 7.6: `src/components/menu/AddToCartButton.jsx`

```jsx
// Props:
// {
//   item: MenuItem (must include _id, name, price, image, restaurantId, restaurantName)
//   variant?: 'icon' | 'full'  // icon = just + button for grids, full = stepper for detail
//   size?: 'sm' | 'md'
// }

// Behavior:
// - Read cart state from Redux
// - If item is not in cart:
//     Show "Add" button (or + icon for icon variant)
//     On click: dispatch addToCart(item), show toast "Added {name} to cart"
//     Conflicting restaurant check: if cart has items from different restaurant, show confirm dialog
// - If item IS in cart (quantity > 0):
//     Show stepper: [-] [quantity] [+]
//     [-] → dispatch updateQuantity({ menuItemId, quantity: qty-1 }) or removeFromCart if qty reaches 0
//     [+] → dispatch updateQuantity({ menuItemId, quantity: qty+1 })

// Full variant layout:
// <div className="flex items-center gap-2">
//   <button className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-surface-muted">
//     <Minus className="w-4 h-4" />
//   </button>
//   <span className="w-8 text-center font-semibold">{quantity}</span>
//   <button className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-hover">
//     <Plus className="w-4 h-4" />
//   </button>
// </div>
```

### File 7.7: `src/pages/MenuPage.jsx`

```jsx
// Layout:
// <motion.div {...pageTransition} className="max-w-7xl mx-auto px-4 md:px-8 py-8">
//   <h1 className="font-display text-3xl md:text-4xl mb-6">Our Menu</h1>
//   <MenuSearch value={search} onChange={handleSearch} />
//   <MenuList showCategories={true} />
// </motion.div>

// Behavior:
// - On mount: fetch all menu items
// - Search filters locally (or re-fetch with query)
```

---

## Step 8: Cart + Checkout

### File 8.1: `src/services/cartService.js`

```js
import api from './api'

export const cartService = {
  getCart: () => api.get('/cart'),
  addItem: (data) => api.post('/cart/add', data),
  updateItem: (menuItemId, data) => api.put(`/cart/update/${menuItemId}`, data),
  removeItem: (menuItemId) => api.delete(`/cart/remove/${menuItemId}`),
  clearCart: () => api.delete('/cart/clear'),
  syncCart: (items) => api.put('/cart/sync', { items }),
}
```

### File 8.2: `src/services/paymentService.js`

```js
import api from './api'

export const paymentService = {
  createCheckout: (data) => api.post('/payments/checkout', data),
  verifyPayment: (data) => api.post('/payments/verify', data),
}
```

### File 8.3: `src/hooks/useCart.js`

```js
// Custom hook
// Returns: { items, subtotal, total, itemCount, loading, addToCart, updateQuantity, removeFromCart, clearCart, applyCoupon }
// Wraps Redux dispatch calls
// addToCart: checks conflicting restaurant → shows confirm dialog → dispatches
```

### File 8.4: `src/components/cart/CartItem.jsx`

```jsx
// Props:
// {
//   item: { menuItemId, name, price, quantity, image, restaurantName }
//   onQuantityChange: (menuItemId, quantity) => void  // quantity=0 → remove
//   onRemove: (menuItemId) => void
// }

// Layout: Horizontal card
// <div className="flex gap-4 p-4 bg-white border border-border rounded-[var(--radius-md)]">
//   <img src={image} alt={name} className="w-20 h-20 rounded-lg object-cover shrink-0" />
//   <div className="flex-1 min-w-0">
//     <h4 className="font-semibold truncate">{name}</h4>
//     <p className="text-muted-foreground text-sm">{restaurantName}</p>
//     <div className="flex items-center justify-between mt-2">
//       <span className="text-primary font-bold">{formatCurrency(price)}</span>
//       <AddToCartButton item={item} variant="full" size="sm" />
//     </div>
//   </div>
// </div>

// States:
//   - quantity updating → show spinner on stepper
//   - removing → item slides out (framer-motion)
```

### File 8.5: `src/components/cart/CartList.jsx`

```jsx
// Props: none (reads from Redux)

// Layout:
// <div className="space-y-4">
//   {items.map(item => <CartItem key={item.menuItemId} item={item} />)}
// </div>

// States:
//   loading  → Loader variant="card" count={3}
//   empty    → <EmptyCart />
//   data     → list of CartItems
```

### File 8.6: `src/components/cart/EmptyCart.jsx`

```jsx
// Props: none

// Layout:
// <EmptyState
//   icon={ShoppingCart}
//   title="Your cart is empty"
//   description="Looks like you haven't added anything to your cart yet. Browse restaurants and find something delicious!"
//   action={{ label: "Browse Restaurants", onClick: () => navigate('/restaurants') }}
// />
```

### File 8.7: `src/components/cart/CartSummary.jsx`

```jsx
// Props: none (reads from Redux)

// Layout: Summary card (sticky sidebar)
// <div className="bg-white border border-border rounded-[var(--radius-lg)] p-6">
//   <h3 className="font-semibold text-lg mb-4">Bill Details</h3>
//   <div className="space-y-3 text-sm">
//     <div className="flex justify-between">
//       <span className="text-muted-foreground">Item Total</span>
//       <span>{formatCurrency(subtotal)}</span>
//     </div>
//     <div className="flex justify-between">
//       <span className="text-muted-foreground">Delivery Fee</span>
//       <span>{formatCurrency(deliveryFee)}</span>
//     </div>
//     <div className="flex justify-between">
//       <span className="text-muted-foreground">Tax (5%)</span>
//       <span>{formatCurrency(tax)}</span>
//     </div>
//     {discount > 0 &&
//       <div className="flex justify-between text-success">
//         <span>Discount ({coupon.code})</span>
//         <span>-{formatCurrency(discount)}</span>
//       </div>
//     }
//     <hr />
//     <div className="flex justify-between text-lg font-bold">
//       <span>To Pay</span>
//       <span>{formatCurrency(total)}</span>
//     </div>
//   </div>
// </div>
```

### File 8.8: `src/components/cart/Coupon.jsx`

```jsx
// Props:
// {
//   onApply: (code: string) => void
// }

// Layout: Flex row input + button
// <div className="flex gap-2">
//   <input placeholder="Enter coupon code" className="..." />
//   <Button variant="outline" onClick={handleApply}>Apply</Button>
// </div>

// Behavior:
// - onApply validates code (could be API call or local check)
// - Shows success/error toast
// - Applied coupon shows as chip with X to remove
```

### File 8.9: `src/components/cart/DeliveryAddress.jsx`

```jsx
// Props:
// {
//   selectedAddress: Address | null
//   addresses: Address[]
//   onSelect: (address: Address) => void
// }

// Layout:
// <div className="space-y-3">
//   <h3 className="font-semibold">Delivery Address</h3>
//   {addresses.map(addr =>
//     <label key={addr._id} className="flex items-start gap-3 p-4 border border-border rounded-[var(--radius-md)] cursor-pointer hover:border-primary transition-colors">
//       <input type="radio" name="address" checked={selectedAddress?._id === addr._id} onChange={() => onSelect(addr)} />
//       <div>
//         <p className="font-semibold">{addr.label || addr.street}</p>
//         <p className="text-muted-foreground text-sm">{addr.street}, {addr.city}, {addr.state} {addr.zipCode}</p>
//         {addr.phone && <p className="text-muted-foreground text-sm">{addr.phone}</p>}
//       </div>
//     </label>
//   )}
//   <Button variant="outline" icon={Plus} onClick={openAddAddress}>Add New Address</Button>
// </div>
```

### File 8.10: `src/pages/CartPage.jsx`

```jsx
// Layout:
// <motion.div {...pageTransition} className="max-w-7xl mx-auto px-4 md:px-8 py-8">
//   <h1 className="font-display text-3xl md:text-4xl mb-8">Your Cart</h1>
//   {cartIsEmpty ? <EmptyCart /> :
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//       {/* Left: Cart items + coupon */}
//       <div className="lg:col-span-2 space-y-6">
//         <CartList />
//         <Coupon />
//       </div>

//       {/* Right: Summary + checkout CTA */}
//       <div className="space-y-6">
//         <CartSummary />
//         <Button size="lg" className="w-full" onClick={() => navigate('/checkout')}>
//           Proceed to Checkout
//         </Button>
//       </div>
//     </div>
//   }
// </motion.div>

// States:
//   loading → Loader
//   empty → EmptyCart
//   data → full cart layout
```

### File 8.11: `src/pages/CheckoutPage.jsx`

```jsx
// Layout: Multi-step within one page (or tabs)
// Step 1: Address selection
// Step 2: Payment

// <motion.div {...pageTransition} className="max-w-4xl mx-auto px-4 md:px-8 py-8">
//   <h1 className="font-display text-3xl md:text-4xl mb-8">Checkout</h1>
//
//   <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//     <div className="lg:col-span-2 space-y-8">
//       {/* Address Section */}
//       <section>
//         <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
//         <DeliveryAddress selectedAddress={selected} addresses={user.addresses} onSelect={setSelected} />
//       </section>
//
//       {/* Payment Section */}
//       <section>
//         <h2 className="text-lg font-semibold mb-4">Payment</h2>
//         <div className="p-6 border border-border rounded-[var(--radius-lg)]">
//           {/* Stripe Card Element or payment method selector */}
//           <div id="card-element" />
//           {paymentError && <p className="text-destructive text-sm mt-2">{paymentError}</p>}
//         </div>
//       </section>
//     </div>
//
//     {/* Sidebar: Order Summary + Place Order */}
//     <div className="space-y-6">
//       <CartSummary />
//       <Button size="lg" className="w-full" loading={isProcessing} onClick={handlePlaceOrder}>
//         Place Order — {formatCurrency(total)}
//       </Button>
//     </div>
//   </div>
// </motion.div>

// handlePlaceOrder flow:
// 1. Validate address selected
// 2. Create Stripe checkout session → POST /api/payments/checkout
// 3. If online payment: redirect to Stripe, then verify on return
// 4. If COD: create order directly → POST /api/orders/create
// 5. On success: clear cart, navigate to /orders/:orderId (tracking)
// 6. On failure: show toast error

// States:
//   address-not-selected → warning text, button disabled
//   payment-processing → button loading
//   payment-success → redirect to order tracking
//   payment-error → error message + toast
//   cart-empty-on-arrival → redirect to /cart (edge case)
```

---

## Step 9: Orders + Tracking

### File 9.1: `src/services/orderService.js`

```js
import api from './api'

export const orderService = {
  create: (data) => api.post('/orders/create', data),
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
}
```

### File 9.2: `src/hooks/useSocket.js`

```js
// Custom hook — connects to Socket.IO, manages room join/leave
// Returns: { socket, isConnected, joinOrderRoom, leaveOrderRoom }
// On mount: connect to SOCKET_URL with auth token
// On unmount: disconnect
// joinOrderRoom(orderId): socket.emit('join', { room: `order:${orderId}` })
// leaveOrderRoom(orderId): socket.emit('leave', { room: `order:${orderId}` })
// Listens for 'orderUpdate' event → dispatch updateOrderStatus
// Listens for 'notification' event → dispatch addNotification
```

### File 9.3: `src/socket/socket.js`

```js
import { io } from 'socket.io-client'
import { SOCKET_URL } from '../utils/constants'

let socket = null

export const getSocket = () => {
  if (!socket) {
    const token = localStorage.getItem('token')
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    })
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
```

### File 9.4: `src/components/order/OrderCard.jsx`

```jsx
// Props:
// {
//   order: {
//     _id: string
//     restaurantName: string
//     items: [{ name, quantity, price }]
//     totalAmount: number
//     status: string     // 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'
//     createdAt: string
//   }
//   onClick?: () => void
// }

// Layout:
// <div onClick={onClick} className="bg-white border border-border rounded-[var(--radius-lg)] p-5 hover:shadow-[var(--shadow-card-hover)] transition-shadow cursor-pointer">
//   <div className="flex items-start justify-between mb-3">
//     <div>
//       <h4 className="font-semibold">{restaurantName}</h4>
//       <p className="text-muted-foreground text-sm">{new Date(createdAt).toLocaleDateString()}</p>
//     </div>
//     <OrderStatus status={status} />
//   </div>
//   <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
//     {items.map(i => `${i.name} x${i.quantity}`).join(', ')}
//   </p>
//   <div className="flex justify-between items-center">
//     <span className="font-bold text-primary">{formatCurrency(totalAmount)}</span>
//     <span className="text-accent text-sm font-semibold hover:underline">View Details →</span>
//   </div>
// </div>
```

### File 9.5: `src/components/order/OrderStatus.jsx`

```jsx
// Props:
// {
//   status: string
// }

// Renders a colored badge/chip:
// <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
//   <StatusDot /> {statusLabel}
// </span>

// Color mapping:
// pending         → bg-warning-light text-warning
// confirmed       → bg-accent-50 text-accent
// preparing       → bg-accent-50 text-accent
// out_for_delivery → bg-primary-50 text-primary
// delivered       → bg-success-light text-success
// cancelled       → bg-red-50 text-destructive
```

### File 9.6: `src/components/order/OrderTimeline.jsx`

```jsx
// Props:
// {
//   status: string
//   timestamps: { confirmed?, preparing?, out_for_delivery?, delivered? }
// }

// Layout: Vertical stepper (left border line with circles)
// <div className="relative pl-8">
//   <div className="absolute left-3 top-1 bottom-1 w-0.5 bg-border" />
//   {steps.map(step => (
//     <div className="relative mb-6 last:mb-0">
//       <div className={`absolute -left-[29px] w-6 h-6 rounded-full ... ${step.active ? 'bg-primary' : 'bg-border'}`}>
//         {step.completed && <Check />}
//       </div>
//       <h5 className="font-semibold">{step.label}</h5>
//       {step.timestamp && <p className="text-sm text-muted-foreground">{step.timestamp}</p>}
//     </div>
//   ))}
// </div>

// Steps (ordered, each can be active/inactive/completed):
// 1. Order Placed
// 2. Confirmed
// 3. Preparing
// 4. Out for Delivery
// 5. Delivered
```

### File 9.7: `src/components/order/OrderTracking.jsx`

```jsx
// Props:
// {
//   orderId: string
// }

// Behavior:
// - On mount: joinOrderRoom(orderId) via useSocket
// - Listens for order status updates via socket → updates Redux + shows toast
// - On unmount: leaveOrderRoom(orderId)

// Layout:
// <div className="space-y-6">
//   {/* Map placeholder — integrates Google Maps or Mapbox for real tracking */}
//   <div className="h-64 bg-surface-muted rounded-[var(--radius-lg)] flex items-center justify-center">
//     <MapPin className="w-12 h-12 text-muted-foreground" />
//     <p className="text-muted-foreground">Live tracking map</p>
//   </div>
//
//   {/* ETA card */}
//   <div className="flex items-center gap-4 p-4 bg-accent-50 rounded-[var(--radius-lg)]">
//     <Motorcycle className="w-10 h-10 text-accent" />
//     <div>
//       <p className="font-semibold">Your order is on the way!</p>
//       <p className="text-muted-foreground text-sm">Estimated delivery: 15-20 min</p>
//     </div>
//   </div>
// </div>
```

### File 9.8: `src/pages/OrdersPage.jsx`

```jsx
// Layout:
// <motion.div {...pageTransition} className="max-w-7xl mx-auto px-4 md:px-8 py-8">
//   <h1 className="font-display text-3xl md:text-4xl mb-8">My Orders</h1>
//
//   {/* Tabs: Active | Past */}
//   <div className="flex gap-4 mb-6 border-b border-border">
//     <button className={`pb-3 font-semibold ${tab === 'active' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
//       Active Orders
//     </button>
//     <button className={`pb-3 font-semibold ${tab === 'past' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
//       Past Orders
//     </button>
//   </div>
//
//   <div className="space-y-4">
//     {filteredOrders.map(order => <OrderCard key={order._id} order={order} onClick={() => navigate(`/orders/${order._id}`)} />)}
//   </div>
// </motion.div>

// Active = status not in ['delivered', 'cancelled']
// Past = status in ['delivered', 'cancelled']

// States:
//   loading  → Loader
//   empty    → EmptyState "No orders yet"
//   active-empty → EmptyState "No active orders"
//   past-empty → EmptyState "No past orders"
```

### File 9.9: `src/pages/OrderTrackingPage.jsx`

```jsx
// Layout:
// <motion.div {...pageTransition} className="max-w-4xl mx-auto px-4 md:px-8 py-8">
//   <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-muted-foreground hover:text-foreground mb-4">
//     <ArrowLeft /> Back
//   </button>
//
//   <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//     <div className="lg:col-span-2 space-y-6">
//       <OrderTracking orderId={id} />
//
//       {/* Order items recap */}
//       <div className="bg-white border border-border rounded-[var(--radius-lg)] p-6">
//         <h3 className="font-semibold mb-4">Order Items</h3>
//         <div className="space-y-3">
//           {order.items.map(item => (
//             <div className="flex justify-between text-sm">
//               <span>{item.name} x{item.quantity}</span>
//               <span>{formatCurrency(item.price * item.quantity)}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//
//     <div className="space-y-6">
//       <OrderTimeline status={order.status} timestamps={order.timestamps} />
//       {order.status !== 'delivered' && order.status !== 'cancelled' &&
//         <Button variant="destructive" className="w-full" onClick={handleCancel}>
//           Cancel Order
//         </Button>
//       }
//     </div>
//   </div>
// </motion.div>

// Behavior:
// - On mount: dispatch fetchOrderById(id)
// - Socket room join for live updates
// - Cancel button: confirm dialog → dispatch cancelOrder → toast
```

---

## Step 10: Profile

### File 10.1: `src/components/profile/ProfileCard.jsx`

```jsx
// Props:
// {
//   user: { name, email, phone, createdAt, avatar? }
// }
// Layout: Centered card with avatar circle, name, email, member since
```

### File 10.2: `src/components/profile/EditProfile.jsx`

```jsx
// Form: React Hook Form + Zod
// Fields: name, email, phone
// Submit: PUT /api/auth/me (add this endpoint to authService)
// States: default, loading, success-toast, error
```

### File 10.3: `src/components/profile/AddressList.jsx`

```jsx
// Props: reads from Redux auth.user.addresses
// Layout: List of address cards with edit/delete buttons
// Add new: opens AddressForm in modal
```

### File 10.4: `src/components/profile/AddressForm.jsx`

```jsx
// Props: { address? (for edit), onSave, onCancel }
// Form: React Hook Form + Zod
// Fields: label (Home/Work/Other), street, city, state, zipCode, phone
// Validations: all required
// States: default, loading, error, success
```

### File 10.5: `src/components/profile/ChangePassword.jsx`

```jsx
// Form: React Hook Form + Zod
// Fields: currentPassword, newPassword, confirmNewPassword
// Validations: newPassword min 8, 1 upper, 1 number, 1 special; confirm must match
// Submit: PUT /api/auth/me (password section)
// States: default, loading, error, success-toast
```

### File 10.6: `src/pages/ProfilePage.jsx`

```jsx
// Layout: Tabs
// <motion.div {...pageTransition} className="max-w-4xl mx-auto px-4 md:px-8 py-8">
//   <h1 className="font-display text-3xl md:text-4xl mb-8">My Profile</h1>
//
//   <div className="flex gap-4 mb-6 border-b border-border">
//     {['profile', 'addresses', 'password'].map(tab => (
//       <button key={tab} className={...}>{tabLabel}</button>
//     ))}
//   </div>
//
//   {tab === 'profile' && <EditProfile />}
//   {tab === 'addresses' && <AddressList />}
//   {tab === 'password' && <ChangePassword />}
// </motion.div>
```

---

## Step 11: Routing Integration

### File 11.1: `src/routes/AppRoutes.jsx` (rewrite)

```jsx
import { Routes, Route } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import ProtectedRoute from '../components/layout/ProtectedRoute'

// Lazy load pages for code splitting
import { lazy, Suspense } from 'react'
const HomePage = lazy(() => import('../pages/HomePage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const RegisterPage = lazy(() => import('../pages/RegisterPage'))
const RestaurantListPage = lazy(() => import('../pages/RestaurantListPage'))
const RestaurantDetailPage = lazy(() => import('../pages/RestaurantDetailPage'))
const MenuPage = lazy(() => import('../pages/MenuPage'))
const CartPage = lazy(() => import('../pages/CartPage'))
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'))
const OrdersPage = lazy(() => import('../pages/OrdersPage'))
const OrderTrackingPage = lazy(() => import('../pages/OrderTrackingPage'))
const ProfilePage = lazy(() => import('../pages/ProfilePage'))

function AppRoutes() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader variant="page" /></div>}>
      <Routes>
        {/* Public routes with layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/restaurants" element={<RestaurantListPage />} />
          <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
          <Route path="/menu" element={<MenuPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderTrackingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* Public routes without layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
```

### File 11.2: `src/main.jsx` (modify)

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { store } from './redux/store'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" />
      </BrowserRouter>
    </Provider>
  </StrictMode>
)
```

### File 11.3: `src/App.jsx` (modify)

```jsx
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCurrentUser } from './redux/authSlice'
import AppRoutes from './routes/AppRoutes'
import Loader from './components/common/Loader'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, loading } = useSelector(s => s.auth)

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCurrentUser())
    }
  }, [])

  if (loading) return <Loader variant="page" />
  return <AppRoutes />
}

export default App
```

---

## Step 12: Reviews (basic)

### File 12.1: `src/services/reviewService.js`

```js
import api from './api'

export const reviewService = {
  getByRestaurant: (restaurantId) => api.get(`/reviews/restaurant/${restaurantId}`),
  create: (data) => api.post('/reviews', data),
}
```

### File 12.2: `src/components/review/ReviewForm.jsx`

```jsx
// Props:
// {
//   restaurantId: string
//   orderId?: string       // if reviewing after an order
//   onSuccess?: () => void
// }

// Form: React Hook Form + Zod
// Fields: rating (star selector component), comment (textarea, min 10 chars)
// Submit: POST /api/reviews, then toast success, call onSuccess
// States: default, loading, error, success

// Layout: Card with star selector + textarea + submit button
```

---

## File Dependency Map

```
main.jsx
├── index.css (Tailwind)
├── App.jsx
│   ├── redux/store.js
│   │   ├── redux/authSlice.js
│   │   ├── redux/cartSlice.js
│   │   ├── redux/restaurantSlice.js
│   │   ├── redux/menuSlice.js
│   │   ├── redux/orderSlice.js
│   │   ├── redux/notificationSlice.js
│   │   └── redux/reviewSlice.js
│   ├── routes/AppRoutes.jsx
│   │   ├── components/layout/MainLayout.jsx
│   │   │   ├── components/layout/Navbar.jsx
│   │   │   └── components/layout/Footer.jsx
│   │   ├── components/layout/ProtectedRoute.jsx
│   │   └── pages/* (all pages)
│   └── components/common/Loader.jsx
├── Provider (react-redux)
├── BrowserRouter
└── Toaster (react-hot-toast)

Services depend on:
  services/api.js → utils/constants.js

All pages depend on:
  utils/icons.js, utils/motion.js, utils/toast.js
  hooks/useAuth.js
  components/common/Button.jsx, Input.jsx, Loader.jsx, Modal.jsx

Auth pages: services/authService.js, redux/authSlice.js
Restaurant pages: services/restaurantService.js, redux/restaurantSlice.js
Menu pages: services/menuService.js, redux/menuSlice.js, hooks/useCart.js
Cart pages: services/cartService.js, redux/cartSlice.js, hooks/useCart.js
Checkout: services/paymentService.js, services/orderService.js
Orders/Tracking: services/orderService.js, socket/socket.js, hooks/useSocket.js
Profile: services/authService.js
Reviews: services/reviewService.js
```

---

## Acceptance Checklist

- [ ] `npm run dev` starts without errors
- [ ] Tailwind classes render correctly
- [ ] User can register with OTP verification
- [ ] User can login and JWT is stored + attached to requests
- [ ] Token refresh works on 401 responses
- [ ] Protected routes redirect to `/login?redirect=...`
- [ ] Login/Register redirect back to intended page after auth
- [ ] Home page renders hero + features + popular restaurants from API
- [ ] Restaurant list supports search, cuisine filter, rating filter, and pagination
- [ ] Restaurant detail shows cover image + full menu grouped by category
- [ ] Menu items can be added to cart (with quantity stepper after adding)
- [ ] Adding from different restaurant shows confirmation dialog
- [ ] Cart page shows items, coupon input, and bill summary
- [ ] Checkout captures address + payment + places order
- [ ] After placing order, redirects to tracking page
- [ ] Order tracking shows timeline + live status updates via Socket.IO
- [ ] Order history shows active/past orders with correct status badges
- [ ] Profile page allows editing name/email/phone/addresses/password
- [ ] All loading states show skeleton loaders (not text)
- [ ] All empty states show illustration + description + CTA
- [ ] All errors show toast notifications
- [ ] All icons are Phosphor vectors (no emojis in UI)
- [ ] No inline `style={{}}` — all styling via Tailwind classes
- [ ] Responsive on 375px (mobile), 768px (tablet), 1280px (desktop)
- [ ] Touch interactions have press feedback (active:scale-95)
- [ ] Page transitions are smooth (framer-motion)
- [ ] No hardcoded data — all content from backend API
- [ ] No console errors or warnings
```

