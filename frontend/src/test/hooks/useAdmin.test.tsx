import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { createTestQueryClient, withQueryClient } from '../utils'
import { useAdminUsers, useDeleteAdminUser, useUpdateAdminUserRole } from '../../hooks/useAdmin'
import { __testData } from '../server'

beforeEach(() => {
  __testData.reset()
})

describe('useAdmin hooks', () => {
  it('keeps previous page data as placeholder while paginating', async () => {
    const qc = createTestQueryClient()
    const wrapper = withQueryClient(qc)

    const { result, rerender } = renderHook(({ page }) => useAdminUsers({ page, limit: 2 }), {
      initialProps: { page: 1 },
      wrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const firstPageUserIds = (result.current.data?.users ?? []).map((u) => u.id)

    // Move to page 2, placeholderData should keep previous page content until fetch resolves
    rerender({ page: 2 })
    expect((result.current.data?.users ?? []).map((u) => u.id)).toEqual(firstPageUserIds)

    // Wait until the fetched page replaces the placeholder
    await waitFor(() => {
      const ids = (result.current.data?.users ?? []).map((u) => u.id)
      expect(ids).not.toEqual(firstPageUserIds)
    })
  })

  it('deletes a user and invalidates the list', async () => {
    const qc = createTestQueryClient()
    const wrapper = withQueryClient(qc)

    const { result: list } = renderHook(() => useAdminUsers({ page: 1, limit: 10 }), { wrapper })
    await waitFor(() => expect(list.current.isSuccess).toBe(true))
    const initialCount = list.current.data?.users.length ?? 0

    const { result: del } = renderHook(() => useDeleteAdminUser(), { wrapper })
    await act(async () => {
      await del.current.mutateAsync('u1')
    })

    await waitFor(() => expect(list.current.data?.users.length).toBeLessThan(initialCount))
  })

  it('updates a user role and invalidates the list', async () => {
    const qc = createTestQueryClient()
    const wrapper = withQueryClient(qc)

    const { result: list } = renderHook(() => useAdminUsers({ page: 1, limit: 10 }), { wrapper })
    await waitFor(() => expect(list.current.isSuccess).toBe(true))
    const user = list.current.data!.users.find((u) => u.id === 'u1')!
    expect(user.role).toBe('user')

    const { result: update } = renderHook(() => useUpdateAdminUserRole(), { wrapper })
    await act(async () => {
      await update.current.mutateAsync({ userId: 'u1', role: 'admin' })
    })

    await waitFor(() => {
      const updated = list.current.data!.users.find((u) => u.id === 'u1')!
      expect(updated.role).toBe('admin')
    })
  })
})
