# Phase 3 — Dine-Out + Extras (Agent-Ready Spec)

> **Status:** Planned (after Phase 2 complete)
> **Features:** 5 | **Est. Files:** ~20

---

## Prerequisites

- Phase 1 complete (core customer flow, Redux, API layer)
- Phase 2 complete (admin dashboard)

---

## Build Order

Each feature is independent — can be built in any order.

```
Feature 1: Table Reservations      (5 files) → depends on Phase 1
Feature 2: AI Menu Suggestions     (2 files) → depends on Phase 1
Feature 3: Full Review System      (4 files) → depends on Phase 1
Feature 4: Support Tickets         (5 files) → depends on Phase 1
Feature 5: Notification Center     (4 files) → depends on Phase 1
```

---

## Feature 1: Table Reservations (Dine-Out)

### File 1.1: `src/services/reservationService.js`

```js
import api from './api'

export const reservationService = {
  create: (data) => api.post('/reservations', data),
  getAll: () => api.get('/reservations'),
  getByRestaurant: (restaurantId) => api.get(`/reservations/restaurant/${restaurantId}`),
  getById: (id) => api.get(`/reservations/${id}`),
  update: (id, data) => api.put(`/reservations/${id}`, data),
  updateStatus: (id, status) => api.put(`/reservations/${id}/status`, { status }),
  cancel: (id) => api.put(`/reservations/${id}/cancel`),
}
```

### File 1.2: `src/redux/reservationSlice.js`

```js
// State shape:
// {
//   list: [],
//   selected: null,
//   loading: boolean,
//   error: null | string,
// }

// Thunks: fetchReservations, fetchReservationById, createReservation, cancelReservation
```

### File 1.3: `src/components/reservation/ReservationCard.jsx`

```jsx
// Props:
// {
//   reservation: {
//     _id, restaurantName, date, time, partySize, status,
//     specialRequests?, createdAt
//   }
//   onClick?: () => void
// }

// Layout: card with restaurant name, date/time, party size icon, status badge
// States: default, cancelled (grayed out)
```

### File 1.4: `src/pages/BookReservationPage.jsx`

```jsx
// Route: /restaurants/:id/reserve
// Accessible from RestaurantDetailPage via "Book a Table" button

// Layout:
// <div className="max-w-lg mx-auto ...">
//   <h1 className="font-display text-3xl mb-2">Book a Table</h1>
//   <p className="text-muted-foreground mb-6">{restaurant.name}</p>

//   Form (React Hook Form + Zod):
//     date: required, future date only (min: today)
//     time: required, select from available slots (dropdown or time picker)
//     partySize: required, number 1-20
//     specialRequests: optional, textarea
//
//   Submit: POST /api/reservations
//   Success: toast + navigate to /reservations
//
// States: default, loading, error, success
```

### File 1.5: `src/pages/ReservationsPage.jsx`

```jsx
// Route: /reservations (protected)

// Layout: Same pattern as OrdersPage
// Tabs: Upcoming | Past
// List of ReservationCards
// Click navigates to reservation detail (or expands inline)
//
// States: loading, empty, error, data
```

---

## Feature 2: AI Menu Suggestions

### File 2.1: `src/services/aiService.js`

```js
import api from './api'

export const aiService = {
  getSuggestions: () => api.get('/ai/suggestions'),
}
```

### File 2.2: `src/components/menu/AISuggestions.jsx`

```jsx
// Props: none (fetches from API)

// Layout: Horizontal scrollable row of suggested menu items
// <section className="py-8">
//   <div className="flex items-center gap-2 mb-4">
//     <Sparkle className="w-5 h-5 text-primary" />
//     <h3 className="font-semibold">Recommended for You</h3>
//   </div>
//   <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
//     {suggestions.map(item => <AISuggestionCard key={item._id} item={item} />)}
//   </div>
// </section>

// Card: compact MenuCard variant with "Why?" tooltip (AI reasoning)
// States: loading (skeleton cards), empty ("Order more to get suggestions!"), error, data

// Insert this component into HomePage between sections 2 and 3
// Only show when user is authenticated
```

---

