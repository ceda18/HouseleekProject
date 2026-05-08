/**
 * useUnits — single hook covering units/rooms/items state.
 * Encapsulates queries, mutations, and shared derived data (allRooms, item lookup).
 * Pages stay declarative; orchestrating logic lives here.
 */
import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { homeApi } from '../api/home'
import { activityApi } from '../api/activity'
import type { ItemDto, RoomDto, UnitDto } from '../types/api'

export function useUnits() {
  const qc = useQueryClient()
  const inv = () => qc.invalidateQueries({ queryKey: ['units'] })

  const { data: units = [], isLoading } = useQuery({
    queryKey: ['units'],
    queryFn: homeApi.getUnits,
  })

  // Units mutations
  const createUnit = useMutation({ mutationFn: homeApi.createUnit, onSuccess: inv })
  const updateUnit = useMutation({ mutationFn: homeApi.updateUnit, onSuccess: inv })
  const deleteUnit = useMutation({ mutationFn: homeApi.deleteUnit, onSuccess: inv })

  // Rooms mutations
  const createRoom = useMutation({ mutationFn: homeApi.createRoom, onSuccess: inv })
  const updateRoom = useMutation({ mutationFn: homeApi.updateRoom, onSuccess: inv })
  const deleteRoom = useMutation({ mutationFn: homeApi.deleteRoom, onSuccess: inv })

  // Items mutations
  const createItem = useMutation({ mutationFn: homeApi.createItem, onSuccess: inv })
  const updateItem = useMutation({ mutationFn: homeApi.updateItem, onSuccess: inv })
  const deleteItem = useMutation({ mutationFn: homeApi.deleteItem, onSuccess: inv })

  // Item state mutation (used for control toggles in HomePage)
  const updateItemState = useMutation({ mutationFn: activityApi.updateItemState, onSuccess: inv })

  // Derived: every room flat with parent unit info (for moving items, etc.)
  const allRooms = useMemo(
    () =>
      units.flatMap((u) =>
        u.rooms.map((r) => ({ roomId: r.roomId, name: r.name, unitName: u.name })),
      ),
    [units],
  )

  return {
    units,
    isLoading,
    allRooms,
    createUnit,
    updateUnit,
    deleteUnit,
    createRoom,
    updateRoom,
    deleteRoom,
    createItem,
    updateItem,
    deleteItem,
    updateItemState,
  }
}

export type { UnitDto, RoomDto, ItemDto }
