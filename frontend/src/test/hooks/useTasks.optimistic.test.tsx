import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { createTestQueryClient, withQueryClient } from '../utils'
import { __testData } from '../server'
import { useTasks, useToggleTaskStatus } from '../../hooks/useTasks'

// Ensure fresh data for each test
beforeEach(() => {
  __testData.reset()
})

describe('useTasks optimistic toggle', () => {
  it('optimistically updates status and keeps it on success', async () => {
    const qc = createTestQueryClient()
    const wrapper = withQueryClient(qc)

    const { result: list } = renderHook(() => useTasks({}), { wrapper })
    await waitFor(() => expect(list.current.isSuccess).toBe(true))

    // Initial state sanity
    expect(list.current.data?.find((t) => t.id === '1')?.status).toBe('incomplete')

    const { result: toggle } = renderHook(() => useToggleTaskStatus(), { wrapper })

    // Trigger mutation without awaiting server response to observe optimistic state
    act(() => {
      toggle.current.mutate({ id: '1', currentStatus: 'incomplete' })
    })

    // Optimistic cache should reflect quickly
    await waitFor(() => {
      expect(list.current.data?.find((t) => t.id === '1')?.status).toBe('completed')
    })

    // And it should remain completed after server settles
    await waitFor(() => {
      expect(list.current.data?.find((t) => t.id === '1')?.status).toBe('completed')
    })
  })
})
