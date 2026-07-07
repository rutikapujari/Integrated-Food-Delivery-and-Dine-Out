# Phase 2 — Admin Dashboard (Agent-Ready Spec)

> **Status:** Planned (after Phase 1 complete)
> **Pages:** 5 | **Est. Files:** ~12

---

## Prerequisites

- Phase 1 complete: auth, Redux store, common components, API layer, ProtectedRoute
- Backend admin routes tested and working
- Backend `role.js` middleware restricts `/api/admin/*` to `role: 'admin'`
- User must have `role === 'admin'` to access any admin page

---

## Build Order

```
Step 1: Admin Layout      (3 files) → depends on Phase 1 (ProtectedRoute, common components)
Step 2: Admin Service      (1 file)  → depends on Phase 1 (api.js)
Step 3: Admin Dashboard    (5 files) → depends on Step 1+2
Step 4: Admin Users        (1 file)  → depends on Step 1+2
Step 5: Admin Orders       (1 file)  → depends on Step 1+2
Step 6: Admin Restaurants  (1 file)  → depends on Step 1+2
```

---

## Step 1: Admin Layout

### File 1.1: `src/components/layout/AdminRoute.jsx`

```jsx
// Props: children (ReactNode)
// Behavior:
// - Wraps ProtectedRoute (must be authenticated)
// - Additionally checks user.role === 'admin'
// - If user is authenticated but not admin → redirect to "/" with toast "Access denied"
// - If loading: Loader
// - If not authenticated: redirect to /login (handled by ProtectedRoute)
```

### File 1.2: `src/components/layout/AdminSidebar.jsx`

```jsx
// Props: none (reads current route for active state)

// Layout: Fixed left sidebar, h-screen, w-64, bg-slate-900, text-white
// <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-white flex flex-col z-30">
//   {/* Logo area */}
//   <div className="p-6 border-b border-slate-700">
//     <h2 className="font-display text-2xl">FoodHub<span className="text-primary">Admin</span></h2>
//   </div>

//   {/* Nav links */}
//   <nav className="flex-1 p-4 space-y-1">
//     {links.map(link => (
//       <Link to={link.to} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
//         isActive ? 'bg-primary text-white' : 'text-slate-300 hover:bg-slate-800'
//       }`}>
//         <link.icon className="w-5 h-5" />
//         <span>{link.label}</span>
//       </Link>
//     ))}
//   </nav>

//   {/* Bottom: Back to site link */}
//   <div className="p-4 border-t border-slate-700">
//     <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm">
//       <ArrowLeft /> Back to FoodHub
//     </Link>
//   </div>
// </aside>

// Links:
// { to: '/admin', label: 'Dashboard', icon: ChartBar },
// { to: '/admin/orders', label: 'Orders', icon: Package },
// { to: '/admin/users', label: 'Users', icon: Users },
// { to: '/admin/restaurants', label: 'Restaurants', icon: Storefront },

// Note: Mobile: sidebar collapses to hamburger (same pattern as Navbar Sidebar)
```

### File 1.3: `src/components/layout/AdminLayout.jsx`

```jsx
// Props: none
// Structure:
// <div className="flex min-h-screen bg-slate-50">
//   <AdminSidebar />
//   <div className="flex-1 ml-64">
//     {/* Top bar */}
//     <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20">
//       <h1 className="text-xl font-semibold text-slate-800">{pageTitle}</h1>
//       <div className="flex items-center gap-4">
//         <NotificationBell />
//         <div className="flex items-center gap-2">
//           <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
//             {user.name[0]}
//           </div>
//           <span className="text-sm font-medium">{user.name}</span>
//         </div>
//       </div>
//     </header>

//     {/* Main content area */}
//     <main className="p-6">
//       <Outlet />
//     </main>
//   </div>
// </div>

// Note: pageTitle can be derived from route path or passed via context/outlet context
```

---

## Step 2: Admin Service

### File 2.1: `src/services/adminService.js`

```js
import api from './api'

export const adminService = {
  getAnalytics: () => api.get('/admin/analytics'),
  getRevenue: (params) => api.get('/admin/revenue', { params }),
  getUsers: (params) => api.get('/admin/users', { params }),
  getOrders: (params) => api.get('/admin/orders', { params }),
  getRestaurants: (params) => api.get('/admin/restaurants', { params }),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  deleteRestaurant: (id) => api.delete(`/restaurants/${id}`),
}
```

---

## Step 3: Admin Dashboard

### File 3.1: `src/components/admin/StatCard.jsx`

```jsx
// Props:
// {
//   title: string
//   value: string | number
//   icon: PhosphorIcon
//   change?: { value: number, type: 'increase' | 'decrease' }
//   loading?: boolean
// }

