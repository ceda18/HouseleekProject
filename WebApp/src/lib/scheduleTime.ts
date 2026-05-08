/**
 * Schedule trigger time encoding helpers.
 * Backend stores `value` as DateTime ISO string; UI works with "HH:MM".
 */

/** "HH:MM" → "2000-01-01THH:MM:00" (valid ISO datetime for backend) */
export function encodeScheduleTime(hhmm: string): string {
  return `2000-01-01T${hhmm}:00`
}

/** Extract "HH:MM" from stored value ("2000-01-01THH:MM:00" or raw "HH:MM") */
export function decodeScheduleTime(value: string): string {
  const m = value.match(/T(\d{2}:\d{2})/)
  return m ? m[1] : value
}
