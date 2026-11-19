import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { api, formatMoney } from '../api'
import Banner from '../components/Banner'
import { useAuth } from '../store'
import type { Order } from '../types'

// Test payment step: the customer confirms they've paid by pressing a button.
export default function Pay() {
  const { id } = useParams()
  const { user, loading } = useAuth()
  const nav = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!user) return
    api<{ order: Order }>(`/orders/${id}`).then((r) => setOrder(r.order)).catch((e) => setError(e.message))
  }, [id, user])

  if (loading) return null
  if (!user) return <Navigate to="/auth" state={{ from: `/orders/${id}/pay` }} replace />

  const confirm = async () => {
    setBusy(true); setError('')
    try {
      await api(`/orders/${id}/pay`, { method: 'POST', body: {} })
      nav(`/orders/${id}/confirm`)
    } catch (e) { setError((e as Error).message); setBusy(false) }
  }

  return (
    <>
      <Banner title="Payment" crumbs={[{ label: 'Checkout', to: '/checkout' }, { label: 'Payment' }]} />
      <section className="container section">
        <div className="form-card center">
          {error && <p className="error">{error}</p>}
          {!order && !error && <p className="muted">Loading…</p>}
          {order && order.status !== 'pending' && (
            <>
              <h2>Order #{order.id} is already paid</h2>
              <Link to="/orders" className="btn btn-gold">View my orders</Link>
            </>
          )}
          {order && order.status === 'pending' && (
            <>
              <h2>Order #{order.id}</h2>
              <p className="big-total">{formatMoney(order.total, order.currency, order.exchangeRate)}</p>
              <p className="muted small">This is a test payment step – no real money moves. Once you've made your payment, press the button below to confirm it.</p>
              <button className="btn btn-gold btn-block" disabled={busy} onClick={confirm}>{busy ? 'Confirming…' : "I've made payment"}</button>
              <Link to="/orders" className="btn btn-outline btn-block">Pay later</Link>
            </>
          )}
        </div>
      </section>
    </>
  )
}
