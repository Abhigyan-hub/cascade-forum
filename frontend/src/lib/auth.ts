/**
 * Authentication utilities
 */
import { api } from './api'

export interface User {
  id: string
  email: string
  full_name: string
  role: 'client' | 'admin' | 'developer'
  is_active: boolean
  created_at: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)
    
    const response = await api.post<LoginResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    
    return response.data
  },

  async register(email: string, password: string, fullName: string): Promise<User> {
    const response = await api.post<User>('/auth/register', {
      email,
      password,
      full_name: fullName,
      role: 'client',
    })
    return response.data
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me')
    return response.data
  },

  logout(): void {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user')
    if (!userStr) return null
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token')
  },

  hasRole(role: 'client' | 'admin' | 'developer'): boolean {
    const user = this.getStoredUser()
    if (!user) return false
    
    const roleHierarchy = {
      client: 1,
      admin: 2,
      developer: 3,
    }
    
    return roleHierarchy[user.role] >= roleHierarchy[role]
  },
}
