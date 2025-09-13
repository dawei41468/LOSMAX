import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 0,
        staleTime: 0,
      },
      mutations: {
        retry: 0,
      },
    },
  })
}

export function withQueryClient(client: QueryClient) {
  // Wrapper for render/renderHook that injects QueryClientProvider
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}
