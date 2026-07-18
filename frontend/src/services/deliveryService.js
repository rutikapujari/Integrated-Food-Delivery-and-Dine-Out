import api from './api'

export const deliveryService = {
  getMyDeliveries: () => api.get('/orders'),
  getAvailable: () => api.get('/orders/available'),
  claimDelivery: (id) => api.put(`/orders/${id}/assign`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  updatePayment: (id, paymentStatus) =>
    api.put(`/orders/${id}/payment`, { paymentStatus }),
}
