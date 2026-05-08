import { ChevronDown, ChevronRight, Pencil, Plus } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { ItemCard } from './ItemCard'
import type { ActionDefinitionDto, ItemDto, RoomDto } from '../../../types/api'

interface RoomSectionProps {
  room: RoomDto
  expanded: boolean
  onToggle: () => void
  onEditRoom: () => void
  onAddDevice: () => void
  onEditItem: (item: ItemDto) => void
  onItemInfo: (item: ItemDto) => void
  actionDefMap: Map<number, ActionDefinitionDto>
}

export function RoomSection({
  room,
  expanded,
  onToggle,
  onEditRoom,
  onAddDevice,
  onEditItem,
  onItemInfo,
  actionDefMap,
}: RoomSectionProps) {
  return (
    <div className="glass-subtle rounded-2xl overflow-hidden">
      <div
        className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-white/20 transition-colors"
        onClick={onToggle}
      >
        {expanded
          ? <ChevronDown size={14} className="text-accent flex-shrink-0" />
          : <ChevronRight size={14} className="text-text-muted flex-shrink-0" />}
        <span>🚪</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary">{room.name}</p>
          <p className="text-xs text-text-muted">
            {room.roomTypeName} · {room.items.length} device{room.items.length !== 1 ? 's' : ''}
          </p>
        </div>
        {expanded && (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" onClick={onEditRoom}><Pencil size={12} /></Button>
            <Button variant="outline" size="sm" onClick={onAddDevice}>
              <Plus size={12} /> Device
            </Button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 border-t border-border/20 pt-3">
          {room.items.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4 col-span-full">No devices yet</p>
          ) : (
            room.items.map((item) => (
              <ItemCard
                key={item.itemId}
                item={item}
                onEdit={() => onEditItem(item)}
                onInfo={() => onItemInfo(item)}
                actionDefMap={actionDefMap}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
