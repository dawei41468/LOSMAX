import { setupServer } from 'msw/node'
import { http, HttpResponse, delay } from 'msw'

// In-memory fixtures for tests
let tasks = [
  { id: '1', user_id: 'u1', goal_id: 'g1', title: 'T1', status: 'incomplete', created_at: '2025-01-01' },
  { id: '2', user_id: 'u1', goal_id: 'g1', title: 'T2', status: 'completed', created_at: '2025-01-02' },
]

let preferences = {
  morning_deadline: '08:00',
  evening_deadline: '20:00',
  notifications_enabled: true,
  language: 'en',
}

let adminUsers = [
  { id: 'u1', email: 'a@a.com', name: 'Alice', role: 'user', createdAt: '2025-01-01', language: 'en' },
  { id: 'u2', email: 'b@b.com', name: 'Bob', role: 'admin', createdAt: '2025-01-02', language: 'en' },
  { id: 'u3', email: 'c@c.com', name: 'Cathy', role: 'user', createdAt: '2025-01-03', language: 'en' },
]

export const handlers = [
  // Tasks list
  http.get('*/tasks/', () => {
    return HttpResponse.json(tasks)
  }),

  // Update task
  http.put('*/tasks/:id', async ({ params, request }) => {
    const id = params.id as string
    const body = (await request.json()) as { status?: 'completed' | 'incomplete'; title?: string }
    const idx = tasks.findIndex((t) => t.id === id)
    if (idx === -1) return HttpResponse.json({ detail: 'Not found' }, { status: 404 })
    tasks[idx] = { ...tasks[idx], ...body }
    return HttpResponse.json(tasks[idx])
  }),

  // Preferences
  http.get('*/preferences', () => HttpResponse.json(preferences)),
  http.patch('*/preferences', async ({ request }) => {
    const update = (await request.json()) as Partial<typeof preferences>
    preferences = { ...preferences, ...update }
    return HttpResponse.json(preferences)
  }),

  // Admin: list users with pagination (2 per page) and optional role/search filters
  http.get('*/admin/users', async ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '1')
    const limit = Number(url.searchParams.get('limit') ?? '10')
    const role = url.searchParams.get('role') ?? 'all'
    const search = url.searchParams.get('search') ?? ''
    let filtered = adminUsers
    if (role !== 'all') filtered = filtered.filter((u) => u.role === role)
    if (search) filtered = filtered.filter((u) => u.email.includes(search) || (u.name ?? '').includes(search))
    const start = (page - 1) * limit
    const slice = filtered.slice(start, start + limit)
    // Add small delay to simulate loading
    await delay(50)
    return HttpResponse.json({ users: slice, total: filtered.length })
  }),
  http.delete('*/admin/users/:id', async ({ params }) => {
    const id = params.id as string
    adminUsers = adminUsers.filter((u) => u.id !== id)
    return HttpResponse.json({ ok: true })
  }),
  http.patch('*/admin/users/:id', async ({ params, request }) => {
    const id = params.id as string
    const body = (await request.json()) as { role?: string }
    const idx = adminUsers.findIndex((u) => u.id === id)
    if (idx === -1) return HttpResponse.json({ detail: 'Not found' }, { status: 404 })
    adminUsers[idx] = { ...adminUsers[idx], ...body }
    return HttpResponse.json(adminUsers[idx])
  }),
  http.get('*/admin/users/:id/details', async ({ params }) => {
    const id = params.id as string
    const user = adminUsers.find((u) => u.id === id)
    if (!user) return HttpResponse.json({ detail: 'Not found' }, { status: 404 })
    return HttpResponse.json({ ...user, preferences })
  }),
]

export const server = setupServer(...handlers)

// Utilities to help tests tweak data
export const __testData = {
  reset() {
    tasks = [
      { id: '1', user_id: 'u1', goal_id: 'g1', title: 'T1', status: 'incomplete', created_at: '2025-01-01' },
      { id: '2', user_id: 'u1', goal_id: 'g1', title: 'T2', status: 'completed', created_at: '2025-01-02' },
    ]
    preferences = { morning_deadline: '08:00', evening_deadline: '20:00', notifications_enabled: true, language: 'en' }
    adminUsers = [
      { id: 'u1', email: 'a@a.com', name: 'Alice', role: 'user', createdAt: '2025-01-01', language: 'en' },
      { id: 'u2', email: 'b@b.com', name: 'Bob', role: 'admin', createdAt: '2025-01-02', language: 'en' },
      { id: 'u3', email: 'c@c.com', name: 'Cathy', role: 'user', createdAt: '2025-01-03', language: 'en' },
    ]
  },
  setTasks(next: typeof tasks) {
    tasks = next
  },
}
