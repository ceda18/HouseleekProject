/**
 * Helpers for rendering AI proposal payloads.
 * Build a `itemStateId → human metadata` map from cached units, so proposals
 * coming from the agent (which only carry IDs) can be displayed with names + emoji.
 */
import type { UnitDto } from '../../../types/api'

export interface StateInfo {
  itemName: string
  categoryName: string
  actionName: string
}

export type StateMap = Map<number, StateInfo>

export function buildStateMap(units: UnitDto[]): StateMap {
  const map: StateMap = new Map()
  for (const unit of units)
    for (const room of unit.rooms)
      for (const item of room.items)
        for (const state of item.itemStates)
          map.set(state.itemStateId, {
            itemName: item.name,
            categoryName: item.itemCategoryName,
            actionName: state.actionDefinitionName,
          })
  return map
}

/** Safe stringify for unknown payload values */
export function s(v: unknown): string {
  if (v === null || v === undefined) return '—'
  return String(v)
}
