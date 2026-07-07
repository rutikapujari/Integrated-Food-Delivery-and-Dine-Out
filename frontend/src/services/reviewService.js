import api from './api'

export const reviewService = {
  getByRestaurant: (restaurantId) => api.get(`/reviews/restaurant/${restaurantId}`),
  create: (data) => api.post('/reviews', data),
  getMyReviews: () => api.get('/reviews/my'),
}
