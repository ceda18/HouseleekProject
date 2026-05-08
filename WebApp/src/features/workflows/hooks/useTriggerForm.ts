/**
 * useTriggerForm — view-model for the "list of triggers" portion of an Automation modal.
 * Same shape as useActionForm: owns the list, handles enrichment (min/max),
 * and exposes an add/remove/update API.
 */
import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { AutomationTriggerDto, ItemModelDto } from '../../../types/api'
import type { PickedState } from '../../../components/shared/ItemStatePicker'
import { defaultFor } from '../../../lib/valueType'
import { triggerDtoToEntry, triggerEntryToDto } from '../lib/dtoMappers'
import type { TriggerEntry } from '../lib/workflowTypes'

export function useTriggerForm(initial?: AutomationTriggerDto[]) {
  const qc = useQueryClient()
  const [triggers, setTriggers] = useState<TriggerEntry[]>(
    initial?.map(triggerDtoToEntry) ?? [],
  )

  const addSchedule = useCallback((hhmm: string) => {
    setTriggers((prev) => [...prev, { triggerType: 'schedule', timeValue: hhmm }])
  }, [])

  const addState = useCallback((state: PickedState) => {
    const models = qc.getQueryData<ItemModelDto[]>(['item-models']) ?? []
    const ad = models
      .flatMap((m) => m.actionDefinitions)
      .find((a) => a.actionDefinitionId === state.actionDefinitionId)

    setTriggers((prev) => [
      ...prev,
      {
        triggerType: 'state',
        itemStateId: state.itemStateId,
        itemName: state.itemName,
        actionDefinitionName: state.actionDefinitionName,
        itemCategoryName: state.itemCategoryName,
        valueType: state.valueType,
        operand: '=',
        value: defaultFor(state.valueType),
        minValue: ad?.minValue,
        maxValue: ad?.maxValue,
      },
    ])
  }, [qc])

  const remove = useCallback((index: number) => {
    setTriggers((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const setOperand = useCallback((index: number, operand: string) => {
    setTriggers((prev) => prev.map((t, i) => (i === index ? { ...t, operand } : t)))
  }, [])

  const setValue = useCallback((index: number, value: string) => {
    setTriggers((prev) => prev.map((t, i) => (i === index ? { ...t, value } : t)))
  }, [])

  const toDtoList = useCallback(() => triggers.map(triggerEntryToDto), [triggers])

  return { triggers, addSchedule, addState, remove, setOperand, setValue, toDtoList }
}