// Layout:
// <div className="bg-white border border-slate-200 rounded-xl p-6">
//   <div className="flex items-start justify-between">
//     <div>
//       <p className="text-sm text-muted-foreground">{title}</p>
//       {loading
//         ? <div className="h-8 w-24 bg-slate-100 animate-pulse rounded mt-1" />
//         : <p className="text-2xl font-bold mt-1">{value}</p>
//       }
//       {change && <p className={`text-sm mt-1 ${change.type === 'increase' ? 'text-success' : 'text-destructive'}`}>
//         {change.type === 'increase' ? '↑' : '↓'} {change.value}%
//       </p>}
//     </div>
//     <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center">
//       <icon className="w-6 h-6 text-primary" />
//     </div>
//   </div>
// </div>

// States: loading (skeleton pulse), data, error (N/A)
```

### File 3.2: `src/components/admin/RevenueChart.jsx`

```jsx
// Props: { data: { labels: string[], values: number[] } }

// Use recharts (install if needed: npm install recharts)
// Bar chart: monthly revenue
// Simple implementation:
//   <BarChart width={...} height={300} data={...}>
//     <Bar dataKey="revenue" fill="var(--color-primary)" radius={[4,4,0,0]} />
//   </BarChart>
```

### File 3.3: `src/pages/admin/AdminDashboardPage.jsx`

```jsx
// Layout:
// <motion.div {...pageTransition}>
//   <div className="mb-8">
//     <h2 className="text-2xl font-semibold mb-1">Dashboard Overview</h2>
//     <p className="text-muted-foreground">Real-time snapshot of your platform</p>
//   </div>

//   {/* Stat cards row */}
//   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//     <StatCard title="Total Revenue" value={formatCurrency(stats.revenue)} icon={CurrencyDollar} change={stats.revenueChange} />
//     <StatCard title="Total Orders" value={stats.totalOrders} icon={Package} change={stats.orderChange} />
//     <StatCard title="Active Users" value={stats.activeUsers} icon={Users} />
//     <StatCard title="Restaurants" value={stats.restaurantCount} icon={Storefront} />
//   </div>

//   {/* Charts row */}
//   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//     <div className="bg-white rounded-xl p-6 border border-slate-200">
//       <h3 className="font-semibold mb-4">Revenue Overview</h3>
//       <RevenueChart data={revenueData} />
//     </div>
//     <div className="bg-white rounded-xl p-6 border border-slate-200">
//       <h3 className="font-semibold mb-4">Recent Orders</h3>
//       <RecentOrdersTable orders={recentOrders} />
//     </div>
//   </div>
// </motion.div>

// Behavior:
// - On mount: fetch GET /api/admin/analytics + GET /api/admin/revenue
// - States: loading (StatCard skeleton + chart skeleton), error, data
```

---

## Step 4: Admin Users

### File 4.1: `src/pages/admin/AdminUsersPage.jsx`

```jsx
// Layout:
// <motion.div {...pageTransition}>
//   <h2 className="text-2xl font-semibold mb-6">Users</h2>

//   {/* Search bar */}
//   <input placeholder="Search users by name or email..." className="..." />

//   {/* Users table */}
//   <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
//     <table className="w-full">
//       <thead className="bg-slate-50 border-b border-slate-200">
//         <tr>
//           <th className="text-left p-4 text-sm font-semibold">User</th>
//           <th className="text-left p-4 text-sm font-semibold">Email</th>
//           <th className="text-left p-4 text-sm font-semibold">Role</th>
//           <th className="text-left p-4 text-sm font-semibold">Joined</th>
//           <th className="text-left p-4 text-sm font-semibold">Actions</th>
//         </tr>
//       </thead>
//       <tbody className="divide-y divide-slate-200">
//         {users.map(user => (
//           <tr key={user._id}>
//             <td className="p-4">
//               <div className="flex items-center gap-3">
//                 <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
//                   {user.name[0]}
//                 </div>
//                 <span className="font-medium">{user.name}</span>
//               </div>
//             </td>
//             <td className="p-4 text-muted-foreground">{user.email}</td>
//             <td className="p-4">
//               <select value={user.role} onChange={handleRoleChange} className="...">
//                 <option value="customer">Customer</option>
//                 <option value="restaurant">Restaurant</option>
//                 <option value="admin">Admin</option>
//               </select>
//             </td>
//             <td className="p-4 text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td>
//             <td className="p-4">
//               <Button variant="ghost" size="sm" icon={Pencil}>Edit</Button>
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   </div>

