import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../lib/queryKeys'
import type { Goal, GoalStatus, UpdateGoalPayload, CreateGoalPayload } from '../types/goals'
import { getGoals, createGoal, updateGoal, deleteGoal } from '../services/api'

interface UseGoalsParams {
  status?: GoalStatus
}

export function useGoals(params: UseGoalsParams = {}) {
  const { status } = params
  return useQuery<Goal[]>({
    queryKey: queryKeys.goals.list({ status }),
    queryFn: () => getGoals(status),
    staleTime: 15_000,
  })
}

export function useCreateGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateGoalPayload) => createGoal(payload),
    onSuccess: () => {
      // Invalidate all goals lists to keep it simple and correct
      qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'goals' })
    },
  })
}

export function useUpdateGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UpdateGoalPayload> }) => updateGoal(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'goals' })
    },
  })
}

export function useDeleteGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteGoal(id),
    onSuccess: () => {
      qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'goals' })
    },
  })
}

export function useToggleGoalStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, currentStatus }: { id: string; currentStatus: GoalStatus }) => {
      const nextStatus: GoalStatus = currentStatus === 'active' ? 'completed' : 'active'
      return updateGoal(id, { status: nextStatus })
    },
    onSuccess: () => {
      qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'goals' })
    },
  })
}
