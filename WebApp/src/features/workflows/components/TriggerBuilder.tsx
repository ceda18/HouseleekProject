/**
 * TriggerBuilder — UI portion of the triggers list (Automation modal only).
 * Operand selector is shown only for numeric value types.
 */
import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Select } from '../../../components/ui/Select'
import { TypedInput } from '../../../components/ui/TypedInput'
import { CategoryEmoji } from '../../../components/shared/CategoryEmoji'
import { ItemStatePicker } from '../../../components/shared/ItemStatePicker'
import { isNumericVt } from '../../../lib/valueType'
import { defaultFor } from '../../../lib/valueType'
import { OPERANDS } from '../lib/workflowTypes'
import type { useTriggerForm } from '../hooks/useTriggerForm'

interface TriggerBuilderProps {
  form: ReturnType<typeof useTriggerForm>
}

export function TriggerBuilder({ form }: TriggerBuilderProps) {
  const { triggers, addSchedule, addState, remove, setOperand, setValue } = form

  const [pickerOpen, setPickerOpen] = useState(false)
  const [addType, setAddType] = useState<'schedule' | 'state' | null>(null)
  const [timeVal, setTimeVal] = useState('')

  const handleAddSchedule = () => {
    if (!timeVal) return
    addSchedule(timeVal)
    setTimeVal('')
    setAddType(null)
  }

  const handleStatePicked = (state: Parameters<typeof addState>[0]) => {
    addState(state)
    setAddType(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Triggers</p>
        {addType === null && (
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => setAddType('schedule')}>+ Schedule</Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setAddType('state'); setPickerOpen(true) }}
            >
              + Device State
            </Button>
          </div>
        )}
      </div>

      {addType === 'schedule' && (
        <div className="glass-subtle rounded-xl px-3 py-2.5 flex items-center gap-2 mb-2">
          <span className="text-xs text-text-secondary">Time</span>
          <input
            className="input w-28 text-xs py-1 px-2"
            type="time"
            value={timeVal}
            onChange={(e) => setTimeVal(e.target.value)}
          />
          <Button size="sm" onClick={handleAddSchedule} disabled={!timeVal}>Add</Button>
          <Button variant="ghost" size="sm" onClick={() => setAddType(null)}>Cancel</Button>
        </div>
      )}

      {triggers.length === 0 && (
        <p className="text-xs text-text-muted py-3 text-center glass-subtle rounded-xl">
          No triggers yet.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {triggers.map((t, i) => {
          const vt = (t.valueType ?? '').toLowerCase()
          const isNum = isNumericVt(vt)

          return (
            <div key={i} className="glass-subtle rounded-xl px-3 py-2.5 flex items-center gap-3">
              {t.triggerType === 'schedule' ? (
                <>
                  <span>⏰</span>
                  <span className="text-xs font-medium text-text-primary flex-1">
                    Daily at {t.timeValue}
                  </span>
                </>
              ) : (
                <>
                  <CategoryEmoji category={t.itemCategoryName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">
                      {t.itemName} · {t.actionDefinitionName}
                    </p>
                  </div>
                  {isNum ? (
                    <Select
                      value={t.operand ?? '='}
                      onChange={(e) => setOperand(i, e.target.value)}
                      options={OPERANDS.map((o) => ({ value: o, label: o }))}
                      className="w-14 text-xs py-1 px-1"
                    />
                  ) : (
                    <span className="text-xs text-text-muted w-5 text-center">=</span>
                  )}
                  <TypedInput
                    valueType={t.valueType ?? 'string'}
                    value={t.value ?? defaultFor(t.valueType ?? 'string')}
                    onChange={(v) => setValue(i, v)}
                    min={t.minValue}
                    max={t.maxValue}
                    className="w-20"
                  />
                </>
              )}
              <button onClick={() => remove(i)} aria-label="Remove trigger">
                <X size={13} className="text-red-400" />
              </button>
            </div>
          )
        })}
      </div>

      <ItemStatePicker
        open={pickerOpen}
        onClose={() => { setPickerOpen(false); setAddType(null) }}
        onSelect={handleStatePicked}
        filterControllable={false}
      />
    </div>
  )
}
