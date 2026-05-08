import { Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

interface SpinnerProps {
  size?: number
  className?: string
  center?: boolean
}

export function Spinner({ size = 24, className, center = false }: SpinnerProps) {
  return (
    <div className={clsx(center && 'flex items-center justify-center w-full py-12', className)}>
      <Loader2 size={size} className="animate-spin text-accent" />
    </div>
  )
}
