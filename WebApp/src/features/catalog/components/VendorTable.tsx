import { Badge } from '../../../components/ui/Badge'
import { CategoryEmoji } from '../../../components/shared/CategoryEmoji'
import type { ItemModelDto, VendorDto } from '../../../types/api'

interface VendorTableProps {
  vendors: VendorDto[]
  models: ItemModelDto[]
  selected: VendorDto | null
  onSelect: (v: VendorDto | null) => void
}

export function VendorTable({ vendors, models, selected, onSelect }: VendorTableProps) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Categories</th>
            <th>Models</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((v) => {
            const vModels = models.filter((m) => m.vendorId === v.userId)
            const cats = [...new Set(vModels.map((m) => m.itemCategoryName))].filter(Boolean)
            const isSelected = selected?.userId === v.userId
            return (
              <tr
                key={v.userId}
                onClick={() => onSelect(isSelected ? null : v)}
                className={`cursor-pointer ${isSelected ? 'bg-accent-soft' : ''}`}
              >
                <td className="font-medium text-text-primary">
                  <div className="flex items-center gap-2">
                    {v.name}
                    {isSelected && <Badge variant="accent">Selected</Badge>}
                  </div>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {cats.slice(0, 3).map((c) => (
                      <span key={c} className="flex items-center gap-1 text-xs text-text-secondary">
                        <CategoryEmoji category={c} size="sm" />{c}
                      </span>
                    ))}
                    {cats.length > 3 && (
                      <span className="text-xs text-text-muted">+{cats.length - 3}</span>
                    )}
                  </div>
                </td>
                <td>
                  <Badge variant="neutral">{vModels.length}</Badge>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