## Feature 3: Full Review System

### File 3.1: `src/services/reviewService.js` (expand from Phase 1)

```js
// Add update and delete:
update: (id, data) => api.put(`/reviews/${id}`, data),
delete: (id) => api.delete(`/reviews/${id}`),
```

### File 3.2: `src/components/review/RatingStars.jsx`

```jsx
// Props:
// {
//   rating: number           // 0-5 (can be float for display)
//   interactive?: boolean    // if true, user can click to set rating
//   onChange?: (rating: number) => void
//   size?: 'sm' | 'md' | 'lg'
// }

// Behavior:
// - Display: show filled/half/empty stars based on rating
// - Interactive: hover shows preview, click sets rating, keyboard accessible
// - Accessible: aria-label="Rating: {rating} out of 5"

// Implementation: 5 Star icons in a row
// Filled = Star weight="fill" className="text-warning"
// Empty = Star className="text-border"
```

### File 3.3: `src/components/review/ReviewSummary.jsx`

```jsx
// Props:
// {
//   reviews: Review[]
// }

// Layout:
// <div className="flex flex-col sm:flex-row items-start gap-6 p-6 bg-white border border-border rounded-[var(--radius-lg)]">
//   {/* Average rating (large) */}
//   <div className="text-center shrink-0">
//     <p className="text-4xl font-bold">{averageRating}</p>
//     <RatingStars rating={averageRating} />
//     <p className="text-muted-foreground text-sm">{reviews.length} reviews</p>
//   </div>
//   {/* Distribution bars */}
//   <div className="flex-1 space-y-1.5">
//     {[5,4,3,2,1].map(star => (
//       <div className="flex items-center gap-2">
//         <span className="text-sm w-4">{star}</span>
//         <Star className="w-3 h-3 text-warning" weight="fill" />
//         <div className="flex-1 h-2 bg-surface-muted rounded-full overflow-hidden">
//           <div className="h-full bg-warning rounded-full" style={{ width: `${percentage}%` }} />
//         </div>
//         <span className="text-sm text-muted-foreground w-8">{count}</span>
//       </div>
//     ))}
//   </div>
// </div>
```

### File 3.4: `src/components/review/ReviewCard.jsx`

```jsx
// Props:
// {
//   review: {
//     _id, user: { name, avatar? }, rating, comment, createdAt, photos?
//   }
//   showActions?: boolean   // edit/delete for own reviews
//   onEdit?: () => void
//   onDelete?: () => void
// }

// Layout: card with user avatar, name, rating stars, date, comment, optional photos
```

### File 3.5: `src/components/review/ReviewList.jsx`

```jsx
// Props:
// {
//   restaurantId: string
// }

// Layout: map of ReviewCards with optional pagination
// States: loading, empty, error, data
```

### File 3.6: `src/pages/RestaurantReviewsPage.jsx`

```jsx
// Route: /restaurants/:id/reviews (public)

// Layout:
// <div className="max-w-4xl mx-auto ...">
//   <h1>Reviews for {restaurant.name}</h1>
//   <ReviewSummary reviews={reviews} />
//   <ReviewList restaurantId={id} />
// </div>
```

---

## Feature 4: Support Tickets

### File 4.1: `src/services/supportService.js`

```js
import api from './api'

export const supportService = {
  createTicket: (data) => api.post('/support/tickets', data),
  getTickets: () => api.get('/support/tickets'),
  getTicketById: (id) => api.get(`/support/tickets/${id}`),
  addReply: (id, data) => api.post(`/support/tickets/${id}/replies`, data),
  updateStatus: (id, status) => api.put(`/support/tickets/${id}/status`, { status }),
}
```

### File 4.2: `src/components/support/TicketCard.jsx`

```jsx
// Props:
// {
//   ticket: { _id, subject, status, category, createdAt, lastReply? }
//   onClick: () => void
// }

// Layout: card with subject, status badge, category chip, date
// States: open (green badge), in-progress (blue badge), resolved (gray badge)
```

### File 4.3: `src/components/support/TicketForm.jsx`

