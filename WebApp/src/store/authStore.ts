import { create } from 'zustand'
import type { LoginResponse } from '../types/api'

interface AuthState {
  token: string | null
  user: Omit<LoginResponse, 'token'> | null
  isAuthenticated: boolean
  login: (res: LoginResponse) => void
  logout: () => void
}

const stored = localStorage.getItem('user')

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: stored ? JSON.parse(stored) : null,
  isAuthenticated: !!localStorage.getItem('token'),

  login: (res) => {
    const { token, ...user } = res
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ token, user, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ token: null, user: null, isAuthenticated: false })
  },
}))
