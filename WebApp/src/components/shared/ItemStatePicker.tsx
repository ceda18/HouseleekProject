/**
 * ItemStatePicker — hierarchical picker for selecting a controllable item state.
 * Tree: Unit → Room → Item → State (only controllable=true).
 * Used in: scene/automation action builder, automation trigger builder.
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { homeApi } from '../../api/home'
import { Modal } from '../ui/Modal'
import { Spinner } from '../ui/Spinner'
import { CategoryEmoji } from './CategoryEmoji'
import type { ItemDto, ItemStateDto } from '../../types/api'

export interface PickedState {
  itemStateId: number
  itemId: number
  itemName: string
  itemCategoryName: string
  actionDefinitionName: string
  valueType: string
  actionDefinitionId: number
}

interface ItemStatePickerProps {
  open: boolean
  onClose: () => void
  onSelect: (state: PickedState) => void
  /** Only show states matching this valueType (optional, for trigger value-type matching) */
  filterValueType?: string
  /**
   * If true (default), restricts the list to controllable states (write-capable).
   * Set to false for triggers — sensor states (read-only) are valid trigger conditions
   * (e.g. "when temperature > 25").
   */
  filterControllable?: boolean
}

export function ItemStatePicker({
  open,
  onClose,
  onSelect,
  filterValueType,
  filterControllable = true,
}: ItemStatePickerProps) {
  const [expandedUnits, setExpandedUnits] = useState<Set<number>>(new Set())
  const [expandedRooms, setExpandedRooms] = useState<Set<number>>(new Set())
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())

  const { data: units = [], isLoading } = useQuery({
    queryKey: ['units'],
    queryFn: homeApi.getUnits,
    enabled: open,
  })

  const toggle = (set: Set<number>, id: number): Set<number> => {
    const next = new Set(set)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  }

  const pickableStates = (item: ItemDto): ItemStateDto[] =>
    item.itemStates.filter(
      (s) =>
        (!filterControllable || s.controllable) &&
        (!filterValueType || s.valueType === filterValueType),
    )

  const handleSelect = (item: ItemDto, state: ItemStateDto) => {
    onSelect({
      itemStateId: state.itemStateId,
      itemId: item.itemId,
      itemName: item.name,
      itemCategoryName: item.itemCategoryName,
      actionDefinitionName: state.actionDefinitionName,
      valueType: state.valueType,
      actionDefinitionId: state.actionDefinitionId,
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Select Device State" size="md">
      {isLoading ? (
        <Spinner center />
      ) : units.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-8">No devices found.</p>
      ) : (
        <div className="flex flex-col gap-1 max-h-96 overflow-y-auto pr-1">
          {units.map((unit) => (
            <div key={unit.unitId}>
              {/* Unit row */}
              <button
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/50 text-left transition-colors"
                onClick={() => setExpandedUnits((s) => toggle(s, unit.unitId))}
              >
                {expandedUnits.has(unit.unitId) ? (
                  <ChevronDown size={14} className="text-accent flex-shrink-0" />
                ) : (
                  <ChevronRight size={14} className="text-text-muted flex-shrink-0" />
                )}
                <span className="text-sm font-semibold text-text-primary">{unit.name}</span>
                <span className="text-xs text-text-muted">· {unit.unitTypeName}</span>
              </button>

              {expandedUnits.has(unit.unitId) && (
                <div className="ml-4 flex flex-col gap-0.5">
                  {unit.rooms.map((room) => (
                    <div key={room.roomId}>
                      {/* Room row */}
                      <button
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/40 text-left transition-colors"
                        onClick={() => setExpandedRooms((s) => toggle(s, room.roomId))}
                      >
                        {expandedRooms.has(room.roomId) ? (
                          <ChevronDown size={13} className="text-accent flex-shrink-0" />
                        ) : (
                          <ChevronRight size={13} className="text-text-muted flex-shrink-0" />
                        )}
                        <span className="text-sm text-text-secondary">{room.name}</span>
                        <span className="text-xs text-text-muted">· {room.roomTypeName}</span>
                      </button>

                      {expandedRooms.has(room.roomId) && (
                        <div className="ml-4 flex flex-col gap-0.5">
                          {room.items.map((item) => {
                            const states = pickableStates(item)
                            if (states.length === 0) return null
                            return (
                              <div key={item.itemId}>
                                {/* Item row */}
                                <button
                                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/40 text-left transition-colors"
                                  onClick={() =>
                                    setExpandedItems((s) => toggle(s, item.itemId))
                                  }
                                >
                                  {expandedItems.has(item.itemId) ? (
                                    <ChevronDown size={12} className="text-accent flex-shrink-0" />
                                  ) : (
                                    <ChevronRight size={12} className="text-text-muted flex-shrink-0" />
                                  )}
                                  <CategoryEmoji category={item.itemCategoryName} size="sm" />
                                  <span className="text-sm text-text-primary">{item.name}</span>
                                  <span className="text-xs text-text-muted ml-auto">
                                    {states.length} state{states.length !== 1 ? 's' : ''}
                                  </span>
                                </button>

                                {expandedItems.has(item.itemId) && (
                                  <div className="ml-6 flex flex-col gap-0.5 pb-1">
                                    {states.map((state) => (
                                      <button
                                        key={state.itemStateId}
                                        onClick={() => handleSelect(item, state)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-left
                                                   glass-accent hover:bg-accent/15 transition-colors"
                                      >
                                        <div className="flex-1">
                                          <div className="flex items-center gap-1.5">
                                            <p className="text-xs font-medium text-accent">
                                              {state.actionDefinitionName}
                                            </p>
                                            {!state.controllable && (
                                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold uppercase tracking-wide">
                                                Sensor
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-[10px] text-text-muted">
                                            {state.valueType} · current: {String(state.value)}
                                          </p>
                                        </div>
                                        <ChevronRight size={12} className="text-accent/60" />
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}
