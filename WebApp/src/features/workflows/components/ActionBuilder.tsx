/**
 * ActionBuilder — UI portion of the actions list (used in Scene & Automation modals).
 * Pure view: receives a `useActionForm` result + the list of available scenes.
 */
import { useState } from 'react'
import { Plus, Film, X } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { TypedInput } from '../../../components/ui/TypedInput'
import { CategoryEmoji } from '../../../components/shared/CategoryEmoji'
import { ItemStatePicker } from '../../../components/shared/ItemStatePicker'
import { friendlyValueType } from '../../../lib/valueType'
import type { SceneDto } from '../../../types/api'
import type { useActionForm } from '../hooks/useActionForm'

interface ActionBuilderProps {
  form: ReturnType<typeof useActionForm>
  availableScenes: SceneDto[]
}

export function ActionBuilder({ form, availableScenes }: ActionBuilderProps) {
  const { actions, addDevice, addScene, remove, setValue } = form

  const [pickerOpen, setPickerOpen] = useState(false)
  const [scenePickerOpen, setScenePickerOpen] = useState(false)
  const [selectedSceneId, setSelectedSceneId] = useState('')

  const handleAddScene = () => {
    const scene = availableScenes.find((s) => s.sceneId === Number(selectedSceneId))
    if (!scene) return
    addScene(scene)
    setSelectedSceneId('')
    setScenePickerOpen(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Actions</p>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
            <Plus size={12} /> Device
          </Button>
          {availableScenes.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setScenePickerOpen((v) => !v)}>
              <Film size={12} /> Scene
            </Button>
          )}
        </div>
      </div>

      {scenePickerOpen && (
        <div className="glass-subtle rounded-xl px-3 py-2.5 flex items-center gap-2 mb-2">
          <span className="text-xs text-text-secondary">Scene</span>
          <select
            className="input flex-1 text-xs py-1 px-2"
            value={selectedSceneId}
            onChange={(e) => setSelectedSceneId(e.target.value)}
          >
            <option value="">Select scene…</option>
            {availableScenes.map((s) => (
              <option key={s.sceneId} value={s.sceneId}>{s.name}</option>
            ))}
          </select>
          <Button size="sm" onClick={handleAddScene} disabled={!selectedSceneId}>Add</Button>
          <Button variant="ghost" size="sm" onClick={() => setScenePickerOpen(false)}>Cancel</Button>
        </div>
      )}

      {actions.length === 0 && (
        <p className="text-xs text-text-muted py-3 text-center glass-subtle rounded-xl">
          No actions yet. Add at least one.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {actions.map((a, i) => (
          <div key={i} className="glass-subtle rounded-xl px-3 py-2.5 flex items-center gap-3">
            {a.type === 'scene' ? (
              <>
                <span className="text-base">🎬</span>
                <p className="text-xs font-medium text-text-primary flex-1 truncate">
                  Run scene: <span className="text-accent">{a.targetSceneName}</span>
                </p>
              </>
            ) : (
              <>
                <CategoryEmoji category={a.itemCategoryName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-primary truncate">
                    {a.itemName} · {a.actionDefinitionName}
                  </p>
                  <p className="text-[10px] text-text-muted">{friendlyValueType(a.valueType)}</p>
                </div>
                <TypedInput
                  valueType={a.valueType}
                  value={a.value}
                  onChange={(v) => setValue(i, v)}
                  min={a.minValue}
                  max={a.maxValue}
                  className="w-24 flex-shrink-0"
                />
              </>
            )}
            <button onClick={() => remove(i)} aria-label="Remove action">
              <X size={13} className="text-red-400" />
            </button>
          </div>
        ))}
      </div>

      <ItemStatePicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={addDevice} />
    </div>
  )
}
