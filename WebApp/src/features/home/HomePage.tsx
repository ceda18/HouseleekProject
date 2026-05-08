import { useState } from 'react'
import { Plus, Maximize2, Minimize2 } from 'lucide-react'
import { GlassCard } from '../../components/ui/GlassCard'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/shared/EmptyState'
import { PageHeader } from '../../components/shared/PageHeader'
import { ItemModelPicker } from '../../components/shared/ItemModelPicker'
import { useAuthStore } from '../../store/authStore'
import { useUnits } from '../../hooks/useUnits'
import { useCatalog } from '../../hooks/useCatalog'
import { UnitSection } from './components/UnitSection'
import { AddUnitModal } from './components/AddUnitModal'
import { AddRoomModal } from './components/AddRoomModal'
import { AddItemModal } from './components/AddItemModal'
import { EditUnitModal } from './components/EditUnitModal'
import { EditRoomModal } from './components/EditRoomModal'
import { EditItemModal } from './components/EditItemModal'
import { ItemModelInfoModal } from './components/ItemModelInfoModal'
import { useExpansion } from './hooks/useExpansion'
import type { ItemDto, ItemModelDto, RoomDto, UnitDto } from '../../types/api'

export function HomePage() {
  const { user } = useAuthStore()
  const {
    units, isLoading, allRooms,
    createUnit, updateUnit, deleteUnit,
    createRoom, updateRoom, deleteRoom,
    createItem, updateItem, deleteItem,
  } = useUnits()
  const { unitTypes, roomTypes, modelMap, actionDefMap } = useCatalog()
  const expansion = useExpansion(units)

  // Modal state
  const [addUnitOpen, setAddUnitOpen] = useState(false)
  const [addRoom, setAddRoom] = useState<number | null>(null)
  const [addItemRoom, setAddItemRoom] = useState<number | null>(null)
  const [addItemModel, setAddItemModel] = useState<ItemModelDto | null>(null)
  const [modelPickerOpen, setModelPickerOpen] = useState(false)
  const [modelPickerForRoom, setModelPickerForRoom] = useState<number | null>(null)
  const [infoModel, setInfoModel] = useState<ItemModelDto | null>(null)
  const [editUnit, setEditUnit] = useState<UnitDto | null>(null)
  const [editRoom, setEditRoom] = useState<RoomDto | null>(null)
  const [editItem, setEditItem] = useState<ItemDto | null>(null)

  // Handlers
  const openAddDevice = (roomId: number) => {
    setModelPickerForRoom(roomId)
    setModelPickerOpen(true)
  }
  const handleModelPicked = (model: ItemModelDto) => {
    setModelPickerOpen(false)
    setAddItemRoom(modelPickerForRoom)
    setAddItemModel(model)
  }
  const openItemInfo = (item: ItemDto) => {
    const model = modelMap.get(item.itemModelId)
    if (model) setInfoModel(model)
  }

  if (isLoading) return <Spinner center />

  return (
    <div>
      <PageHeader
        title="Home Management"
        subtitle="Units, rooms, and devices"
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={expansion.toggleAll}>
              {expansion.allExpanded
                ? <><Minimize2 size={14} /> Collapse All</>
                : <><Maximize2 size={14} /> Expand All</>}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAddUnitOpen(true)}>
              <Plus size={14} /> Add Unit
            </Button>
          </div>
        }
      />

      {units.length === 0 ? (
        <GlassCard className="mt-4">
          <EmptyState
            icon="🏠"
            title="No units yet"
            description="Add your first unit to start managing your home."
            action={<Button onClick={() => setAddUnitOpen(true)}><Plus size={16} /> Add Unit</Button>}
          />
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-4">
          {units.map((unit) => (
            <UnitSection
              key={unit.unitId}
              unit={unit}
              expanded={expansion.expandedUnits.has(unit.unitId)}
              onToggle={() => expansion.toggleUnit(unit.unitId)}
              expandedRooms={expansion.expandedRooms}
              onToggleRoom={expansion.toggleRoom}
              onEditUnit={() => setEditUnit(unit)}
              onAddRoom={() => setAddRoom(unit.unitId)}
              onEditRoom={setEditRoom}
              onAddDevice={openAddDevice}
              onEditItem={setEditItem}
              onItemInfo={openItemInfo}
              actionDefMap={actionDefMap}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {addUnitOpen && (
        <AddUnitModal
          unitTypes={unitTypes}
          onSave={(name, typeId) => {
            createUnit.mutate({
              unitId: 0, name, unitTypeId: typeId,
              userId: user?.userId ?? 0, unitTypeName: '', rooms: [],
            })
            setAddUnitOpen(false)
          }}
          onClose={() => setAddUnitOpen(false)}
        />
      )}

      {addRoom !== null && (
        <AddRoomModal
          roomTypes={roomTypes}
          onSave={(name, typeId) => {
            createRoom.mutate({
              roomId: 0, name, roomTypeId: typeId,
              unitId: addRoom, roomTypeName: '', items: [],
            })
            setAddRoom(null)
          }}
          onClose={() => setAddRoom(null)}
        />
      )}

      <ItemModelPicker
        open={modelPickerOpen}
        onClose={() => { setModelPickerOpen(false); setModelPickerForRoom(null) }}
        onSelect={handleModelPicked}
      />

      {addItemRoom !== null && addItemModel !== null && (
        <AddItemModal
          roomId={addItemRoom}
          model={addItemModel}
          onSave={(name, roomId, modelId) => {
            createItem.mutate({
              itemId: 0, name, roomId, itemModelId: modelId,
              itemModelName: '', itemCategoryName: '', itemStates: [],
            })
            setAddItemRoom(null); setAddItemModel(null)
          }}
          onClose={() => { setAddItemRoom(null); setAddItemModel(null) }}
          onChangeModel={() => {
            setAddItemModel(null)
            setModelPickerForRoom(addItemRoom)
            setAddItemRoom(null)
            setModelPickerOpen(true)
          }}
        />
      )}

      {editUnit && (
        <EditUnitModal
          unit={editUnit}
          unitTypes={unitTypes}
          onSave={(data) => { updateUnit.mutate(data as UnitDto); setEditUnit(null) }}
          onDelete={() => { deleteUnit.mutate(editUnit.unitId); setEditUnit(null) }}
          onClose={() => setEditUnit(null)}
        />
      )}

      {editRoom && (
        <EditRoomModal
          room={editRoom}
          roomTypes={roomTypes}
          onSave={(data) => { updateRoom.mutate(data as RoomDto); setEditRoom(null) }}
          onDelete={() => { deleteRoom.mutate(editRoom.roomId); setEditRoom(null) }}
          onClose={() => setEditRoom(null)}
        />
      )}

      {editItem && (
        <EditItemModal
          item={editItem}
          allRooms={allRooms}
          onSave={(data) => { updateItem.mutate(data as ItemDto); setEditItem(null) }}
          onDelete={() => { deleteItem.mutate(editItem.itemId); setEditItem(null) }}
          onClose={() => setEditItem(null)}
        />
      )}

      {infoModel && <ItemModelInfoModal model={infoModel} onClose={() => setInfoModel(null)} />}
    </div>
  )
}
