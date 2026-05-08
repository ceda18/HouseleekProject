import { GlassCard } from '../../../components/ui/GlassCard'
import type { ActionLogDto } from '../../../types/api'

interface Props { logs: ActionLogDto[] }

export function ActivityChart({ logs }: Props) {
  // Group today's logs by hour (0-23)
  const today = new Date().toDateString()
  const todayLogs = logs.filter((l) => new Date(l.timestamp).toDateString() === today)

  const buckets = Array.from({ length: 24 }, (_, h) => ({
    h,
    count: todayLogs.filter((l) => new Date(l.timestamp).getHours() === h).length,
  }))

  const max = Math.max(...buckets.map((b) => b.count), 1)
  const total = todayLogs.length
  const nowHour = new Date().getHours()
  const BAR_H = 80 // px — explicit so % heights resolve correctly

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-text-primary text-sm">Today's Activity</h2>
          <p className="text-[11px] text-text-muted mt-0.5">{total} event{total !== 1 ? 's' : ''} today</p>
        </div>
      </div>
      <div className="flex items-end gap-[3px]" style={{ height: BAR_H }}>
        {buckets.map(({ h, count }) => {
          const barH = count === 0 ? 2 : Math.max(4, Math.round((count / max) * BAR_H))
          const isCurrent = h === nowHour
          return (
            <div
              key={h}
              title={`${String(h).padStart(2, '0')}:00 — ${count} event${count !== 1 ? 's' : ''}`}
              className={`flex-1 rounded-sm transition-all duration-300 cursor-default ${isCurrent ? 'bg-accent' : 'bg-accent/30 hover:bg-accent/60'}`}
              style={{ height: barH }}
            />
          )
        })}
      </div>
      <div className="flex justify-between mt-1.5">
        {[0, 6, 12, 18, 23].map((h) => (
          <span key={h} className="text-[9px] text-text-muted">{String(h).padStart(2, '0')}h</span>
        ))}
      </div>
    </GlassCard>
  )
}