```jsx
// Props:
// {
//   onSubmit: (data) => Promise<void>
// }

// Form (React Hook Form + Zod):
//   subject: required, min 5 chars
//   category: required, select (Order Issue / Account / Payment / Restaurant / Other)
//   description: required, min 20 chars

// Layout: card with form fields + submit button
// States: default, loading, error
```

### File 4.4: `src/components/support/TicketReply.jsx`

```jsx
// Props:
// {
//   reply: { user: { name, role }, message, createdAt }
// }

// Layout: Chat bubble style
// User replies: right-aligned, bg-primary-light
// Admin replies: left-aligned, bg-surface-muted
// Each shows name, role badge, timestamp
```

### File 4.5: `src/pages/SupportPage.jsx`

```jsx
// Route: /support (protected)

// Layout: Two-column
// Left: Ticket list (scrollable)
// Right: Selected ticket thread or "Create New Ticket" form
//
// States: loading, empty ("No support tickets"), error, data
```

### File 4.6: `src/pages/TicketDetailPage.jsx`

```jsx
// Route: /support/:id (protected)

// Layout:
// <div className="max-w-3xl mx-auto ...">
//   <h1>{ticket.subject}</h1>
//   <span className="...">#{ticket._id.slice(-8)}</span> <TicketStatus status={ticket.status} />
//
//   {/* Thread */}
//   <div className="space-y-4 my-6">
//     {/* Original message */}
//     <TicketReply reply={{ user: ticket.user, message: ticket.description, createdAt: ticket.createdAt }} />
//     {/* Replies */}
//     {ticket.replies.map(r => <TicketReply key={r._id} reply={r} />)}
//   </div>
//
//   {/* Reply form (if ticket not resolved) */}
//   {ticket.status !== 'resolved' &&
//     <form onSubmit={handleReply}>
//       <textarea placeholder="Type your reply..." />
//       <Button type="submit">Send Reply</Button>
//     </form>
//   }
// </div>
```

---

## Feature 5: Notification Center

### File 5.1: `src/components/notification/NotificationBell.jsx`

```jsx
// Props: none (reads from Redux notification slice)

// Layout: Button with Bell icon + badge
// <button className="relative p-2 rounded-full hover:bg-surface-muted">
//   <Bell className="w-6 h-6" />
//   {unread > 0 &&
//     <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-white text-xs rounded-full flex items-center justify-center font-semibold">
//       {unread > 9 ? '9+' : unread}
//     </span>
//   }
// </button>

// On click: toggle NotificationDropdown
// Installed in: Navbar (right side) and AdminLayout header
```

### File 5.2: `src/components/notification/NotificationDropdown.jsx`

```jsx
// Props:
// {
//   isOpen: boolean
//   onClose: () => void
// }

// Layout: Dropdown card (absolute positioned, below bell)
// <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-[var(--shadow-modal)] border border-border max-h-96 overflow-y-auto z-50">
//   <div className="flex items-center justify-between p-4 border-b border-border">
//     <h3 className="font-semibold">Notifications</h3>
//     <button onClick={markAllRead} className="text-sm text-accent font-semibold">Mark all read</button>
//   </div>
//   <div className="divide-y divide-border">
//     {notifications.slice(0, 10).map(n => <NotificationItem key={n._id} notification={n} />)}
//   </div>
//   {notifications.length > 10 &&
//     <Link to="/notifications" className="block text-center p-3 text-accent text-sm font-semibold hover:bg-surface-muted">
//       View all notifications
//     </Link>
//   }
//   {notifications.length === 0 &&
//     <p className="p-8 text-center text-muted-foreground text-sm">No notifications yet</p>
//   }
// </div>

// Behavior: Close on click outside, close on Escape
// Mark all read: dispatch markAllRead()
```

### File 5.3: `src/components/notification/NotificationItem.jsx`

```jsx
// Props:
// {
//   notification: { _id, type, message, data?, isRead, createdAt }
//   onClick?: () => void
// }

// Layout:
// <div className={`flex gap-3 p-4 hover:bg-surface-muted cursor-pointer transition-colors ${!isRead ? 'bg-primary-light/50' : ''}`}>
//   <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${typeIconColor}`}>
//     <typeIcon className="w-5 h-5" />
//   </div>
//   <div className="flex-1 min-w-0">
//     <p className="text-sm font-medium line-clamp-2">{message}</p>
//     <p className="text-xs text-muted-foreground mt-1">{timeAgo(createdAt)}</p>
//   </div>
//   {!isRead && <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />}
// </div>