//   <Pagination ... />
// </motion.div>

// States: loading (skeleton table rows), empty ("No users found"), error, data
```

---

## Step 5: Admin Orders

### File 5.1: `src/pages/admin/AdminOrdersPage.jsx`

```jsx
// Layout:
// <motion.div {...pageTransition}>
//   <h2 className="text-2xl font-semibold mb-6">All Orders</h2>

//   {/* Filters: status dropdown + date range */}
//   <div className="flex gap-4 mb-6">
//     <select>
//       <option value="">All Statuses</option>
//       {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
//     </select>
//   </div>

//   {/* Orders table */}
//   <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
//     <table className="w-full">
//       <thead>
//         <tr>
//           <th>Order ID</th> <th>Customer</th> <th>Restaurant</th>
//           <th>Items</th> <th>Total</th> <th>Status</th> <th>Date</th> <th>Actions</th>
//         </tr>
//       </thead>
//       <tbody>
//         {orders.map(order => (
//           <tr>
//             <td className="font-mono text-sm">{order._id.slice(-8)}</td>
//             <td>{order.user?.name}</td>
//             <td>{order.restaurant?.name}</td>
//             <td>{order.items?.length} items</td>
//             <td className="font-semibold">{formatCurrency(order.totalAmount)}</td>
//             <td>
//               <select value={order.status} onChange={handleStatusChange(order._id)}>
//                 {statusOptions.map(s => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
//               </select>
//             </td>
//             <td>{new Date(order.createdAt).toLocaleDateString()}</td>
//             <td>
//               <Link to={`/orders/${order._id}`}><Button variant="ghost" size="sm">View</Button></Link>
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   </div>

//   <Pagination ... />
// </motion.div>
```

---

## Step 6: Admin Restaurants

### File 6.1: `src/pages/admin/AdminRestaurantsPage.jsx`

```jsx
// Layout: Same table pattern as orders
// Columns: Name, Cuisine, Rating, Orders, Status (active/inactive), Actions (view, delete)

// Delete action: confirm dialog → DELETE /api/restaurants/:id → toast

// States: loading, empty, error, data
```

---

## Step 7: Routing Update

### Modify `src/routes/AppRoutes.jsx` — Add admin routes:

```jsx
// Inside <Suspense>, add:
<Route element={<AdminRoute />}>
  <Route element={<AdminLayout />}>
    <Route path="/admin" element={<AdminDashboardPage />} />
    <Route path="/admin/orders" element={<AdminOrdersPage />} />
    <Route path="/admin/users" element={<AdminUsersPage />} />
    <Route path="/admin/restaurants" element={<AdminRestaurantsPage />} />
  </Route>
</Route>
```

---

## File Dependency Map (Phase 2 additions)

```
routes/AppRoutes.jsx
├── components/layout/AdminRoute.jsx
│   └── components/layout/ProtectedRoute.jsx
├── components/layout/AdminLayout.jsx
│   ├── components/layout/AdminSidebar.jsx
│   └── pages/admin/*
└── pages/admin/*
    ├── services/adminService.js
    ├── hooks/useAuth.js
    ├── components/common/Pagination.jsx
    └── components/admin/StatCard.jsx

Note: recharts is only needed if RevenueChart uses it.
Install: npm install recharts
```

---

## Acceptance Checklist

- [ ] Admin routes require admin role (non-admin redirected to `/`)
- [ ] Admin sidebar navigation works
- [ ] Dashboard shows real revenue, order, user, restaurant stats
- [ ] Users table supports search and role change
- [ ] Orders table supports status dropdown update
- [ ] Restaurants table supports delete with confirmation
- [ ] All tables have loading/empty/error states
- [ ] Mobile responsive (sidebar collapses)
- [ ] "Back to FoodHub" link returns to customer site
- [ ] Admin layout does not interfere with customer layout
