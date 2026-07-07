import api from './api'

export const paymentService = {
  createCheckout: (data) => api.post('/payments/checkout', data),
  verifyPayment: (data) => api.post('/payments/verify', data),
}
