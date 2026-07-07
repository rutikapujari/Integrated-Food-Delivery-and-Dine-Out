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
