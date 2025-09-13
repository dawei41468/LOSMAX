import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { api } from '../services/api'

export interface AdminUser {
  id: string
  email: string
  name?: string
  role: string
  createdAt: string
  language?: string
  preferences?: {
    morning_deadline: string
    evening_deadline: string
    notifications_enabled: boolean
    language: string
  }
}

export function useAdminUsers(params: { page: number; limit: number; search?: string; role?: string }) {
  const { page, limit, search, role } = params
  return useQuery<{ users: AdminUser[]; total?: number }>({
    queryKey: ['admin', 'users', { page, limit, search: search ?? '', role: role ?? 'all' }],
    queryFn: async () => {
      const query = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (search) query.append('search', search)
      if (role && role !== 'all') query.append('role', role)
      const { data } = await api.get(`/admin/users?${query.toString()}`)
      return data as { users: AdminUser[]; total?: number }
    },
    staleTime: 10_000,
    placeholderData: keepPreviousData,
  })
}

export function useAdminUserDetails(userId?: string) {
  return useQuery<Partial<AdminUser>>({
    queryKey: ['admin', 'users', 'details', userId ?? ''],
    queryFn: async () => {
      if (!userId) return {}
      const { data } = await api.get(`/admin/users/${userId}/details`)
      return data as Partial<AdminUser>
    },
    enabled: !!userId,
  })
}

export function useDeleteAdminUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/admin/users/${userId}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useUpdateAdminUserRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { data } = await api.patch(`/admin/users/${userId}`, { role })
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}