// Type icons: order → Package, payment → CreditCard, system → Info, promotion → Tag
// On click: mark as read + navigate to relevant page (e.g., /orders/:id for order notification)

// Helper: timeAgo function — "2 min ago", "1 hour ago", "3 days ago"
```

### File 5.4: `src/pages/NotificationsPage.jsx`

```jsx
// Route: /notifications (protected)

// Layout:
// <div className="max-w-2xl mx-auto ...">
//   <div className="flex items-center justify-between mb-6">
//     <h1 className="font-display text-3xl">Notifications</h1>
//     <Button variant="ghost" onClick={markAllRead}>Mark all read</Button>
//   </div>
//   <div className="bg-white rounded-xl border border-border divide-y divide-border">
//     {notifications.map(n => <NotificationItem key={n._id} notification={n} />)}
//   </div>
// </div>

// States: loading, empty ("No notifications"), error, data
```

---

## File Dependency Map (Phase 3 additions)

```
Feature 1 (Reservations):
  services/reservationService.js → services/api.js
  redux/reservationSlice.js
  pages/BookReservationPage.jsx → reservationService, useAuth, common components
  pages/ReservationsPage.jsx → reservationSlice, common components

Feature 2 (AI Suggestions):
  services/aiService.js → services/api.js
  components/menu/AISuggestions.jsx → aiService, MenuCard (modified)
  → Insert into HomePage

Feature 3 (Reviews):
  components/review/RatingStars.jsx → utils/icons.js
  components/review/ReviewSummary.jsx → RatingStars
  components/review/ReviewCard.jsx → RatingStars
  pages/RestaurantReviewsPage.jsx → reviewService, ReviewSummary, ReviewList

Feature 4 (Support):
  services/supportService.js → services/api.js
  pages/SupportPage.jsx → supportService, TicketCard
  pages/TicketDetailPage.jsx → supportService, TicketReply

Feature 5 (Notifications):
  → Depends on redux/notificationSlice.js (already in Phase 1)
  components/notification/NotificationBell.jsx → notificationSlice
  components/notification/NotificationDropdown.jsx → NotificationItem
  pages/NotificationsPage.jsx → notificationSlice, NotificationItem
  → Insert NotificationBell into Navbar and AdminLayout header
```

---

## Route Additions (AppRoutes.jsx)

```jsx
{/* Dine-Out */}
<Route element={<ProtectedRoute />}>
  <Route path="/reservations" element={<ReservationsPage />} />
  <Route path="/restaurants/:id/reserve" element={<BookReservationPage />} />
</Route>

{/* Reviews */}
<Route path="/restaurants/:id/reviews" element={<RestaurantReviewsPage />} />

{/* Support */}
<Route element={<ProtectedRoute />}>
  <Route path="/support" element={<SupportPage />} />
  <Route path="/support/:id" element={<TicketDetailPage />} />
</Route>

{/* Notifications */}
<Route element={<ProtectedRoute />}>
  <Route path="/notifications" element={<NotificationsPage />} />
</Route>
```

---

## Acceptance Checklist

- [ ] Table reservations can be created with date/time/party size
- [ ] Reservation list shows upcoming and past bookings
- [ ] Reservation status updates correctly (pending → confirmed → seated)
- [ ] AI suggestions appear on homepage for authenticated users
- [ ] Review stars are interactive and keyboard accessible
- [ ] Review summary shows rating distribution bars
- [ ] Users can edit/delete their own reviews
- [ ] Support tickets can be created with category selection
- [ ] Ticket thread shows user and admin replies in chat format
- [ ] Notification bell shows unread count badge
- [ ] Notification dropdown auto-updates via Socket.IO
- [ ] Clicking notification navigates to relevant page
- [ ] Full notifications page supports mark-all-read
