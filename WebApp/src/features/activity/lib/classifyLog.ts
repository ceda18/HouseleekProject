import type { ActionLogDto } from '../../../types/api'

export type FilterType = 'all' | 'manual' | 'automation' | 'scene'

function extractSourceString(source: unknown): string {
  if (!source) return ''
  if (typeof source === 'string') return source.toLowerCase()
  if (typeof source === 'object') {
    try {
      const j = JSON.stringify(source).toLowerCase()
      return j === '{}' ? '' : j
    } catch { return '' }
  }
  return String(source).toLowerCase()
}

export function classifyLog(log: ActionLogDto): Exclude<FilterType, 'all'> {
  const s = extractSourceString(log.triggerSource)
  if (s.includes('auto')) return 'automation'
  if (s.includes('scene')) return 'scene'
  if (s.includes('manual') || s.includes('api') || s.includes('user')) return 'manual'
  if (log.smartWorkflowId) return 'automation'
  return 'manual'
}

export function formatLogValue(v: unknown): string {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}
