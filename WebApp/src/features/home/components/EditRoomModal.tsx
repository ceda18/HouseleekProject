import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog'
import type { LookupItem, RoomDto } from '../../../types/api'

interface EditRoomModalProps {
  room: RoomDto
  roomTypes: LookupItem[]
  onSave: (data: Partial<RoomDto>) => void
  onDelete: () => void
  onClose: () => void
}

export function EditRoomModal({ room, roomTypes, onSave, onDelete, onClose }: EditRoomModalProps) {
  const [name, setName] = useState(room.name)
  const [typeId, setTypeId] = useState(String(room.roomTypeId))
  const [confirmDelete, setConfirmDelete] = useState(false)
  const canDelete = room.items.length === 0

  return (
    <>
      <Modal open title="Edit Room" onClose={onClose}>
        <div className="flex flex-col gap-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Select
            label="Room Type"
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
            options={roomTypes.map((t) => ({ value: t.id, label: t.name }))}
          />

          <div className="flex justify-between mt-2">
            {canDelete ? (
              <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
                Delete Room
              </Button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <AlertCircle size={13} className="text-amber-500 flex-shrink-0" />
                Remove {room.items.length} item{room.items.length !== 1 ? 's' : ''} first to delete.
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button onClick={() => onSave({ ...room, name, roomTypeId: Number(typeId) })}>
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
        title="Delete Room"
        message="Delete this room permanently?"
      />
    </>
  )
}
