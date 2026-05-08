import { GlassCard } from '../../../components/ui/GlassCard'

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: number | string
  color?: 'accent' | 'green' | 'amber' | 'neutral'
}

const BG: Record<NonNullable<StatCardProps['color']>, string> = {
  accent: 'rgba(0,186,199,0.12)',
  green: 'rgba(34,197,94,0.12)',
  amber: 'rgba(245,158,11,0.12)',
  neutral: 'rgba(107,107,138,0.10)',
}
const FG: Record<NonNullable<StatCardProps['color']>, string> = {
  accent: 'text-accent',
  green: 'text-green-500',
  amber: 'text-amber-500',
  neutral: 'text-text-secondary',
}

export function StatCard({ icon: Icon, label, value, color = 'accent' }: StatCardProps) {
  return (
    <GlassCard shimmer className="p-5 flex items-center gap-4">
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: BG[color] }}
      >
        <Icon size={20} className={FG[color]} />
      </div>
      <div>
        <p className="text-2xl font-semibold text-text-primary">{value}</p>
        <p className="text-xs text-text-muted">{label}</p>
      </div>
    </GlassCard>
  )
}
