import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog'
import type { LookupItem, UnitDto } from '../../../types/api'

interface EditUnitModalProps {
  unit: UnitDto
  unitTypes: LookupItem[]
  onSave: (data: Partial<UnitDto>) => void
  onDelete: () => void
  onClose: () => void
}

export function EditUnitModal({ unit, unitTypes, onSave, onDelete, onClose }: EditUnitModalProps) {
  const [name, setName] = useState(unit.name)
  const [typeId, setTypeId] = useState(String(unit.unitTypeId))
  const [confirmDelete, setConfirmDelete] = useState(false)
  const canDelete = unit.rooms.length === 0

  return (
    <>
      <Modal open title="Edit Unit" onClose={onClose}>
        <div className="flex flex-col gap-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Select
            label="Unit Type"
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
            options={unitTypes.map((t) => ({ value: t.id, label: t.name }))}
          />

          <div className="flex justify-between mt-2">
            {canDelete ? (
              <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
                Delete Unit
              </Button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <AlertCircle size={13} className="text-amber-500 flex-shrink-0" />
                Remove {unit.rooms.length} room{unit.rooms.length !== 1 ? 's' : ''} first to delete.
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button onClick={() => onSave({ ...unit, name, unitTypeId: Number(typeId) })}>
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
        title="Delete Unit"
        message="Delete this unit permanently?"
      />
    </>
  )
}
