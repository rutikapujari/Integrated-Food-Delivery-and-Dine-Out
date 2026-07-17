import api from './api'

export const reviewService = {
  getByRestaurant: (restaurantId) => api.get(`/reviews/restaurant/${restaurantId}`),
  getById: (id) => api.get(`/reviews/${id}`),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  getMyReviews: () => api.get('/reviews/my'),
}
