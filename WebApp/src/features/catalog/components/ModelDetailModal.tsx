import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { CategoryEmoji } from '../../../components/shared/CategoryEmoji'
import { friendlyValueType } from '../../../lib/valueType'
import type { ItemModelDto } from '../../../types/api'

interface ModelDetailModalProps {
  model: ItemModelDto
  onClose: () => void
  onAddItem: () => void
}

export function ModelDetailModal({ model, onClose, onAddItem }: ModelDetailModalProps) {
  return (
    <Modal open onClose={onClose} title={model.name} size="lg">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <CategoryEmoji category={model.itemCategoryName} size="lg" />
          <div>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="accent">{model.itemCategoryName}</Badge>
              <Badge variant="neutral">{model.vendorName}</Badge>
            </div>
          </div>
          <Button className="ml-auto" onClick={onAddItem}>Add to Home</Button>
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
                <div
                  key={a.actionDefinitionId}
                  className="glass-subtle rounded-xl px-3 py-2.5 flex items-center gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-text-primary">{a.name}</p>
                      <Badge variant={a.controllable ? 'success' : 'neutral'}>
                        {a.controllable ? 'Controllable' : 'Sensor'}
                      </Badge>
                      <Badge variant="accent">{friendlyValueType(a.valueType)}</Badge>
                    </div>
                    {(a.minValue !== undefined || a.maxValue !== undefined) && (
                      <p className="text-xs text-text-muted mt-0.5">
                        Range: {a.minValue ?? '—'} → {a.maxValue ?? '—'}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
