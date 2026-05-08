/**
 * StateControl — single device state control row.
 * Bool → toggle (saves immediately).
 * Numeric / text → typed input that saves on blur (with bounds validation).
 * Sensor (non-controllable) → read-only formatted value.
 */
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { activityApi } from '../../../api/activity'
import { BoolToggle } from '../../../components/ui/BoolToggle'
import { TypedInput } from '../../../components/ui/TypedInput'
import { isBoolVt, isNumericVt } from '../../../lib/valueType'
import type { ActionDefinitionDto, ItemDto, ItemStateDto } from '../../../types/api'

interface StateControlProps {
  state: ItemStateDto
  item: ItemDto
  actionDef?: ActionDefinitionDto
}

export function StateControl({ state, item, actionDef }: StateControlProps) {
  const qc = useQueryClient()
  const [val, setVal] = useState(String(state.value ?? ''))
  const [error, setError] = useState<string | null>(null)

  const validate = (v: string): string | null => {
    if (!actionDef) return null
    const vt = (actionDef.valueType ?? '').toLowerCase()
    if (!isNumericVt(vt)) return null
    const n = (vt === 'int' || vt === 'integer') ? parseInt(v) : parseFloat(v)
    if (v === '' || isNaN(n)) return 'Enter a number'
    if (actionDef.minValue != null && n < Number(actionDef.minValue)) return `Min ${actionDef.minValue}`
    if (actionDef.maxValue != null && n > Number(actionDef.maxValue)) return `Max ${actionDef.maxValue}`
    return null
  }

  const save = (newVal: string) => {
    const err = validate(newVal)
    if (err) { setError(err); return }
    setError(null)
    const updated: ItemDto = {
      ...item,
      itemStates: item.itemStates.map((s) =>
        s.itemStateId === state.itemStateId ? { ...s, value: newVal } : s,
      ),
    }
    activityApi.updateItemState(updated).then(() =>
      qc.invalidateQueries({ queryKey: ['units'] }),
    )
  }

  if (!state.controllable) {
    return (
      <span className="text-xs font-mono text-text-muted ml-auto">
        {String(state.value ?? '—')}
      </span>
    )
  }

  const vt = (actionDef?.valueType ?? state.valueType ?? '').toLowerCase()

  if (isBoolVt(vt)) {
    const isOn = String(state.value) === 'true'
    return (
      <div className="ml-auto">
        <BoolToggle isOn={isOn} onToggle={() => save(String(!isOn))} />
      </div>
    )
  }

  return (
    <div className="ml-auto flex flex-col items-end gap-0.5">
      <TypedInput
        valueType={vt || 'string'}
        value={val}
        onChange={(v) => { setVal(v); setError(null) }}
        onBlur={() => save(val)}
        min={actionDef?.minValue}
        max={actionDef?.maxValue}
        className="w-20"
      />
      {error && <p className="text-[10px] text-red-500">{error}</p>}
    </div>
  )
}
