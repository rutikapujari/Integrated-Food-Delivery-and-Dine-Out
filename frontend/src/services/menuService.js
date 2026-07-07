import api from './api'

export const menuService = {
  getAll: (params) => api.get('/menu', { params }),
  getByRestaurant: (restaurantId) => api.get(`/menu/restaurant/${restaurantId}`),
  getById: (id) => api.get(`/menu/${id}`),
}
