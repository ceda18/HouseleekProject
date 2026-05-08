import { Info, Pencil } from 'lucide-react'
import { GlassCard } from '../../../components/ui/GlassCard'
import { Button } from '../../../components/ui/Button'
import { CategoryEmoji } from '../../../components/shared/CategoryEmoji'
import { StateControl } from './StateControl'
import type { ActionDefinitionDto, ItemDto } from '../../../types/api'

interface ItemCardProps {
  item: ItemDto
  onEdit: () => void
  onInfo: () => void
  actionDefMap: Map<number, ActionDefinitionDto>
}

export function ItemCard({ item, onEdit, onInfo, actionDefMap }: ItemCardProps) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <CategoryEmoji category={item.itemCategoryName} size="md" />
          <div>
            <p className="text-sm font-semibold text-text-primary leading-tight">{item.name}</p>
            <p className="text-xs text-text-muted">{item.itemModelName}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={onInfo} title="Model info">
            <Info size={13} className="text-text-muted" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Pencil size={13} />
          </Button>
        </div>
      </div>

      {item.itemStates.length > 0 && (
        <div className="flex flex-col gap-2 pt-2 border-t border-border/30">
          {item.itemStates.map((state) => (
            <div key={state.itemStateId} className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-text-secondary truncate flex-1">
                {state.actionDefinitionName}
              </span>
              <StateControl
                state={state}
                item={item}
                actionDef={actionDefMap.get(state.actionDefinitionId)}
              />
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  )
}
