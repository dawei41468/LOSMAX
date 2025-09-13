import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../lib/queryKeys'
import type { Task, CreateTaskPayload, UpdateTaskPayload } from '../types/tasks'
import type { TaskStatus, TaskFilter } from '../lib/queryKeys'
import { getTasks, createTask, updateTask, deleteTask } from '../services/api'

interface UseTasksParams {
  status?: TaskStatus
  filter?: TaskFilter
}

export function useTasks(params: UseTasksParams = {}) {
  const { status, filter } = params
  return useQuery<Task[]>({
    queryKey: queryKeys.tasks.list({ status, filter }),
    queryFn: () => getTasks(status, filter),
    staleTime: 10_000,
    select: (data) => data.sort((a, b) => a.created_at.localeCompare(b.created_at)),
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => createTask(payload),
    onSuccess: () => {
      qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'tasks' })
    },
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UpdateTaskPayload> }) => updateTask(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'tasks' })
    },
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'tasks' })
    },
  })
}

export function useToggleTaskStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, currentStatus }: { id: string; currentStatus: TaskStatus }) => {
      const nextStatus: TaskStatus = currentStatus === 'completed' ? 'incomplete' : 'completed'
      return updateTask(id, { status: nextStatus })
    },
    // Optimistic update across all cached task lists
    onMutate: async ({ id, currentStatus }) => {
      await qc.cancelQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'tasks' })

      const snapshots: Array<{ key: unknown[]; data: Task[] | undefined }> = []

      qc.getQueryCache()
        .getAll()
        .filter((q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'tasks')
        .forEach((q) => {
          const key = q.queryKey as unknown[]
          const prev = qc.getQueryData<Task[]>(key)
          snapshots.push({ key, data: prev })
          if (prev) {
            const toggled: TaskStatus = currentStatus === 'completed' ? 'incomplete' : 'completed'
            const updated: Task[] = prev.map((t) => (t.id === id ? { ...t, status: toggled } : t))
            qc.setQueryData<Task[]>(key, updated)
          }
        })

      return { snapshots }
    },
    onError: (_err, _vars, context) => {
      // Roll back to previous caches
      context?.snapshots?.forEach((s) => {
        qc.setQueryData(s.key, s.data)
      })
    },
    onSettled: () => {
      qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'tasks' })
    },
  })
}
