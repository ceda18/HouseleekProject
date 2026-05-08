/**
 * useExpansion — manages expanded/collapsed state for the unit/room tree.
 * Exposes toggle helpers and a global "expand all"/"collapse all" action.
 */
import { useCallback, useState } from 'react'
import type { UnitDto } from '../../../types/api'

export function useExpansion(units: UnitDto[]) {
  const [expandedUnits, setExpandedUnits] = useState<Set<number>>(new Set())
  const [expandedRooms, setExpandedRooms] = useState<Set<number>>(new Set())

  const allExpanded =
    units.length > 0 &&
    units.every((u) => expandedUnits.has(u.unitId)) &&
    units.every((u) => u.rooms.every((r) => expandedRooms.has(r.roomId)))

  const toggleAll = useCallback(() => {
    if (allExpanded) {
      setExpandedUnits(new Set())
      setExpandedRooms(new Set())
    } else {
      setExpandedUnits(new Set(units.map((u) => u.unitId)))
      setExpandedRooms(new Set(units.flatMap((u) => u.rooms.map((r) => r.roomId))))
    }
  }, [allExpanded, units])

  const toggleUnit = useCallback((id: number) => {
    setExpandedUnits((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }, [])

  const toggleRoom = useCallback((id: number) => {
    setExpandedRooms((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }, [])

  return { expandedUnits, expandedRooms, allExpanded, toggleAll, toggleUnit, toggleRoom }
}
