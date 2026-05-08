import { api } from './client'
import type { SceneDto, AutomationDto } from '../types/api'

export const workflowsApi = {
  // Scenes
  getScenes: () =>
    api.get<SceneDto[]>('/SmartWorkflow/scenes').then((r) => r.data),
  getScene: (id: number) =>
    api.get<SceneDto>(`/SmartWorkflow/scenes/${id}`).then((r) => r.data),
  createScene: (data: Partial<SceneDto>) =>
    api.post<SceneDto>('/SmartWorkflow/scenes', data).then((r) => r.data),
  updateScene: (data: Partial<SceneDto>) =>
    api.put('/SmartWorkflow/scenes', data),
  deleteScene: (id: number) =>
    api.delete(`/SmartWorkflow/scenes/${id}`),
  getScenesByItem: (itemId: number) =>
    api.get<SceneDto[]>(`/SmartWorkflow/scenes/filter/${itemId}`).then((r) => r.data),

  // Automations
  getAutomations: () =>
    api.get<AutomationDto[]>('/SmartWorkflow/automations').then((r) => r.data),
  getAutomation: (id: number) =>
    api.get<AutomationDto>(`/SmartWorkflow/automations/${id}`).then((r) => r.data),
  createAutomation: (data: Partial<AutomationDto>) =>
    api.post<AutomationDto>('/SmartWorkflow/automations', data).then((r) => r.data),
  updateAutomation: (data: Partial<AutomationDto>) =>
    api.put('/SmartWorkflow/automations', data),
  deleteAutomation: (id: number) =>
    api.delete(`/SmartWorkflow/automations/${id}`),
}
