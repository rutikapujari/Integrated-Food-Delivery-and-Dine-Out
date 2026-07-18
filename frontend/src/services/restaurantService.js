import api from './api'

export const restaurantService = {
  getAll: (params) => api.get('/restaurants', { params }),
  getById: (id) => api.get(`/restaurants/${id}`),
  getNearby: (params) => api.get('/restaurants/nearby', { params }),
  getMine: () => api.get('/restaurants/mine'),
}
