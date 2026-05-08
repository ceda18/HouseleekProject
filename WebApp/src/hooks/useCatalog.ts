/**
 * useCatalog — read-mostly catalog data (item models, vendors, lookups).
 * Also exposes derived maps used across the app (modelMap, actionDefMap).
 */
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { catalogApi } from '../api/catalog'
import type { ActionDefinitionDto, ItemModelDto } from '../types/api'

export function useCatalog() {
  const { data: models = [], isLoading: loadingModels } = useQuery({
    queryKey: ['item-models'],
    queryFn: catalogApi.getItemModels,
  })
  const { data: vendors = [], isLoading: loadingVendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: catalogApi.getVendors,
  })
  const { data: categories = [] } = useQuery({
    queryKey: ['item-categories'],
    queryFn: catalogApi.getItemCategories,
  })
  const { data: unitTypes = [] } = useQuery({
    queryKey: ['unit-types'],
    queryFn: catalogApi.getUnitTypes,
  })
  const { data: roomTypes = [] } = useQuery({
    queryKey: ['room-types'],
    queryFn: catalogApi.getRoomTypes,
  })

  // itemModelId → ItemModelDto
  const modelMap = useMemo<Map<number, ItemModelDto>>(
    () => new Map(models.map((m) => [m.itemModelId, m])),
    [models],
  )

  // actionDefinitionId → ActionDefinitionDto (used for min/max + valueType lookup)
  const actionDefMap = useMemo<Map<number, ActionDefinitionDto>>(() => {
    const map = new Map<number, ActionDefinitionDto>()
    for (const m of models) for (const a of m.actionDefinitions) map.set(a.actionDefinitionId, a)
    return map
  }, [models])

  return {
    models,
    vendors,
    categories,
    unitTypes,
    roomTypes,
    modelMap,
    actionDefMap,
    isLoading: loadingModels || loadingVendors,
  }
}
