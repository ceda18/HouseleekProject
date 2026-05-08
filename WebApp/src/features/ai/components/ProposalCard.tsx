import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, Zap, Home, Film } from 'lucide-react'
import { agentApi } from '../../../api/agent'
import { homeApi } from '../../../api/home'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { Spinner } from '../../../components/ui/Spinner'
import { ItemProposalPreview } from './ItemProposalPreview'
import { SceneProposalPreview } from './SceneProposalPreview'
import { AutomationProposalPreview } from './AutomationProposalPreview'
import { buildStateMap } from '../lib/proposalUtils'
import type { ProposalDto } from '../../../types/api'

const TYPE_ICON = { item: Home, scene: Film, automation: Zap } as const

export function ProposalCard({ proposal }: { proposal: ProposalDto }) {
  const qc = useQueryClient()
  const [state, setState] = useState<'idle' | 'applying' | 'applied' | 'error' | 'dismissed'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Always fetch units so the stateMap is populated even when arriving at AI chat directly.
  const { data: units = [] } = useQuery({ queryKey: ['units'], queryFn: homeApi.getUnits })
  const stateMap = buildStateMap(units)

  const type = proposal.type?.toLowerCase() ?? ''
  const TypeIcon = TYPE_ICON[type as keyof typeof TYPE_ICON] ?? Zap

  const apply = async () => {
    setState('applying')
    setErrorMsg('')
    try {
      await agentApi.applyProposal({ type: proposal.type, payload: proposal.payload })
      qc.invalidateQueries({ queryKey: ['units'] })
      qc.invalidateQueries({ queryKey: ['scenes'] })
      qc.invalidateQueries({ queryKey: ['automations'] })
      setState('applied')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setErrorMsg(msg)
      setState('error')
    }
  }

  const renderContent = () => {
    if (typeof proposal.payload !== 'object' || proposal.payload === null) {
      return (
        <pre className="text-xs text-text-secondary bg-white/50 rounded-xl p-3 overflow-auto max-h-44 font-mono">
          {JSON.stringify(proposal.payload, null, 2)}
        </pre>
      )
    }
    const p = proposal.payload as Record<string, unknown>
    if (type === 'item') return <ItemProposalPreview p={p} />
    if (type === 'scene') return <SceneProposalPreview p={p} stateMap={stateMap} />
    if (type === 'automation') return <AutomationProposalPreview p={p} stateMap={stateMap} />
    return (
      <pre className="text-xs text-text-secondary bg-white/50 rounded-xl p-3 overflow-auto max-h-44 font-mono leading-relaxed">
        {JSON.stringify(proposal.payload, null, 2)}
      </pre>
    )
  }

  return (
    <div className="glass-accent rounded-2xl p-4 mt-3">
      <div className="flex items-center gap-2 mb-3">
        <TypeIcon size={14} className="text-accent" />
        <span className="text-sm font-semibold text-accent capitalize">
          {proposal.type} proposal
        </span>
        {state === 'applied' && <Badge variant="success">Applied ✓</Badge>}
        {state === 'error' && <Badge variant="danger">Failed</Badge>}
        {state === 'dismissed' && <Badge variant="neutral">Dismissed</Badge>}
      </div>

      {renderContent()}

      {state === 'error' && errorMsg && (
        <p className="text-xs text-red-500 mt-2">{errorMsg}</p>
      )}

      {state !== 'applied' && state !== 'dismissed' && (
        <div className="flex gap-2 mt-3">
          {state === 'applying' ? (
            <Spinner size={18} />
          ) : (
            <>
              <Button size="sm" onClick={apply}>
                <CheckCircle size={13} /> Apply
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setState('dismissed')}>
                <XCircle size={13} /> Dismiss
              </Button>
            </>
          )}
        </div>
      )}
      {state === 'applied' && (
        <p className="text-xs text-green-600 mt-2 font-medium">
          Applied successfully. Changes reflected immediately.
        </p>
      )}
    </div>
  )
}
