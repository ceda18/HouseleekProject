import { api } from './client'
import type { UserDto } from '../types/api'

export const userApi = {
  getMe: (id: number) =>
    api.get<UserDto>(`/User/users/${id}`).then((r) => r.data),

  updateUser: (data: Partial<UserDto>) =>
    api.put('/User/users', data),
}
