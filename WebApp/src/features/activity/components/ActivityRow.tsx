import { format } from 'date-fns'
import { Badge } from '../../../components/ui/Badge'
import { CategoryEmoji } from '../../../components/shared/CategoryEmoji'
import { classifyLog, formatLogValue } from '../lib/classifyLog'
import type { ActionLogDto } from '../../../types/api'

interface ActivityRowProps {
  log: ActionLogDto
  itemInfo?: { itemName: string; itemCategoryName: string; actionDefinitionName: string }
  workflowInfo?: { name: string; type: 'scene' | 'automation' }
}

export function ActivityRow({ log, itemInfo, workflowInfo }: ActivityRowProps) {
  const type = classifyLog(log)

  return (
    <div className="px-4 py-3 hover:bg-white/30 transition-colors flex items-center gap-3">
      {/* Timestamp */}
      <div className="flex-shrink-0 text-right w-14 sm:w-20">
        <p className="text-xs font-medium text-text-primary">
          {format(new Date(log.timestamp), 'HH:mm')}
          <span className="hidden sm:inline">:{format(new Date(log.timestamp), 'ss')}</span>
        </p>
        <p className="text-[10px] text-text-muted">
          {format(new Date(log.timestamp), 'dd MMM')}
        </p>
      </div>

      {/* Device info */}
      <div className="flex-1 min-w-0">
        {itemInfo ? (
          <div className="flex items-center gap-1.5">
            <CategoryEmoji category={itemInfo.itemCategoryName} size="sm" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-text-primary truncate">{itemInfo.itemName}</p>
              <p className="text-[10px] text-text-muted truncate">{itemInfo.actionDefinitionName}</p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-text-muted">—</p>
        )}
      </div>

      {/* Values */}
      <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2">
        <span className="text-xs font-mono bg-red-50 text-red-600 px-1.5 py-0.5 rounded max-w-[56px] sm:max-w-[100px] truncate">
          {formatLogValue(log.pastValue)}
        </span>
        <span className="text-text-muted text-xs">→</span>
        <span className="text-xs font-mono bg-green-50 text-green-700 px-1.5 py-0.5 rounded max-w-[56px] sm:max-w-[100px] truncate">
          {formatLogValue(log.currentValue)}
        </span>
      </div>

      {/* Badge — hidden on mobile */}
      <div className="hidden sm:block flex-shrink-0 text-right min-w-[100px]">
        {workflowInfo ? (
          <Badge variant={workflowInfo.type === 'scene' ? 'success' : 'accent'}>
            {workflowInfo.type === 'scene' ? 'Scene' : 'Auto'}: {workflowInfo.name}
          </Badge>
        ) : (
          <Badge variant={type === 'automation' ? 'accent' : type === 'scene' ? 'success' : 'neutral'}>
            {type === 'automation' ? 'Automation' : type === 'scene' ? 'Scene' : 'Manual'}
          </Badge>
        )}
      </div>
    </div>
  )
}
