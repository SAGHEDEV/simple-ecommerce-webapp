import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { api } from '../api'
import Banner from '../components/Banner'
import { useAuth, useCart, useCurrency, useMoney } from '../store'

const FIELDS: [string, string, boolean][] = [
  ['fullName', 'Full name', true], ['phone', 'Phone', true], ['address', 'Street address', true],
  ['city', 'City', true], ['state', 'State / Region', true], ['postalCode', 'Postal code', false], ['country', 'Country', true],
]

export default function Checkout() {
  const { user, loading } = useAuth()
  const { items, total, clear } = useCart()
  const { code } = useCurrency()
  const money = useMoney()
  const nav = useNavigate()
  const [form, setForm] = useState<Record<string, string>>({ fullName: user?.name ?? '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (loading) return null
  if (!user) return <Navigate to="/auth" state={{ from: '/checkout' }} replace />
  if (!items.length) return (
    <>
      <Banner title="Checkout" crumbs={[{ label: 'Checkout' }]} />
      <p className="container section center">Your cart is empty. <Link className="link" to="/shop">Continue shopping</Link></p>
    </>
  )

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const r = await api<{ orderId: number }>('/orders', {
        body: { items: items.map((i) => ({ productId: i.id, quantity: i.quantity })), shipping: form, currency: code },
      })
      nav(`/orders/${r.orderId}/pay`)
      clear()
    } catch (err) {
      setError((err as Error).message); setBusy(false)
    }
  }

  return (
    <>
      <Banner title="Checkout" crumbs={[{ label: 'Checkout' }]} />
      <section className="container section checkout">
        <form onSubmit={submit} className="ship-form">
          <h2>Shipping details</h2>
          {FIELDS.map(([k, label, req]) => (
            <label key={k}>{label}<input required={req} value={form[k] ?? ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></label>
          ))}
          {error && <p className="error">{error}</p>}
          <button className="btn btn-gold btn-block lg" disabled={busy}>{busy ? 'Placing order…' : `Place order · ${money(total)}`}</button>
        </form>
        <aside className="summary">
          <h2>Order summary</h2>
          {items.map((i) => (
            <div className="sum-row" key={i.id}>
              <span>{i.title} <span className="muted">× {i.quantity}</span></span><b>{money(i.price * i.quantity)}</b>
            </div>
          ))}
          <div className="sum-row"><span>Shipping</span><b>Free</b></div>
          <div className="sum-row total"><span>Total</span><b className="gold">{money(total)}</b></div>
        </aside>
      </section>
    </>
  )
}
