import { useQueryClient } from '@tanstack/react-query'
import { Badge } from '../../../components/ui/Badge'
import { CategoryEmoji } from '../../../components/shared/CategoryEmoji'
import { friendlyValueType } from '../../../lib/valueType'
import { s } from '../lib/proposalUtils'
import type { ItemModelDto, UnitDto } from '../../../types/api'

interface ItemProposalPreviewProps {
  p: Record<string, unknown>
}

export function ItemProposalPreview({ p }: ItemProposalPreviewProps) {
  const qc = useQueryClient()

  // AI sends minimal payload: { name, roomId, itemModelId }.
  // Enrich with category/model name from cache so the preview is informative.
  const itemModelId = Number(p.itemModelId ?? p.item_model_id ?? 0)
  const roomId = Number(p.roomId ?? p.room_id ?? 0)

  const models = qc.getQueryData<ItemModelDto[]>(['item-models']) ?? []
  const units = qc.getQueryData<UnitDto[]>(['units']) ?? []

  const model = models.find((m) => m.itemModelId === itemModelId)
  const room = units
    .flatMap((u) => u.rooms.map((r) => ({ ...r, unitName: u.name })))
    .find((r) => r.roomId === roomId)

  // Either AI included it explicitly OR we enriched it from cache
  const categoryName = s(p.itemCategoryName ?? p.item_category_name ?? model?.itemCategoryName ?? '')
  const modelName = s(p.itemModelName ?? p.item_model_name ?? model?.name ?? '')

  // Initial states preview (rare — AI usually doesn't send these; show model capabilities instead)
  const rawStates = (p.itemStates ?? p.item_states) as unknown
  const explicitStates = Array.isArray(rawStates) ? (rawStates as Record<string, unknown>[]) : []
  const fallbackStates = model?.actionDefinitions?.map((a) => ({
    actionDefinitionName: a.name,
    valueType: a.valueType,
    value: a.defaultValue,
  })) ?? []
  const states = explicitStates.length > 0 ? explicitStates : fallbackStates

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <CategoryEmoji category={categoryName} size="lg" />
        <div>
          <p className="text-sm font-semibold text-text-primary">{s(p.name)}</p>
          <div className="flex gap-1.5 mt-0.5 flex-wrap">
            {categoryName && <Badge variant="accent">{categoryName}</Badge>}
            {modelName && <Badge variant="neutral">{modelName}</Badge>}
            {room && (
              <Badge variant="neutral">
                {room.unitName} › {room.name}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {states.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">
            {explicitStates.length > 0 ? 'Initial States' : 'Capabilities'}
          </p>
          <div className="flex flex-col gap-1">
            {states.map((st, i) => {
              const actionName = s(
                (st as Record<string, unknown>).actionDefinitionName
                ?? (st as Record<string, unknown>).action_definition_name,
              )
              const valueType = s(
                (st as Record<string, unknown>).valueType
                ?? (st as Record<string, unknown>).value_type
                ?? 'string',
              )
              const value = s((st as Record<string, unknown>).value ?? '')
              return (
                <div key={i} className="flex items-center justify-between glass-subtle rounded-lg px-3 py-1.5">
                  <span className="text-xs text-text-secondary">{actionName}</span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="neutral" className="text-[9px]">{friendlyValueType(valueType)}</Badge>
                    {value && <span className="text-xs font-mono text-text-primary">{value}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
