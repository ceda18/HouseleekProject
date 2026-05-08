import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { workflowsApi } from '../api/workflows'
import { activityApi } from '../api/activity'

export function useScenes() {
  const qc = useQueryClient()
  const inv = () => qc.invalidateQueries({ queryKey: ['scenes'] })

  const { data: scenes = [], isLoading } = useQuery({
    queryKey: ['scenes'],
    queryFn: workflowsApi.getScenes,
  })

  const create = useMutation({ mutationFn: workflowsApi.createScene, onSuccess: inv })
  const update = useMutation({ mutationFn: workflowsApi.updateScene, onSuccess: inv })
  const remove = useMutation({ mutationFn: workflowsApi.deleteScene, onSuccess: inv })
  const run = useMutation({ mutationFn: activityApi.executeWorkflow })

  return { scenes, isLoading, create, update, remove, run }
}
