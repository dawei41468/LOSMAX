import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'
import { queryKeys } from '../lib/queryKeys'

// Types inferred from current ProfilePage usage
export interface UserPreferences {
  morning_deadline: string
  evening_deadline: string
  notifications_enabled: boolean
  language?: string
}

export type UserPreferencesUpdate = Partial<UserPreferences>

export function usePreferences() {
  return useQuery<UserPreferences>({
    queryKey: queryKeys.user.preferences(),
    queryFn: async () => {
      const res = await api.get('/preferences')
      return res.data as UserPreferences
    },
    staleTime: 60_000,
  })
}

export function useUpdatePreferences() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (update: UserPreferencesUpdate) => {
      const res = await api.patch('/preferences', update)
      return res.data as UserPreferences
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.user.preferences() })
    },
  })
}

export function useUpdateName() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (name: string) => {
      const res = await api.patch('/auth/update-name', { name })
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.user.self() })
    },
  })
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      const res = await api.delete('/auth/account')
      return res.data
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: { current_password: string; new_password: string }) => {
      const res = await api.patch('/auth/change-password', payload)
      return res.data
    },
  })
}
