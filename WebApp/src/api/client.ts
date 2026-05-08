import axios, { AxiosError } from 'axios'
import { toast } from '../lib/toast'

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/** Pulls a human-readable message out of an axios error response. */
function extractMessage(err: AxiosError): string {
  const data = err.response?.data as unknown
  if (typeof data === 'string') return data
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    if (typeof obj.message === 'string') return obj.message
    if (typeof obj.title === 'string') return obj.title
    if (typeof obj.error === 'string') return obj.error
    if (typeof obj.detail === 'string') return obj.detail
  }
  if (err.message) return err.message
  return 'Request failed'
}

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    // 401 → clear session, redirect (no toast — login screen handles it).
    // Skip the redirect on /login itself (so failed login attempts surface as a normal rejection).
    if (error.response?.status === 401) {
      const onLogin = window.location.pathname.startsWith('/login')
      if (!onLogin) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }

    const message = extractMessage(error)
    // Attach for callers that want to read it directly
    ;(error as AxiosError & { userMessage?: string }).userMessage = message

    // Suppress toasts for silent endpoints (chat polling, etc.) using config flag
    const silent = (error.config as { silent?: boolean } | undefined)?.silent
    if (!silent) {
      toast.error(message)
    }

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('[API ERROR]', error.config?.method?.toUpperCase(), error.config?.url, '→', error.response?.status, error.response?.data)
    }

    return Promise.reject(error)
  },
)
