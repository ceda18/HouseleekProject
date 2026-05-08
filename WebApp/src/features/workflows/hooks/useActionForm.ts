/**
 * useActionForm — view-model for the "list of actions" portion of Scene/Automation modals.
 *
 * Owns the in-progress list of action entries. Looks up min/max for newly picked
 * device states from the cached item-models so TypedInput can validate bounds.
 */
import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { ItemModelDto, SceneDto, SmartActionDto } from '../../../types/api'
import type { PickedState } from '../../../components/shared/ItemStatePicker'
import { defaultFor } from '../../../lib/valueType'
import { actionEntryToDto, smartActionToEntry } from '../lib/dtoMappers'
import type { ActionEntry } from '../lib/workflowTypes'

export function useActionForm(initial?: SmartActionDto[]) {
  const qc = useQueryClient()
  const [actions, setActions] = useState<ActionEntry[]>(
    initial?.map(smartActionToEntry) ?? [],
  )

  const addDevice = useCallback((state: PickedState) => {
    const models = qc.getQueryData<ItemModelDto[]>(['item-models']) ?? []
    const ad = models
      .flatMap((m) => m.actionDefinitions)
      .find((a) => a.actionDefinitionId === state.actionDefinitionId)

    setActions((prev) => [
      ...prev,
      {
        type: 'device',
        itemStateId: state.itemStateId,
        itemName: state.itemName,
        itemCategoryName: state.itemCategoryName,
        actionDefinitionName: state.actionDefinitionName,
        valueType: state.valueType,
        value: defaultFor(state.valueType),
        minValue: ad?.minValue,
        maxValue: ad?.maxValue,
      },
    ])
  }, [qc])

  const addScene = useCallback((scene: SceneDto) => {
    setActions((prev) => [
      ...prev,
      { type: 'scene', targetSceneId: scene.sceneId, targetSceneName: scene.name },
    ])
  }, [])

  const remove = useCallback((index: number) => {
    setActions((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const setValue = useCallback((index: number, value: string) => {
    setActions((prev) =>
      prev.map((a, i) => (i === index && a.type === 'device' ? { ...a, value } : a)),
    )
  }, [])

  const toDtoList = useCallback(() => actions.map(actionEntryToDto), [actions])

  return { actions, addDevice, addScene, remove, setValue, toDtoList }
}
