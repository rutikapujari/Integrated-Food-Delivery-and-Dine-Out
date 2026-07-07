import api from './api'

export const cartService = {
  getCart: () => api.get('/cart'),
  addItem: (data) => api.post('/cart/add', data),
  updateItem: (menuItemId, data) => api.put(`/cart/update/${menuItemId}`, data),
  removeItem: (menuItemId) => api.delete(`/cart/remove/${menuItemId}`),
  clearCart: () => api.delete('/cart/clear'),
  syncCart: (items) => api.put('/cart/sync', { items }),
}
