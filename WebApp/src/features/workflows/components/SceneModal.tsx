import { useState } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { useScenes } from '../../../hooks/useScenes'
import { useActionForm } from '../hooks/useActionForm'
import { ActionBuilder } from './ActionBuilder'
import type { SceneDto } from '../../../types/api'

interface SceneModalProps {
  open: boolean
  onClose: () => void
  existing?: SceneDto
  userId?: number
}

export function SceneModal({ open, onClose, existing, userId }: SceneModalProps) {
  const { create, update } = useScenes()
  const [name, setName] = useState(existing?.name ?? '')
  const form = useActionForm(existing?.smartActions)

  const submit = () => {
    const payload: Partial<SceneDto> = {
      ...(existing ? { sceneId: existing.sceneId } : {}),
      name,
      userId,
      smartActions: form.toDtoList(),
    }
    const onSuccess = () => onClose()
    if (existing) update.mutate(payload as SceneDto, { onSuccess })
    else create.mutate(payload, { onSuccess })
  }

  const canSubmit = name.trim() !== '' && form.actions.length > 0

  return (
    <Modal open={open} onClose={onClose} title={existing ? 'Edit Scene' : 'Create Scene'} size="lg">
      <div className="flex flex-col gap-5">
        <Input
          label="Scene Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Good Night"
          autoFocus
        />
        {/* Scenes cannot call other scenes — pass empty list to hide the Scene action button */}
        <ActionBuilder form={form} availableScenes={[]} />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={submit}
            disabled={!canSubmit}
            loading={create.isPending || update.isPending}
          >
            {existing ? 'Save Changes' : 'Create Scene'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
