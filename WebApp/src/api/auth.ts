import { api } from './client'
import type { LoginRequest, LoginResponse, RegisterRequest } from '../types/api'

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>('/Auth/login', data).then((r) => r.data),

  logout: () =>
    api.post('/Auth/logout'),

  register: (data: RegisterRequest) =>
    api.post('/User/users', data),
}
