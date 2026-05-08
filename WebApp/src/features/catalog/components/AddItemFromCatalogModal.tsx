import { useState } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { CategoryEmoji } from '../../../components/shared/CategoryEmoji'
import { useUnits } from '../../../hooks/useUnits'
import type { ItemModelDto } from '../../../types/api'

interface AddItemFromCatalogModalProps {
  model: ItemModelDto
  onClose: () => void
}

export function AddItemFromCatalogModal({ model, onClose }: AddItemFromCatalogModalProps) {
  const { units, createItem } = useUnits()
  const allRooms = units.flatMap((u) =>
    u.rooms.map((r) => ({ value: r.roomId, label: `${u.name} › ${r.name}` })),
  )

  const [name, setName] = useState('')
  const [roomId, setRoomId] = useState('')

  return (
    <Modal open onClose={onClose} title={`Add Device — ${model.name}`}>
      <div className="flex flex-col gap-4">
        <div className="glass-subtle rounded-xl px-3 py-2.5 flex items-center gap-2">
          <CategoryEmoji category={model.itemCategoryName} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary">{model.name}</p>
            <p className="text-xs text-text-muted">{model.vendorName} · {model.itemCategoryName}</p>
          </div>
        </div>

        <Input
          label="Device Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Bedroom Light"
          autoFocus
        />
        <Select
          label="Room"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          options={allRooms}
          placeholder="Select room…"
        />

        <div className="flex justify-end gap-2 mt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!name.trim() || !roomId}
            loading={createItem.isPending}
            onClick={() =>
              createItem.mutate({
                itemId: 0,
                name,
                roomId: Number(roomId),
                itemModelId: model.itemModelId,
                itemModelName: '',
                itemCategoryName: '',
                itemStates: [],
              }, { onSuccess: onClose })
            }
          >
            Add Device
          </Button>
        </div>
      </div>
    </Modal>
  )
}
