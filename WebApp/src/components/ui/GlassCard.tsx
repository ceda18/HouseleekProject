import { type ReactNode } from 'react'
import { clsx } from 'clsx'

interface GlassCardProps {
  children: ReactNode
  className?: string
  shimmer?: boolean
  variant?: 'default' | 'strong' | 'subtle' | 'accent'
  onClick?: () => void
}

export function GlassCard({
  children,
  className,
  shimmer = false,
  variant = 'default',
  onClick,
}: GlassCardProps) {
  const base = {
    default: 'glass',
    strong: 'glass-strong',
    subtle: 'glass-subtle',
    accent: 'glass-accent',
  }[variant]

  return (
    <div
      className={clsx(
        base,
        'rounded-3xl',
        shimmer && 'glass-shimmer',
        onClick && 'cursor-pointer transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99]',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
