/**
 * Local UI types for the workflow builders (Scene & Automation modals).
 * These mirror the wire DTOs but with the form-friendly shape used by the
 * ActionBuilder / TriggerBuilder components.
 */

/** Discriminated union — an action is either a device-state change or a scene call. */
export type ActionEntry =
  | {
      type: 'device'
      itemStateId: number
      itemName: string
      itemCategoryName: string
      actionDefinitionName: string
      valueType: string
      value: string
      minValue?: string
      maxValue?: string
    }
  | {
      type: 'scene'
      targetSceneId: number
      targetSceneName: string
    }

/** A trigger is either a daily schedule (HH:MM) or a device-state predicate. */
export interface TriggerEntry {
  triggerType: 'schedule' | 'state'
  timeValue?: string
  itemStateId?: number
  itemName?: string
  actionDefinitionName?: string
  itemCategoryName?: string
  valueType?: string
  operand?: string
  value?: string
  minValue?: string
  maxValue?: string
}

/** Comparison operands supported by automation state triggers (UI-side). */
export const OPERANDS = ['=', '>', '<']
