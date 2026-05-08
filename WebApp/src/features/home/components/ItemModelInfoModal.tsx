import { Modal } from '../../../components/ui/Modal'
import { Badge } from '../../../components/ui/Badge'
import { CategoryEmoji } from '../../../components/shared/CategoryEmoji'
import { friendlyValueType } from '../../../lib/valueType'
import type { ItemModelDto } from '../../../types/api'

interface ItemModelInfoModalProps {
  model: ItemModelDto
  onClose: () => void
}

export function ItemModelInfoModal({ model, onClose }: ItemModelInfoModalProps) {
  return (
    <Modal open onClose={onClose} title={model.name} size="lg">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <CategoryEmoji category={model.itemCategoryName} size="lg" />
          <div className="flex flex-wrap gap-2">
            <Badge variant="accent">{model.itemCategoryName}</Badge>
            <Badge variant="neutral">{model.vendorName}</Badge>
          </div>
        </div>

        {model.itemProperties.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
              Properties
            </p>
            <div className="grid grid-cols-2 gap-2">
              {model.itemProperties.map((p) => (
                <div key={p.itemPropertyId} className="glass-subtle rounded-xl px-3 py-2">
                  <p className="text-xs text-text-muted">{p.name}</p>
                  <p className="text-sm font-medium text-text-primary">{p.value ?? '—'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {model.actionDefinitions.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
              Capabilities
            </p>
            <div className="flex flex-col gap-2">
              {model.actionDefinitions.map((a) => (
                <div key={a.actionDefinitionId} className="glass-subtle rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-text-primary">{a.name}</p>
                    <Badge variant={a.controllable ? 'success' : 'neutral'}>
                      {a.controllable ? 'Controllable' : 'Sensor'}
                    </Badge>
                    <Badge variant="accent">{friendlyValueType(a.valueType)}</Badge>
                  </div>
                  {(a.minValue != null || a.maxValue != null) && (
                    <p className="text-xs text-text-muted mt-1">
                      Range: {a.minValue ?? '—'} → {a.maxValue ?? '—'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
