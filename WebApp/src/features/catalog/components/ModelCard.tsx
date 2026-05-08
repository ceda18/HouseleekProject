import { ChevronRight } from 'lucide-react'
import { Badge } from '../../../components/ui/Badge'
import { CategoryEmoji } from '../../../components/shared/CategoryEmoji'
import type { ItemModelDto } from '../../../types/api'

interface ModelCardProps {
  model: ItemModelDto
  onClick: () => void
}

export function ModelCard({ model, onClick }: ModelCardProps) {
  return (
    <button
      onClick={onClick}
      className="glass rounded-3xl p-4 text-left hover:scale-[1.02] active:scale-[0.99] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent/40 w-full"
    >
      <div className="flex items-start justify-between mb-3">
        <CategoryEmoji category={model.itemCategoryName} size="lg" />
        <ChevronRight size={14} className="text-text-muted mt-1" />
      </div>
      <p className="text-sm font-semibold text-text-primary mb-1 leading-tight">{model.name}</p>
      <div className="flex flex-wrap gap-1 mb-2">
        <Badge variant="neutral" className="text-[10px]">{model.vendorName}</Badge>
        <Badge variant="accent" className="text-[10px]">{model.itemCategoryName}</Badge>
      </div>
      {model.actionDefinitions.length > 0 && (
        <p className="text-[10px] text-text-muted truncate">
          {model.actionDefinitions.map((a) => a.name).join(', ')}
        </p>
      )}
    </button>
  )
}
