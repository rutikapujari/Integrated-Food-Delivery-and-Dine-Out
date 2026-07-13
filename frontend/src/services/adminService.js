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
