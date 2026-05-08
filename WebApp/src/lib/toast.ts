/**
 * Lightweight global toast bus.
 * - `toast.error/success/info(msg)` is callable from anywhere (axios interceptor included).
 * - The <Toaster /> component (mounted once in App) subscribes and renders.
 */

export type ToastKind = 'success' | 'error' | 'info'

export interface ToastItem {
  id: number
  kind: ToastKind
  message: string
}

type Subscriber = (items: ToastItem[]) => void

let nextId = 1
let items: ToastItem[] = []
const subs = new Set<Subscriber>()

function emit() {
  for (const s of subs) s(items)
}

function push(kind: ToastKind, message: string, durationMs = 4000) {
  const id = nextId++
  items = [...items, { id, kind, message }]
  emit()
  setTimeout(() => {
    items = items.filter((t) => t.id !== id)
    emit()
  }, durationMs)
}

export const toast = {
  success: (msg: string) => push('success', msg),
  error: (msg: string) => push('error', msg, 6000),
  info: (msg: string) => push('info', msg),
  dismiss: (id: number) => {
    items = items.filter((t) => t.id !== id)
    emit()
  },
}

export function subscribeToasts(fn: Subscriber): () => void {
  subs.add(fn)
  fn(items)
  return () => { subs.delete(fn) }
}
