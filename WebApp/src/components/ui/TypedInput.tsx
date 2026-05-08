/**
 * TypedInput — single typed value input that adapts its UI to the value type.
 *  - bool/boolean → BoolToggle
 *  - int/double/float/decimal/integer → number input with step + RTL spinners
 *  - everything else → text input
 *
 * Shows inline validation error below the input when min/max bounds or
 * type parsing fails (numeric only). Not displayed for text/bool.
 */
import { useState } from 'react'
import { BoolToggle } from './BoolToggle'
import { isBoolVt, isNumericVt } from '../../lib/valueType'

export interface TypedInputProps {
  valueType: string
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  /** Tailwind classes appended to the wrapper (or input for non-numeric) */
  className?: string
  /** Inclusive lower bound for numeric types (string from backend) */
  min?: string
  /** Inclusive upper bound for numeric types (string from backend) */
  max?: string
  disabled?: boolean
}

export function TypedInput({
  valueType,
  value,
  onChange,
  onBlur,
  className = '',
  min,
  max,
  disabled,
}: TypedInputProps) {
  const [error, setError] = useState<string | null>(null)
  const vt = valueType.toLowerCase()

  if (isBoolVt(vt)) {
    const isOn = value === 'true'
    return (
      <BoolToggle
        isOn={isOn}
        disabled={disabled}
        onToggle={() => onChange(String(!isOn))}
      />
    )
  }

  const isNum = isNumericVt(vt)
  const step = (vt === 'int' || vt === 'integer') ? '1' : 'any'

  const validate = (v: string): string | null => {
    if (!isNum) return null
    const n = (vt === 'int' || vt === 'integer') ? parseInt(v) : parseFloat(v)
    if (v === '' || isNaN(n)) return 'Enter a number'
    if (min != null && n < Number(min)) return `Min ${min}`
    if (max != null && n > Number(max)) return `Max ${max}`
    return null
  }

  return (
    <div className={`relative ${className}`}>
      <input
        type={isNum ? 'number' : 'text'}
        step={isNum ? step : undefined}
        min={isNum ? min : undefined}
        max={isNum ? max : undefined}
        style={isNum ? { direction: 'rtl' } : undefined}
        disabled={disabled}
        className={`input text-xs py-1 px-2 text-right w-full${error ? ' ring-1 ring-red-400' : ''}`}
        value={value}
        onChange={(e) => { setError(validate(e.target.value)); onChange(e.target.value) }}
        onBlur={(e) => { setError(validate(e.target.value)); onBlur?.() }}
        placeholder={isNum ? '0' : '—'}
      />
      {error && (
        <p className="absolute top-full left-0 right-0 mt-0.5 text-[10px] text-red-500 bg-white/95 backdrop-blur rounded px-1 py-0.5 z-10 text-center shadow-sm whitespace-nowrap pointer-events-none">
          {error}
        </p>
      )}
    </div>
  )
}
