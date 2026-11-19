/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, formatMoney, getToken, setToken } from './api'
import type { Product, User } from './types'

// ---------- Auth ----------
interface AuthCtx {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => void
}
const AuthContext = createContext<AuthCtx>(null!)
export const useAuth = () => useContext(AuthContext)

// ---------- Cart ----------
export interface CartItem {
  id: number; title: string; price: number; thumbnail: string; stock: number; quantity: number
}
interface CartCtx {
  items: CartItem[]
  count: number
  total: number
  open: boolean
  setOpen: (o: boolean) => void
  add: (p: Product, qty?: number) => void
  setQty: (id: number, qty: number) => void
  remove: (id: number) => void
  clear: () => void
}
const CartContext = createContext<CartCtx>(null!)
export const useCart = () => useContext(CartContext)

// ---------- Currency ----------
export interface CurrencyOption { code: string; name: string }
interface CurrencyCtx {
  code: string
  rate: number
  options: CurrencyOption[]
  setCode: (c: string) => void
}
const CurrencyContext = createContext<CurrencyCtx>({ code: 'USD', rate: 1, options: [], setCode: () => {} })
export const useCurrency = () => useContext(CurrencyContext)
/** Returns a formatter that converts a USD amount into the currently selected currency. */
export function useMoney() {
  const { code, rate } = useCurrency()
  return useCallback((usd: number) => formatMoney(usd, code, rate), [code, rate])
}

const CART_KEY = 'furniro_cart'
const CURRENCY_KEY = 'furniro_currency'

export function Providers({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(!!getToken())
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]') } catch { return [] }
  })
  const [open, setOpen] = useState(false)
  const [currencyCode, setCurrencyCode] = useState(() => localStorage.getItem(CURRENCY_KEY) ?? 'USD')
  const [rates, setRates] = useState<Record<string, number>>({})
  const [options, setOptions] = useState<CurrencyOption[]>([])

  useEffect(() => {
    api<{ currencies: CurrencyOption[]; rates: Record<string, number> }>('/currencies')
      .then((r) => { setOptions(r.currencies); setRates(r.rates) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!getToken()) return
    api<{ user: User }>('/auth/me')
      .then((r) => setUser(r.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(items)) }, [items])

  const authed = (r: { token: string; user: User }) => { setToken(r.token); setUser(r.user) }
  const auth = useMemo<AuthCtx>(() => ({
    user, loading,
    signIn: async (email, password) => authed(await api('/auth/signin', { body: { email, password } })),
    signUp: async (name, email, password) => authed(await api('/auth/signup', { body: { name, email, password } })),
    signOut: () => { setToken(null); setUser(null) },
  }), [user, loading])

  const add = useCallback((p: Product, qty = 1) => {
    if (p.stock < 1) return
    setItems((cur) => {
      const found = cur.find((i) => i.id === p.id)
      if (found) return cur.map((i) => i.id === p.id ? { ...i, quantity: Math.min(i.stock, i.quantity + qty) } : i)
      return [...cur, { id: p.id, title: p.title, price: p.price, thumbnail: p.thumbnail, stock: p.stock, quantity: Math.min(p.stock, qty) }]
    })
    setOpen(true)
  }, [])
  const setQty = useCallback((id: number, qty: number) =>
    setItems((cur) => cur.map((i) => i.id === id ? { ...i, quantity: Math.max(1, Math.min(i.stock, qty)) } : i)), [])
  const remove = useCallback((id: number) => setItems((cur) => cur.filter((i) => i.id !== id)), [])
  const clear = useCallback(() => setItems([]), [])

  const cart: CartCtx = {
    items, open, setOpen, add, setQty, remove, clear,
    count: items.reduce((s, i) => s + i.quantity, 0),
    total: items.reduce((s, i) => s + i.quantity * i.price, 0),
  }
  // Fall back to USD until the rates have loaded (or if the chosen currency is unavailable).
  const effective = rates[currencyCode] ? currencyCode : 'USD'
  const currency: CurrencyCtx = {
    code: effective, rate: rates[effective] ?? 1, options,
    setCode: (c) => { setCurrencyCode(c); localStorage.setItem(CURRENCY_KEY, c) },
  }
  return (
    <AuthContext.Provider value={auth}>
      <CurrencyContext.Provider value={currency}>
        <CartContext.Provider value={cart}>{children}</CartContext.Provider>
      </CurrencyContext.Provider>
    </AuthContext.Provider>
  )
}
