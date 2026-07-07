import api from './api'

export const supportService = {
  createTicket: (data) => api.post('/support/tickets', data),
  getTickets: () => api.get('/support/tickets'),
  getTicketById: (id) => api.get(`/support/tickets/${id}`),
  addReply: (id, data) => api.post(`/support/tickets/${id}/replies`, data),
  updateStatus: (id, status) => api.put(`/support/tickets/${id}/status`, { status }),
}
