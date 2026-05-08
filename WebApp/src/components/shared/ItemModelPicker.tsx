/**
 * ItemModelPicker — modal catalog for selecting an item model.
 * Shows filterable gallery cards; clicking one fires onSelect.
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { catalogApi } from '../../api/catalog'
import { Modal } from '../ui/Modal'
import { Badge } from '../ui/Badge'
import { Spinner } from '../ui/Spinner'
import { CategoryEmoji } from './CategoryEmoji'
import type { ItemModelDto } from '../../types/api'

interface ItemModelPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (model: ItemModelDto) => void
}

export function ItemModelPicker({ open, onClose, onSelect }: ItemModelPickerProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const { data: models = [], isLoading } = useQuery({
    queryKey: ['item-models'],
    queryFn: catalogApi.getItemModels,
    enabled: open,
  })
  const { data: categories = [] } = useQuery({
    queryKey: ['item-categories'],
    queryFn: catalogApi.getItemCategories,
    enabled: open,
  })

  const filtered = models.filter((m) => {
    const matchCat = categoryFilter === 'all' || m.itemCategoryName === categoryFilter
    const matchSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.vendorName.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const handleSelect = (model: ItemModelDto) => {
    onSelect(model)
    setSearch('')
    setCategoryFilter('all')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Select Device Model" size="lg">
      {/* Search */}
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          className="input pl-8"
          placeholder="Search models or vendors…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
            categoryFilter === 'all'
              ? 'bg-accent text-white'
              : 'glass-subtle text-text-secondary hover:bg-white/60'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.name)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
              categoryFilter === cat.name
                ? 'bg-accent text-white'
                : 'glass-subtle text-text-secondary hover:bg-white/60'
            }`}
          >
            <CategoryEmoji category={cat.name} size="sm" />
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <Spinner center />
      ) : filtered.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-8">No models match your search.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-1">
          {filtered.map((model) => (
            <button
              key={model.itemModelId}
              onClick={() => handleSelect(model)}
              className="glass-subtle rounded-xl p-3 text-left hover:bg-white/60 hover:scale-[1.02] active:scale-[0.98] transition-all duration-100 focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              <div className="flex items-center gap-2 mb-2">
                <CategoryEmoji category={model.itemCategoryName} size="md" />
                <p className="text-xs font-semibold text-text-primary leading-tight line-clamp-2">
                  {model.name}
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge variant="neutral" className="text-[10px]">{model.vendorName}</Badge>
                <Badge variant="accent" className="text-[10px]">{model.itemCategoryName}</Badge>
              </div>
              {model.actionDefinitions.length > 0 && (
                <p className="text-[10px] text-text-muted mt-1.5 truncate">
                  {model.actionDefinitions.map((a) => a.name).join(', ')}
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </Modal>
  )
}
