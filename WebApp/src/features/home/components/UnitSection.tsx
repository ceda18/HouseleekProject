import { ChevronDown, ChevronRight, Pencil, Plus } from 'lucide-react'
import { GlassCard } from '../../../components/ui/GlassCard'
import { Button } from '../../../components/ui/Button'
import { RoomSection } from './RoomSection'
import type { ActionDefinitionDto, ItemDto, RoomDto, UnitDto } from '../../../types/api'

interface UnitSectionProps {
  unit: UnitDto
  expanded: boolean
  onToggle: () => void
  expandedRooms: Set<number>
  onToggleRoom: (roomId: number) => void
  onEditUnit: () => void
  onAddRoom: () => void
  onEditRoom: (room: RoomDto) => void
  onAddDevice: (roomId: number) => void
  onEditItem: (item: ItemDto) => void
  onItemInfo: (item: ItemDto) => void
  actionDefMap: Map<number, ActionDefinitionDto>
}

export function UnitSection({
  unit,
  expanded,
  onToggle,
  expandedRooms,
  onToggleRoom,
  onEditUnit,
  onAddRoom,
  onEditRoom,
  onAddDevice,
  onEditItem,
  onItemInfo,
  actionDefMap,
}: UnitSectionProps) {
  return (
    <GlassCard className="overflow-hidden">
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/20 transition-colors"
        onClick={onToggle}
      >
        {expanded
          ? <ChevronDown size={18} className="text-accent flex-shrink-0" />
          : <ChevronRight size={18} className="text-text-muted flex-shrink-0" />}
        <span className="text-2xl">🏠</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text-primary">{unit.name}</p>
          <p className="text-xs text-text-muted">
            {unit.unitTypeName} · {unit.rooms.length} room{unit.rooms.length !== 1 ? 's' : ''}
          </p>
        </div>
        {expanded && (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" onClick={onEditUnit}>
              <Pencil size={13} />
            </Button>
            <Button variant="outline" size="sm" onClick={onAddRoom}>
              <Plus size={13} /> Room
            </Button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-border/20 pt-3">
          {unit.rooms.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">No rooms yet</p>
          ) : (
            unit.rooms.map((room) => (
              <RoomSection
                key={room.roomId}
                room={room}
                expanded={expandedRooms.has(room.roomId)}
                onToggle={() => onToggleRoom(room.roomId)}
                onEditRoom={() => onEditRoom(room)}
                onAddDevice={() => onAddDevice(room.roomId)}
                onEditItem={onEditItem}
                onItemInfo={onItemInfo}
                actionDefMap={actionDefMap}
              />
            ))
          )}
        </div>
      )}
    </GlassCard>
  )
}
