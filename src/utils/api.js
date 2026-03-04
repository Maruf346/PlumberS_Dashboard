// src/utils/api.js
// ─── Axios instance — placeholder for Phase 2+ API integration ───
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach auth token when available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // TODO: redirect to login / refresh token
      console.warn('[API] Unauthorized — handle auth redirect here')
    }
    return Promise.reject(error)
  }
)

export default api