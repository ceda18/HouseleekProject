import { useState } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import type { LookupItem } from '../../../types/api'

interface AddUnitModalProps {
  unitTypes: LookupItem[]
  onSave: (name: string, typeId: number) => void
  onClose: () => void
}

export function AddUnitModal({ unitTypes, onSave, onClose }: AddUnitModalProps) {
  const [name, setName] = useState('')
  const [typeId, setTypeId] = useState('')

  return (
    <Modal open title="Add Unit" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My House"
          autoFocus
        />
        <Select
          label="Unit Type"
          value={typeId}
          onChange={(e) => setTypeId(e.target.value)}
          options={unitTypes.map((t) => ({ value: t.id, label: t.name }))}
          placeholder="Select type…"
        />
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => onSave(name, Number(typeId))}
            disabled={!name.trim() || !typeId}
          >
            Add Unit
          </Button>
        </div>
      </div>
    </Modal>
  )
}
