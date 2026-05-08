import { useNavigate } from 'react-router-dom'
import { Cpu } from 'lucide-react'
import { GlassCard } from '../../../components/ui/GlassCard'
import { Button } from '../../../components/ui/Button'
import { CategoryEmoji } from '../../../components/shared/CategoryEmoji'
import type { UnitDto } from '../../../types/api'

interface Props { units: UnitDto[] }

function getPrimaryState(item: { itemStates: { actionDefinitionName: string; value: unknown }[] }) {
  if (item.itemStates.length === 0) return null
  const power = item.itemStates.find((s) => s.actionDefinitionName?.toLowerCase().includes('power') || s.actionDefinitionName?.toLowerCase().includes('on'))
  const state = power ?? item.itemStates[0]
  const v = state.value
  if (v === true || v === 'true' || v === 1 || v === '1') return { label: 'On', on: true }
  if (v === false || v === 'false' || v === 0 || v === '0') return { label: 'Off', on: false }
  return { label: String(v ?? '—'), on: null }
}

export function LiveDevicesWidget({ units }: Props) {
  const navigate = useNavigate()
  const allItems = units.flatMap((u) => u.rooms.flatMap((r) => r.items)).slice(0, 8)

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Cpu size={16} className="text-accent" />
          <h2 className="font-semibold text-text-primary text-sm">Devices</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/home')}>Manage</Button>
      </div>
      {allItems.length === 0 ? (
        <p className="text-sm text-text-muted py-4 text-center">No devices added yet</p>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {allItems.map((item) => {
            const state = getPrimaryState(item)
            return (
              <div key={item.itemId} className="glass-subtle rounded-xl p-2.5 flex flex-col items-center gap-1 text-center">
                <CategoryEmoji category={item.itemCategoryName} size="lg" />
                <p className="text-xs font-medium text-text-primary truncate w-full">{item.name}</p>
                {state && (
                  <span className={`text-[10px] font-medium ${state.on === true ? 'text-green-500' : state.on === false ? 'text-text-muted' : 'text-text-secondary'}`}>
                    {state.label}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </GlassCard>
  )
}
