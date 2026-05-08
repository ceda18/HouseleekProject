import { useQuery } from '@tanstack/react-query'
import { activityApi } from '../api/activity'

export function useActivity() {
  const { data: logs = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['logs'],
    queryFn: activityApi.getLogs,
  })
  return { logs, isLoading, refetch, isFetching }
}
