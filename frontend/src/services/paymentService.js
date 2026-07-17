import api from './api'

export const paymentService = {
  createRazorpayOrder: (data) => api.post('/payments/create-order', data),
  verifyPayment: (data) => api.post('/payments/verify', data),
  getPayments: () => api.get('/payments'),
  generateUpiQr: (data) => api.post('/payments/upi-qr', data),
  confirmUpiPayment: (data) => api.post('/payments/upi-confirm', data),
  markCodPaid: (data) => api.post('/payments/cod-paid', data),
  updateOrderPayment: (data) => api.put(`/orders/${data.orderId}/payment`, data),
}
