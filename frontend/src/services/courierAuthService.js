import deliveryApi from './deliveryApi'

export const courierAuthService = {
  login: (data) => deliveryApi.post('/auth/login', data),
  register: (data) => deliveryApi.post('/auth/register', data),
  verifyOTP: (data) => deliveryApi.post('/auth/verify-otp', data),
  logout: () => deliveryApi.post('/auth/logout'),
  getMe: () => deliveryApi.get('/auth/me'),
}
