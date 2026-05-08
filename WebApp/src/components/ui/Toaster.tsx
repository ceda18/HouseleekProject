import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { subscribeToasts, toast, type ToastItem } from '../../lib/toast'

const ICONS = {
  success: <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />,
  error: <AlertCircle size={16} className="text-red-500 flex-shrink-0" />,
  info: <Info size={16} className="text-accent flex-shrink-0" />,
}

const RING = {
  success: 'ring-green-200',
  error: 'ring-red-200',
  info: 'ring-accent/30',
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([])
  useEffect(() => subscribeToasts(setItems), [])

  if (items.length === 0) return null
  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-sm pointer-events-none">
      {items.map((t) => (
        <div
          key={t.id}
          className={`glass-strong rounded-2xl px-4 py-3 flex items-start gap-2.5 shadow-lg ring-1 pointer-events-auto animate-[fadeIn_150ms_ease-out] ${RING[t.kind]}`}
        >
          {ICONS[t.kind]}
          <p className="text-sm text-text-primary flex-1 leading-snug whitespace-pre-wrap break-words">
            {t.message}
          </p>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-text-muted hover:text-text-primary transition-colors flex-shrink-0"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
