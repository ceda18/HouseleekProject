import { useMemo, useState } from 'react'
import { Activity, RefreshCw } from 'lucide-react'
import { GlassCard } from '../../components/ui/GlassCard'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/shared/EmptyState'
import { PageHeader } from '../../components/shared/PageHeader'
import { useActivity } from '../../hooks/useActivity'
import { useUnits } from '../../hooks/useUnits'
import { useScenes } from '../../hooks/useScenes'
import { useAutomations } from '../../hooks/useAutomations'
import { ActivityRow } from './components/ActivityRow'
import { classifyLog, type FilterType } from './lib/classifyLog'

export function ActivityPage() {
  const [filter, setFilter] = useState<FilterType>('all')
  const { logs, isLoading, refetch, isFetching } = useActivity()
  const { units } = useUnits()
  const { scenes } = useScenes()
  const { automations } = useAutomations()

  const stateInfoMap = useMemo(() => {
    const map = new Map<number, { itemName: string; itemCategoryName: string; actionDefinitionName: string }>()
    for (const unit of units)
      for (const room of unit.rooms)
        for (const item of room.items)
          for (const state of item.itemStates)
            map.set(state.itemStateId, {
              itemName: item.name,
              itemCategoryName: item.itemCategoryName,
              actionDefinitionName: state.actionDefinitionName,
            })
    return map
  }, [units])

  const workflowMap = useMemo(() => {
    const map = new Map<number, { name: string; type: 'scene' | 'automation' }>()
    for (const scene of scenes) map.set(scene.sceneId, { name: scene.name, type: 'scene' })
    for (const auto of automations) map.set(auto.automationId, { name: auto.name, type: 'automation' })
    return map
  }, [scenes, automations])

  const filtered = filter === 'all' ? logs : logs.filter((l) => classifyLog(l) === filter)

  const counts = {
    all: logs.length,
    manual: logs.filter((l) => classifyLog(l) === 'manual').length,
    automation: logs.filter((l) => classifyLog(l) === 'automation').length,
    scene: logs.filter((l) => classifyLog(l) === 'scene').length,
  }

  const filterBtns: { key: FilterType; label: string }[] = [
    { key: 'all', label: `All (${counts.all})` },
    { key: 'manual', label: `Manual (${counts.manual})` },
    { key: 'automation', label: `Automation (${counts.automation})` },
    { key: 'scene', label: `Scene (${counts.scene})` },
  ]

  return (
    <div>
      <PageHeader
        title="Activity"
        subtitle="Full action history for your smart home"
        action={
          <Button variant="outline" size="sm" onClick={() => refetch()} loading={isFetching}>
            <RefreshCw size={14} /> Refresh
          </Button>
        }
      />

      <div className="glass rounded-2xl p-1 flex gap-1 mb-6 overflow-x-auto">
        {filterBtns.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 whitespace-nowrap flex-shrink-0 ${
              filter === key
                ? 'bg-accent text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Spinner center />
      ) : filtered.length === 0 ? (
        <GlassCard>
          <EmptyState
            icon={<Activity />}
            title="No activity yet"
            description="Actions will appear here as devices are controlled."
          />
        </GlassCard>
      ) : (
        <GlassCard className="overflow-hidden">
          <div className="divide-y divide-border/30">
            {filtered.map((log) => (
              <ActivityRow
                key={log.actionLogId}
                log={log}
                itemInfo={log.itemStateId != null ? stateInfoMap.get(log.itemStateId) : undefined}
                workflowInfo={log.smartWorkflowId != null ? workflowMap.get(log.smartWorkflowId) : undefined}
              />
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  )
}
