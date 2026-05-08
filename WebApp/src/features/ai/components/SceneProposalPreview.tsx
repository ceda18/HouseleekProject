import { Film } from 'lucide-react'
import { CategoryEmoji } from '../../../components/shared/CategoryEmoji'
import { s, type StateMap } from '../lib/proposalUtils'

interface SceneProposalPreviewProps {
  p: Record<string, unknown>
  stateMap: StateMap
}

export function SceneProposalPreview({ p, stateMap }: SceneProposalPreviewProps) {
  // AI emits camelCase by prompt convention; snake_case kept as fallback for safety
  const rawActions = (p.smartActions ?? p.smart_actions) as unknown
  const actions = Array.isArray(rawActions) ? (rawActions as Record<string, unknown>[]) : []

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
          <Film size={16} className="text-accent" />
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">{s(p.name)}</p>
          <p className="text-xs text-text-muted">
            {actions.length} action{actions.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {actions.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">Actions</p>
          <div className="flex flex-col gap-1">
            {actions.map((a, i) => {
              const stateId = Number(a.item_state_id ?? a.itemStateId ?? 0)
              const info = stateMap.get(stateId)
              const value = s(a.value)
              return (
                <div key={i} className="flex items-center gap-2 glass-subtle rounded-lg px-3 py-1.5">
                  {info ? (
                    <>
                      <CategoryEmoji category={info.categoryName} size="sm" />
                      <span className="text-xs text-text-secondary flex-1 truncate">
                        <span className="font-medium text-text-primary">{info.itemName}</span>
                        {info.actionName && ` · ${info.actionName}`}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-text-muted flex-1">State #{stateId}</span>
                  )}
                  <span className="text-xs font-mono text-text-primary ml-auto">= {value}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
