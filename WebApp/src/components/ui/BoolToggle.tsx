/**
 * BoolToggle — iOS-style switch for boolean values.
 * Single source of truth, used by HomePage state controls and Workflows builders.
 */

interface BoolToggleProps {
  isOn: boolean
  onToggle: () => void
  disabled?: boolean
}

export function BoolToggle({ isOn, onToggle, disabled }: BoolToggleProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-50 ${
        isOn ? 'bg-accent' : 'bg-border'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
          isOn ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}
