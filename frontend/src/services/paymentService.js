import api from './api'

export const paymentService = {
  createRazorpayOrder: (data) => api.post('/payments/create-order', data),
  verifyPayment: (data) => api.post('/payments/verify', data),
  getPayments: () => api.get('/payments'),
}
