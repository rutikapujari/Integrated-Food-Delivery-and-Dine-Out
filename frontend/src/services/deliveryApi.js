import axios from 'axios'
import { API_URL } from '../utils/constants'

const deliveryApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

deliveryApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('deliveryToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

deliveryApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('deliveryRefreshToken')
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken })
        localStorage.setItem('deliveryToken', data.token)
        localStorage.setItem('deliveryRefreshToken', data.refreshToken)
        originalRequest.headers.Authorization = `Bearer ${data.token}`
        return deliveryApi(originalRequest)
      } catch {
        localStorage.removeItem('deliveryToken')
        localStorage.removeItem('deliveryRefreshToken')
        window.location.href = '/courier/login'
      }
    }
    return Promise.reject(error)
  }
)

export default deliveryApi
