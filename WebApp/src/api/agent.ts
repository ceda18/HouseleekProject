import { api } from './client'
import type { AgentMessageDto, ChatMessageRequest, ApplyProposalRequest } from '../types/api'

export const agentApi = {
  startChat: () =>
    api.post<AgentMessageDto[]>('/AIAgent/chat/start').then((r) => r.data),

  sendMessage: (data: ChatMessageRequest) =>
    api.post<AgentMessageDto>('/AIAgent/chat/message', data).then((r) => r.data),

  getHistory: () =>
    api.get<AgentMessageDto[]>('/AIAgent/history').then((r) => r.data),

  applyProposal: (data: ApplyProposalRequest) =>
    api.post('/AIAgent/proposals/apply', data),

  clearSession: () =>
    api.post('/AIAgent/session/clear'),
}
