import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, Pencil, Play, Trash2 } from 'lucide-react'
import { GlassCard } from '../../../components/ui/GlassCard'
import { Button } from '../../../components/ui/Button'
import { CategoryEmoji } from '../../../components/shared/CategoryEmoji'
import type { SceneDto } from '../../../types/api'

interface SceneCardProps {
  scene: SceneDto
  onEdit: () => void
  onDelete: () => void
  onRun: () => Promise<void>
  forceExpanded?: boolean
}

export function SceneCard({ scene, onEdit, onDelete, onRun, forceExpanded }: SceneCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [running, setRunning] = useState(false)

  // Sync to Expand All / Collapse All
  useEffect(() => {
    if (forceExpanded !== undefined) setExpanded(forceExpanded)
  }, [forceExpanded])

  const handleRun = async () => {
    setRunning(true)
    try { await onRun() } finally { setRunning(false) }
  }

  return (
    <GlassCard className="p-4">
      <div className="flex items-start gap-2">
        <button
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded
            ? <ChevronDown size={14} className="text-accent flex-shrink-0 mt-0.5" />
            : <ChevronRight size={14} className="text-text-muted flex-shrink-0 mt-0.5" />}
          <div className="min-w-0">
            <p className="font-semibold text-text-primary truncate">{scene.name}</p>
            <p className="text-xs text-text-muted">
              {scene.smartActions.length} action{scene.smartActions.length !== 1 ? 's' : ''}
            </p>
          </div>
        </button>
        <div className="flex gap-1 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={onEdit}><Pencil size={12} /></Button>
          <Button variant="outline" size="sm" loading={running} onClick={handleRun}>
            <Play size={12} /> Run
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 size={13} className="text-red-400" />
          </Button>
        </div>
      </div>

      {expanded && scene.smartActions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/30 flex flex-col gap-2">
          {scene.smartActions.map((a) => (
            <div key={a.smartActionId} className="glass-subtle rounded-xl px-3 py-2 flex items-center gap-2">
              {a.targetSceneId != null ? (
                <>
                  <span>🎬</span>
                  <span className="text-xs text-text-secondary">
                    Run scene: <span className="font-medium text-text-primary">{a.targetSceneName ?? `#${a.targetSceneId}`}</span>
                  </span>
                </>
              ) : (
                <>
                  <CategoryEmoji category={a.itemCategoryName} size="sm" />
                  <span className="text-xs text-text-secondary">
                    <span className="font-medium text-text-primary">{a.itemName ?? '—'}</span>
                    {a.actionDefinitionName && ` · ${a.actionDefinitionName}`}
                    {' = '}
                    <span className="font-mono">{String(a.value)}</span>
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  )
}
