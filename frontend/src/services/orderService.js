import api from './api'

export const orderService = {
  create: (data) => api.post('/orders/create', data),
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
}
