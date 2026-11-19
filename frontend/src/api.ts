// Backend base URL from frontend/.env (VITE_API_URL). Empty = same origin (uses the Vite dev proxy).
export const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')

const TOKEN_KEY = 'furniro_token'
export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t: string | null) =>
  t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY)

export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API_URL}/api${path}`, {
    method: init.method ?? (init.body ? 'POST' : 'GET'),
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? 'Request failed')
  return data as T
}

/** Format a USD amount in `currency` using `rate` (units of currency per 1 USD). */
export const formatMoney = (usd: number, currency = 'USD', rate = 1) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(usd * rate)
