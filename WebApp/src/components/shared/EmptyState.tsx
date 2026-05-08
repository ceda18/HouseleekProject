import { type ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="mb-4 text-5xl opacity-40">{icon}</div>}
      <p className="font-semibold text-text-primary mb-1">{title}</p>
      {description && <p className="text-sm text-text-muted mb-5">{description}</p>}
      {action}
    </div>
  )
}
