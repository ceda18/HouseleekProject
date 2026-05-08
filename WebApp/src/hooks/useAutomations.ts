import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { workflowsApi } from '../api/workflows'
import { activityApi } from '../api/activity'

export function useAutomations() {
  const qc = useQueryClient()
  const inv = () => qc.invalidateQueries({ queryKey: ['automations'] })

  const { data: automations = [], isLoading } = useQuery({
    queryKey: ['automations'],
    queryFn: workflowsApi.getAutomations,
  })

  const create = useMutation({ mutationFn: workflowsApi.createAutomation, onSuccess: inv })
  const update = useMutation({ mutationFn: workflowsApi.updateAutomation, onSuccess: inv })
  const remove = useMutation({ mutationFn: workflowsApi.deleteAutomation, onSuccess: inv })
  // automationId === smartWorkflowId (table-per-type PK/FK)
  const run = useMutation({ mutationFn: activityApi.executeWorkflow })

  return { automations, isLoading, create, update, remove, run }
}
