import { useState } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import type { LookupItem } from '../../../types/api'

interface AddRoomModalProps {
  roomTypes: LookupItem[]
  onSave: (name: string, typeId: number) => void
  onClose: () => void
}

export function AddRoomModal({ roomTypes, onSave, onClose }: AddRoomModalProps) {
  const [name, setName] = useState('')
  const [typeId, setTypeId] = useState('')

  return (
    <Modal open title="Add Room" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Living Room"
          autoFocus
        />
        <Select
          label="Room Type"
          value={typeId}
          onChange={(e) => setTypeId(e.target.value)}
          options={roomTypes.map((t) => ({ value: t.id, label: t.name }))}
          placeholder="Select type…"
        />
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => onSave(name, Number(typeId))}
            disabled={!name.trim() || !typeId}
          >
            Add Room
          </Button>
        </div>
      </div>
    </Modal>
  )
}
