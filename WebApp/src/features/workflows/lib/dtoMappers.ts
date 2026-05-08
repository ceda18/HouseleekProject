/**
 * Mappers between UI-side action/trigger entries and wire DTOs.
 * Single place that knows about value serialization & schedule encoding.
 */
import type { AutomationTriggerDto, SmartActionDto } from '../../../types/api'
import { defaultFor, isNumericVt, serializeValue } from '../../../lib/valueType'
import { encodeScheduleTime, decodeScheduleTime } from '../../../lib/scheduleTime'
import type { ActionEntry, TriggerEntry } from './workflowTypes'

// ─── UI → DTO ────────────────────────────────────────────────────────────────

export function actionEntryToDto(a: ActionEntry): SmartActionDto {
  if (a.type === 'scene') {
    return { smartActionId: 0, targetSceneId: a.targetSceneId, value: null }
  }
  return {
    smartActionId: 0,
    itemStateId: a.itemStateId,
    value: serializeValue(a.value, a.valueType),
  }
}

/**
 * DB CHECK constraints (see Database/schema.sql):
 *   trigger_type IN ('state-driven', 'time-driven')
 *   value_type   IN ('string', 'int', 'double', 'bool', 'DateTime')
 *   operand      IN ('<', '>', '=')
 *
 * Internal UI uses friendlier names ('schedule', 'state'). Map them at the boundary.
 */
function uiTriggerTypeToWire(t: TriggerEntry['triggerType']): string {
  return t === 'schedule' ? 'time-driven' : 'state-driven'
}

/** Normalize valueType to one accepted by the DB CHECK constraint. */
function normalizeValueTypeForWire(vt: string): string {
  const v = vt.toLowerCase()
  if (v === 'integer') return 'int'
  if (v === 'boolean') return 'bool'
  if (v === 'float' || v === 'decimal') return 'double'
  if (v === 'datetime' || v === 'date') return 'DateTime'
  // 'string', 'int', 'double', 'bool' pass through
  return v
}

export function triggerEntryToDto(t: TriggerEntry): Partial<AutomationTriggerDto> {
  const isSchedule = t.triggerType === 'schedule'
  const rawValueType = isSchedule ? 'DateTime' : (t.valueType ?? 'string')
  return {
    automationTriggerId: 0,
    triggerType: uiTriggerTypeToWire(t.triggerType),
    valueType: normalizeValueTypeForWire(rawValueType),
    value: isSchedule
      ? encodeScheduleTime(t.timeValue ?? '00:00')
      : serializeValue(t.value ?? defaultFor(t.valueType ?? 'string'), t.valueType ?? 'string'),
    operand:
      t.triggerType === 'state'
        ? (isNumericVt(t.valueType ?? '') ? (t.operand ?? '=') : '=')
        : null,
    itemStateId: t.triggerType === 'state' ? t.itemStateId : null,
  }
}

// ─── DTO → UI (for Edit modals) ──────────────────────────────────────────────

export function smartActionToEntry(a: SmartActionDto): ActionEntry {
  if (a.targetSceneId != null) {
    return {
      type: 'scene',
      targetSceneId: a.targetSceneId,
      targetSceneName: a.targetSceneName ?? '',
    }
  }
  const valueType = a.valueType ?? 'string'
  return {
    type: 'device',
    itemStateId: a.itemStateId ?? 0,
    itemName: a.itemName ?? '',
    itemCategoryName: a.itemCategoryName ?? '',
    actionDefinitionName: a.actionDefinitionName ?? '',
    valueType,
    value: String(a.value ?? defaultFor(valueType)),
  }
}

export function triggerDtoToEntry(t: AutomationTriggerDto): TriggerEntry {
  // Backend stores 'state-driven' | 'time-driven'; tolerate older 'state'/'schedule' values too.
  const isSchedule = t.triggerType === 'time-driven' || t.triggerType === 'schedule'
  return {
    triggerType: isSchedule ? 'schedule' : 'state',
    timeValue: isSchedule ? decodeScheduleTime(String(t.value)) : undefined,
    itemStateId: t.itemStateId ?? undefined,
    itemName: t.itemName ?? undefined,
    actionDefinitionName: t.actionDefinitionName ?? undefined,
    itemCategoryName: t.itemCategoryName ?? undefined,
    valueType: t.valueType,
    operand: t.operand ?? '=',
    value: !isSchedule
      ? String(t.value ?? defaultFor(t.valueType ?? 'string'))
      : undefined,
  }
}
