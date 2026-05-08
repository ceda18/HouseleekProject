/**
 * useAgentChat — encapsulates AI chat session state.
 * Owns: messages list, sending/starting flags, start/send/clear actions.
 */
import { useCallback, useState } from 'react'
import { agentApi } from '../api/agent'
import type { AgentMessageDto } from '../types/api'

export function useAgentChat() {
  const [messages, setMessages] = useState<AgentMessageDto[]>([])
  const [started, setStarted] = useState(false)
  const [sending, setSending] = useState(false)
  const [starting, setStarting] = useState(false)

  const start = useCallback(async () => {
    setStarting(true)
    try {
      const history = await agentApi.startChat()
      setMessages(history)
      setStarted(true)
      return history
    } finally {
      setStarting(false)
    }
  }, [])

  const send = useCallback(async (text: string) => {
    if (!text.trim() || sending) return
    setSending(true)
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: text, timestamp: new Date().toISOString() },
    ])
    try {
      const reply = await agentApi.sendMessage({ message: text })
      setMessages((prev) => [...prev, reply])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setSending(false)
    }
  }, [sending])

  const clear = useCallback(async () => {
    await agentApi.clearSession()
    setMessages([])
    setStarted(false)
  }, [])

  return { messages, started, sending, starting, start, send, clear }
}
