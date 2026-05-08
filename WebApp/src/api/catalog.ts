import { api } from './client'
import type { VendorDto, ItemModelDto, LookupItem } from '../types/api'

// Backend returns e.g. { unitTypeId, name } — find the *Id field and normalize to { id, name }
const normalizeLookup = (items: Record<string, unknown>[]): LookupItem[] =>
  items.map((item) => {
    const idKey = Object.keys(item).find(
      (k) => k.toLowerCase() !== 'name' && k.toLowerCase().endsWith('id'),
    )
    return { id: idKey ? Number(item[idKey]) : 0, name: String(item.name ?? '') }
  })

export const catalogApi = {
  // Lookup
  getUnitTypes: () =>
    api.get<Record<string, unknown>[]>('/Catalog/unit-types').then((r) => normalizeLookup(r.data)),
  getRoomTypes: () =>
    api.get<Record<string, unknown>[]>('/Catalog/room-types').then((r) => normalizeLookup(r.data)),
  getItemCategories: () =>
    api.get<Record<string, unknown>[]>('/Catalog/item-categories').then((r) => normalizeLookup(r.data)),

  // Vendors
  getVendors: () =>
    api.get<VendorDto[]>('/Catalog/vendors').then((r) => r.data),
  getVendor: (id: number) =>
    api.get<VendorDto>(`/Catalog/vendors/${id}`).then((r) => r.data),
  createVendor: (data: Partial<VendorDto>) =>
    api.post<VendorDto>('/Catalog/vendors', data).then((r) => r.data),
  updateVendor: (data: Partial<VendorDto>) =>
    api.put('/Catalog/vendors', data),
  deleteVendor: (id: number) =>
    api.delete(`/Catalog/vendors/${id}`),

  // Item Models
  getItemModels: () =>
    api.get<ItemModelDto[]>('/Catalog/item-models').then((r) => r.data),
  getItemModel: (id: number) =>
    api.get<ItemModelDto>(`/Catalog/item-models/${id}`).then((r) => r.data),
  createItemModel: (data: Partial<ItemModelDto>) =>
    api.post<ItemModelDto>('/Catalog/item-models', data).then((r) => r.data),
  updateItemModel: (data: Partial<ItemModelDto>) =>
    api.put('/Catalog/item-models', data),
  deleteItemModel: (id: number) =>
    api.delete(`/Catalog/item-models/${id}`),
}
