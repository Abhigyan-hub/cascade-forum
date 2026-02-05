/**
 * API client configuration
 */
import axios from 'axios'

// Use environment variable or default to localhost for development
// In production, VITE_API_URL should be set in Vercel environment variables
const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login for 401 errors on protected routes
    // Public routes (like /events/public) should not trigger redirect
    if (error.response?.status === 401 && !error.config?.url?.includes('/public')) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      // Only redirect if not already on home page
      if (window.location.pathname !== '/') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
