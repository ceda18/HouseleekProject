import { type ReactNode } from 'react'
import { clsx } from 'clsx'

type BadgeVariant = 'accent' | 'success' | 'warning' | 'danger' | 'neutral'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return (
    <span className={clsx(`badge-${variant}`, className)}>
      {children}
    </span>
  )
}
