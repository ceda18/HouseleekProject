import { useState } from 'react'
import { Search } from 'lucide-react'
import { GlassCard } from '../../components/ui/GlassCard'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/shared/EmptyState'
import { PageHeader } from '../../components/shared/PageHeader'
import { CategoryEmoji } from '../../components/shared/CategoryEmoji'
import { Badge } from '../../components/ui/Badge'
import { useCatalog } from '../../hooks/useCatalog'
import { ModelCard } from './components/ModelCard'
import { VendorTable } from './components/VendorTable'
import { ModelDetailModal } from './components/ModelDetailModal'
import { AddItemFromCatalogModal } from './components/AddItemFromCatalogModal'
import type { ItemModelDto, VendorDto } from '../../types/api'

type Tab = 'models' | 'vendors'

export function CatalogPage() {
  const { models, vendors, categories, isLoading } = useCatalog()
  const [tab, setTab] = useState<Tab>('models')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedVendor, setSelectedVendor] = useState<VendorDto | null>(null)
  const [detailModel, setDetailModel] = useState<ItemModelDto | null>(null)
  const [addItemModel, setAddItemModel] = useState<ItemModelDto | null>(null)

  const filteredModels = models.filter((m) => {
    const matchCat = categoryFilter === 'all' || m.itemCategoryName === categoryFilter
    const matchVendor = !selectedVendor || m.vendorId === selectedVendor.userId
    const matchSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.vendorName.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchVendor && matchSearch
  })

  const openAddItem = (model: ItemModelDto) => {
    setDetailModel(null)
    setAddItemModel(model)
  }

  return (
    <div>
      <PageHeader title="Catalog" subtitle="Browse available device models and vendors" />

      <div className="glass rounded-2xl p-1 flex gap-1 mb-6 w-fit">
        {(['models', 'vendors'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setSelectedVendor(null) }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 capitalize ${
              tab === t
                ? 'bg-accent text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/50'
            }`}
          >
            {t === 'models' ? `Models (${models.length})` : `Vendors (${vendors.length})`}
          </button>
        ))}
      </div>

      {tab === 'models' && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                className="input pl-8"
                placeholder="Search models or vendors…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
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
                  onClick={() => setCategoryFilter(cat.name === categoryFilter ? 'all' : cat.name)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
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
          </div>

          {isLoading ? (
            <Spinner center />
          ) : filteredModels.length === 0 ? (
            <GlassCard>
              <EmptyState title="No models found" description="Try adjusting your filters." />
            </GlassCard>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredModels.map((model) => (
                <ModelCard key={model.itemModelId} model={model} onClick={() => setDetailModel(model)} />
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'vendors' && (
        isLoading ? <Spinner center /> : (
          <>
            <VendorTable
              vendors={vendors}
              models={models}
              onSelect={setSelectedVendor}
              selected={selectedVendor}
            />

            {selectedVendor && (
              <div className="mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <p className="text-base font-semibold text-text-primary">
                    Models by {selectedVendor.name}
                  </p>
                  <Badge variant="neutral">
                    {models.filter((m) => m.vendorId === selectedVendor.userId).length}
                  </Badge>
                  <button
                    onClick={() => setSelectedVendor(null)}
                    className="ml-auto text-xs text-text-muted hover:text-text-secondary"
                  >
                    Clear
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {models
                    .filter((m) => m.vendorId === selectedVendor.userId)
                    .map((model) => (
                      <ModelCard
                        key={model.itemModelId}
                        model={model}
                        onClick={() => setDetailModel(model)}
                      />
                    ))}
                </div>
              </div>
            )}
          </>
        )
      )}

      {detailModel && (
        <ModelDetailModal
          model={detailModel}
          onClose={() => setDetailModel(null)}
          onAddItem={() => openAddItem(detailModel)}
        />
      )}

      {addItemModel && (
        <AddItemFromCatalogModal
          model={addItemModel}
          onClose={() => setAddItemModel(null)}
        />
      )}
    </div>
  )
}
