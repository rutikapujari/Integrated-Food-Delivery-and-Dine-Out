import api from './api'

export const aiService = {
  getSuggestions: () => api.get('/ai/suggestions'),
}
