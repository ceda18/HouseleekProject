import { useState } from 'react'
import { Play, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { GlassCard } from '../../../components/ui/GlassCard'
import { Button } from '../../../components/ui/Button'
import { activityApi } from '../../../api/activity'
import type { AutomationDto, SceneDto } from '../../../types/api'

interface Props {
  scenes: SceneDto[]
  automations: AutomationDto[]
}

export function QuickActionsWidget({ scenes, automations }: Props) {
  const navigate = useNavigate()
  const [running, setRunning] = useState<number | null>(null)

  const run = async (id: number) => {
    setRunning(id)
    try { await activityApi.executeWorkflow(id) } finally { setRunning(null) }
  }

  const items = [
    ...scenes.slice(0, 3).map((s) => ({ id: s.sceneId, name: s.name, icon: '🎬', count: `${s.smartActions.length} action${s.smartActions.length !== 1 ? 's' : ''}` })),
    ...automations.slice(0, 3).map((a) => ({ id: a.automationId, name: a.name, icon: '⚡', count: `${a.triggers.length} trigger${a.triggers.length !== 1 ? 's' : ''}` })),
  ].slice(0, 5)

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-accent" />
          <h2 className="font-semibold text-text-primary text-sm">Quick Actions</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/workflows')}>View all</Button>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-text-muted py-4 text-center">No scenes or automations yet</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div key={item.id} className="glass-subtle rounded-xl px-3 py-2.5 flex items-center gap-3">
              <span className="text-base">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{item.name}</p>
                <p className="text-[10px] text-text-muted">{item.count}</p>
              </div>
              <button
                disabled={running === item.id}
                onClick={() => run(item.id)}
                className="w-7 h-7 rounded-lg bg-accent/10 hover:bg-accent/20 flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <Play size={12} className="text-accent" />
              </button>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  )
}
