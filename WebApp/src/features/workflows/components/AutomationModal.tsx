import { useState } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { useScenes } from '../../../hooks/useScenes'
import { useAutomations } from '../../../hooks/useAutomations'
import { useActionForm } from '../hooks/useActionForm'
import { useTriggerForm } from '../hooks/useTriggerForm'
import { ActionBuilder } from './ActionBuilder'
import { TriggerBuilder } from './TriggerBuilder'
import type { AutomationDto, AutomationTriggerDto, SmartActionDto } from '../../../types/api'

interface AutomationModalProps {
  open: boolean
  onClose: () => void
  existing?: AutomationDto
  userId?: number
}

export function AutomationModal({ open, onClose, existing, userId }: AutomationModalProps) {
  const { scenes } = useScenes()
  const { create, update } = useAutomations()
  const [name, setName] = useState(existing?.name ?? '')
  const triggerForm = useTriggerForm(existing?.triggers)
  const actionForm = useActionForm(existing?.smartActions)

  const submit = () => {
    const payload: Partial<AutomationDto> = {
      ...(existing ? { automationId: existing.automationId } : {}),
      name,
      userId,
      triggers: triggerForm.toDtoList() as AutomationTriggerDto[],
      smartActions: actionForm.toDtoList() as SmartActionDto[],
    }
    const onSuccess = () => onClose()
    if (existing) update.mutate(payload as AutomationDto, { onSuccess })
    else create.mutate(payload, { onSuccess })
  }

  const canSubmit =
    name.trim() !== ''
    && triggerForm.triggers.length > 0
    && actionForm.actions.length > 0

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={existing ? 'Edit Automation' : 'Create Automation'}
      size="lg"
    >
      <div className="flex flex-col gap-5">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Good Morning"
          autoFocus
        />
        <TriggerBuilder form={triggerForm} />
        <ActionBuilder form={actionForm} availableScenes={scenes} />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={submit}
            disabled={!canSubmit}
            loading={create.isPending || update.isPending}
          >
            {existing ? 'Save Changes' : 'Create Automation'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
