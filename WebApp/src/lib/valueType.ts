/**
 * Single source of truth for value-type handling across the app.
 * Backend `ActionDefinition.ValueType` is one of: int/integer, double/float/decimal,
 * bool/boolean, string, datetime/date.
 */

/** Returns true for any numeric value type (int, double, float, decimal, integer) */
export function isNumericVt(vt: string): boolean {
  const v = vt.toLowerCase()
  return v === 'int' || v === 'integer' || v === 'double' || v === 'float' || v === 'decimal'
}

/** Returns true for boolean value type */
export function isBoolVt(vt: string): boolean {
  const v = vt.toLowerCase()
  return v === 'bool' || v === 'boolean'
}

/** Translates raw backend value-type strings to human-friendly UI labels */
export function friendlyValueType(vt: string): string {
  switch (vt.toLowerCase()) {
    case 'bool': case 'boolean': return 'Toggle'
    case 'int': case 'integer': return 'Number'
    case 'double': case 'float': case 'decimal': return 'Number'
    case 'string': return 'Text'
    case 'datetime': case 'date': return 'Date / Time'
    default: return vt
  }
}

/** Returns a sensible default value string for a given valueType (never empty for typed inputs) */
export function defaultFor(valueType: string): string {
  switch (valueType.toLowerCase()) {
    case 'bool': case 'boolean': return 'false'
    case 'int': case 'integer': return '0'
    case 'double': case 'float': case 'decimal': return '0'
    default: return ''
  }
}

/**
 * Converts a UI string value to the proper JSON-serializable type.
 * Backend expects boolean true/false (not "true"), number 25 (not "25"), etc.
 */
export function serializeValue(
  value: string,
  valueType: string,
): string | number | boolean {
  const vt = valueType.toLowerCase()
  if (vt === 'bool' || vt === 'boolean') return value === 'true'
  if (vt === 'int' || vt === 'integer') {
    const n = parseInt(value)
    return isNaN(n) ? 0 : n
  }
  if (vt === 'double' || vt === 'float' || vt === 'decimal') {
    const n = parseFloat(value)
    return isNaN(n) ? 0 : n
  }
  return value
}
