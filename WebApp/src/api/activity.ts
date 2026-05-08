import { api } from './client'
import type { ActionLogDto, ItemDto } from '../types/api'

export const activityApi = {
  getLogs: () =>
    api.get<ActionLogDto[]>('/Action/logs').then((r) => r.data),

  updateItemState: (data: Partial<ItemDto>) =>
    api.put('/Action/items', data),

  executeWorkflow: (smartWorkflowId: number) =>
    api.post(`/Action/execute/${smartWorkflowId}`),
}
