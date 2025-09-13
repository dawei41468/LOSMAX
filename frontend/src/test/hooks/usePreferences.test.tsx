import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { createTestQueryClient, withQueryClient } from '../utils'
import { usePreferences, useUpdatePreferences } from '../../hooks/usePreferences'
import { __testData } from '../server'

beforeEach(() => {
  __testData.reset()
})

describe('usePreferences', () => {
  it('updates language and invalidates preferences', async () => {
    const qc = createTestQueryClient()
    const wrapper = withQueryClient(qc)

    const { result: prefs } = renderHook(() => usePreferences(), { wrapper })
    await waitFor(() => expect(prefs.current.isSuccess).toBe(true))
    expect(prefs.current.data?.language).toBe('en')

    const { result: update } = renderHook(() => useUpdatePreferences(), { wrapper })
    await act(async () => {
      await update.current.mutateAsync({ language: 'zh' })
    })

    // After invalidation, the query should refetch and reflect the new language
    await waitFor(() => expect(prefs.current.data?.language).toBe('zh'))
  })
})
