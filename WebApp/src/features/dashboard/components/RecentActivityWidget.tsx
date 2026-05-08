import { useNavigate } from 'react-router-dom'
import { Activity } from 'lucide-react'
import { format } from 'date-fns'
import { GlassCard } from '../../../components/ui/GlassCard'
import { Button } from '../../../components/ui/Button'
import { classifyLog, formatLogValue } from '../../activity/lib/classifyLog'
import type { ActionLogDto, UnitDto } from '../../../types/api'

interface Props {
  logs: ActionLogDto[]
  units: UnitDto[]
}

const ICON: Record<string, string> = { manual: '🖐️', scene: '🎬', automation: '⚡' }

function buildStateMap(units: UnitDto[]) {
  const map = new Map<number, string>()
  for (const u of units)
    for (const r of u.rooms)
      for (const item of r.items)
        for (const s of item.itemStates)
          map.set(s.itemStateId, item.name)
  return map
}

export function RecentActivityWidget({ logs, units }: Props) {
  const navigate = useNavigate()
  const stateMap = buildStateMap(units)
  const recent = logs.slice(0, 5)

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-accent" />
          <h2 className="font-semibold text-text-primary text-sm">Recent Activity</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/activity')}>View all</Button>
      </div>
      {recent.length === 0 ? (
        <p className="text-sm text-text-muted py-4 text-center">No activity yet</p>
      ) : (
        <div className="flex flex-col gap-1">
          {recent.map((log) => {
            const type = classifyLog(log)
            const deviceName = log.itemStateId ? stateMap.get(log.itemStateId) : null
            return (
              <div key={log.actionLogId} className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-white/40 transition-colors">
                <span className="text-sm flex-shrink-0">{ICON[type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-secondary truncate">
                    {deviceName
                      ? <><span className="font-medium text-text-primary">{deviceName}</span> · {formatLogValue(log.pastValue)} → {formatLogValue(log.currentValue)}</>
                      : <span className="text-text-muted capitalize">{type}</span>
                    }
                  </p>
                </div>
                <span className="text-[10px] text-text-muted flex-shrink-0">
                  {format(new Date(log.timestamp), 'HH:mm')}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </GlassCard>
  )
}
