import { api } from './client'
import type { UnitDto, RoomDto, ItemDto } from '../types/api'

export const homeApi = {
  // Units
  getUnits: () =>
    api.get<UnitDto[]>('/Home/units').then((r) => r.data),
  getUnit: (id: number) =>
    api.get<UnitDto>(`/Home/units/${id}`).then((r) => r.data),
  createUnit: (data: Partial<UnitDto>) =>
    api.post<UnitDto>('/Home/units', data).then((r) => r.data),
  updateUnit: (data: Partial<UnitDto>) =>
    api.put('/Home/units', data),
  deleteUnit: (id: number) =>
    api.delete(`/Home/units/${id}`),

  // Rooms
  getRoomsByUnit: (unitId: number) =>
    api.get<RoomDto[]>(`/Home/rooms/unit/${unitId}`).then((r) => r.data),
  getRoom: (id: number) =>
    api.get<RoomDto>(`/Home/rooms/${id}`).then((r) => r.data),
  createRoom: (data: Partial<RoomDto>) =>
    api.post<RoomDto>('/Home/rooms', data).then((r) => r.data),
  updateRoom: (data: Partial<RoomDto>) =>
    api.put('/Home/rooms', data),
  deleteRoom: (id: number) =>
    api.delete(`/Home/rooms/${id}`),

  // Items
  getItemsByRoom: (roomId: number) =>
    api.get<ItemDto[]>(`/Home/items/room/${roomId}`).then((r) => r.data),
  getItem: (id: number) =>
    api.get<ItemDto>(`/Home/items/${id}`).then((r) => r.data),
  createItem: (data: Partial<ItemDto>) =>
    api.post<ItemDto>('/Home/items', data).then((r) => r.data),
  updateItem: (data: Partial<ItemDto>) =>
    api.put('/Action/items', data),
  deleteItem: (id: number) =>
    api.delete(`/Home/items/${id}`),
}
