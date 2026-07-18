import api from './api'

export const eventService = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  getNearby: (params) => api.get('/events/nearby', { params }),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  remove: (id) => api.delete(`/events/${id}`),
  rsvp: (id) => api.post(`/events/${id}/rsvp`),
}
