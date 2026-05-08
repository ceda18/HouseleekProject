import { useState } from 'react'
import { Maximize2, Minimize2, Plus, Zap } from 'lucide-react'
import { GlassCard } from '../../components/ui/GlassCard'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { ConfirmDialog } from '../../components/shared/ConfirmDialog'
import { EmptyState } from '../../components/shared/EmptyState'
import { PageHeader } from '../../components/shared/PageHeader'
import { useAuthStore } from '../../store/authStore'
import { useScenes } from '../../hooks/useScenes'
import { useAutomations } from '../../hooks/useAutomations'
import { SceneCard } from './components/SceneCard'
import { AutomationCard } from './components/AutomationCard'
import { SceneModal } from './components/SceneModal'
import { AutomationModal } from './components/AutomationModal'
import type { AutomationDto, SceneDto } from '../../types/api'

type Tab = 'scenes' | 'automations'

export function WorkflowsPage() {
  const { user } = useAuthStore()
  const [tab, setTab] = useState<Tab>('scenes')
  const [expandAll, setExpandAll] = useState(false)

  const { scenes, isLoading: loadingScenes, remove: removeScene, run: runScene } = useScenes()
  const { automations, isLoading: loadingAuto, remove: removeAuto, run: runAuto } = useAutomations()

  const [sceneModal, setSceneModal] = useState<{ open: boolean; existing?: SceneDto }>({ open: false })
  const [autoModal, setAutoModal] = useState<{ open: boolean; existing?: AutomationDto }>({ open: false })
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'scene' | 'automation'; id: number } | null>(null)

  const handleDelete = () => {
    if (!deleteTarget) return
    if (deleteTarget.type === 'scene') removeScene.mutate(deleteTarget.id)
    else removeAuto.mutate(deleteTarget.id)
    setDeleteTarget(null)
  }

  // Reset expand state when switching tabs
  const handleTabChange = (t: Tab) => {
    setTab(t)
    setExpandAll(false)
  }

  return (
    <div>
      <PageHeader
        title="Workflows"
        subtitle="Scenes and automations for your smart home"
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandAll((v) => !v)}
            >
              {expandAll
                ? <><Minimize2 size={14} /> Collapse All</>
                : <><Maximize2 size={14} /> Expand All</>}
            </Button>
            {tab === 'scenes'
              ? <Button variant="outline" size="sm" onClick={() => setSceneModal({ open: true })}><Plus size={14} /> New Scene</Button>
              : <Button variant="outline" size="sm" onClick={() => setAutoModal({ open: true })}><Plus size={14} /> New Automation</Button>
            }
          </div>
        }
      />

      <div className="glass rounded-2xl p-1 flex gap-1 mb-6 w-fit">
        {(['scenes', 'automations'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => handleTabChange(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 capitalize ${
              tab === t
                ? 'bg-accent text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/50'
            }`}
          >
            {t === 'scenes' ? `Scenes (${scenes.length})` : `Automations (${automations.length})`}
        </button>
        ))}
      </div>

      {tab === 'scenes' && (
        loadingScenes ? <Spinner center /> :
        scenes.length === 0 ? (
          <GlassCard>
            <EmptyState
              icon={<Zap />}
              title="No scenes yet"
              description="Create a scene to control multiple devices at once."
              action={<Button onClick={() => setSceneModal({ open: true })}><Plus size={16} /> New Scene</Button>}
            />
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {scenes.map((scene) => (
              <SceneCard
                key={scene.sceneId}
                scene={scene}
                forceExpanded={expandAll}
                onEdit={() => setSceneModal({ open: true, existing: scene })}
                onDelete={() => setDeleteTarget({ type: 'scene', id: scene.sceneId })}
                onRun={async () => { await runScene.mutateAsync(scene.sceneId) }}
              />
            ))}
          </div>
        )
      )}

      {tab === 'automations' && (
        loadingAuto ? <Spinner center /> :
        automations.length === 0 ? (
          <GlassCard>
            <EmptyState
              icon={<Zap />}
              title="No automations yet"
              description="Create an automation that reacts to device states or schedules."
              action={<Button onClick={() => setAutoModal({ open: true })}><Plus size={16} /> New Automation</Button>}
            />
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {automations.map((auto) => (
              <AutomationCard
                key={auto.automationId}
                auto={auto}
                forceExpanded={expandAll}
                onEdit={() => setAutoModal({ open: true, existing: auto })}
                onDelete={() => setDeleteTarget({ type: 'automation', id: auto.automationId })}
                onRun={async () => { await runAuto.mutateAsync(auto.automationId) }}
              />
            ))}
          </div>
        )
      )}

      {sceneModal.open && (
        <SceneModal
          open
          onClose={() => setSceneModal({ open: false })}
          existing={sceneModal.existing}
          userId={user?.userId}
        />
      )}
      {autoModal.open && (
        <AutomationModal
          open
          onClose={() => setAutoModal({ open: false })}
          existing={autoModal.existing}
          userId={user?.userId}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        message={`Delete this ${deleteTarget?.type}?`}
      />
    </div>
  )
}
