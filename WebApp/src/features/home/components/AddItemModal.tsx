import { useState } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { CategoryEmoji } from '../../../components/shared/CategoryEmoji'
import type { ItemModelDto } from '../../../types/api'

interface AddItemModalProps {
  roomId: number
  model: ItemModelDto
  onSave: (name: string, roomId: number, modelId: number) => void
  onClose: () => void
  onChangeModel: () => void
}

export function AddItemModal({ roomId, model, onSave, onClose, onChangeModel }: AddItemModalProps) {
  const [name, setName] = useState('')

  return (
    <Modal open title="Add Device" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Input
          label="Device Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Bedroom Light"
          autoFocus
        />
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Model</p>
          <button
            onClick={onChangeModel}
            className="glass-subtle rounded-xl px-3 py-2.5 flex items-center gap-2 hover:bg-white/50 transition-colors text-left w-full"
          >
            <CategoryEmoji category={model.itemCategoryName} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary font-medium">{model.name}</p>
              <p className="text-xs text-text-muted">{model.vendorName} · {model.itemCategoryName}</p>
            </div>
            <span className="text-xs text-accent">Change</span>
          </button>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => onSave(name, roomId, model.itemModelId)}
            disabled={!name.trim()}
          >
            Add Device
          </Button>
        </div>
      </div>
    </Modal>
  )
}
