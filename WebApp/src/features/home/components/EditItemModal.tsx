import { useState } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog'
import { CategoryEmoji } from '../../../components/shared/CategoryEmoji'
import type { ItemDto } from '../../../types/api'

interface EditItemModalProps {
  item: ItemDto
  allRooms: { roomId: number; name: string; unitName: string }[]
  onSave: (data: Partial<ItemDto>) => void
  onDelete: () => void
  onClose: () => void
}

export function EditItemModal({ item, allRooms, onSave, onDelete, onClose }: EditItemModalProps) {
  const [name, setName] = useState(item.name)
  const [roomId, setRoomId] = useState(String(item.roomId))
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <>
      <Modal open title="Edit Device" onClose={onClose}>
        <div className="flex flex-col gap-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Model</p>
            <div className="glass-subtle rounded-xl px-3 py-2.5 flex items-center gap-2">
              <CategoryEmoji category={item.itemCategoryName} size="sm" />
              <span className="text-sm text-text-primary">{item.itemModelName}</span>
              <span className="text-xs text-text-muted ml-auto">{item.itemCategoryName}</span>
            </div>
          </div>
          <Select
            label="Room"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            options={allRooms.map((r) => ({
              value: r.roomId,
              label: `${r.unitName} › ${r.name}`,
            }))}
          />
          <div className="flex justify-between mt-2">
            <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
              Delete Device
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button onClick={() => onSave({ ...item, name, roomId: Number(roomId) })}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </Modal>
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={onDelete}
        title="Delete Device"
        message={`Delete "${item.name}"? This cannot be undone.`}
      />
    </>
  )
}
