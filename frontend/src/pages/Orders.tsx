import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { api, formatMoney } from '../api'
import Banner from '../components/Banner'
import { useAuth } from '../store'
import type { Order } from '../types'

export const StatusBadge = ({ s }: { s: Order['status'] }) => <span className={`status ${s}`}>{s[0].toUpperCase() + s.slice(1)}</span>

export default function Orders() {
  const { user, loading } = useAuth()
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    api<{ orders: Order[] }>('/orders').then((r) => setOrders(r.orders)).catch((e) => setError(e.message))
  }, [user])

  if (loading) return null
  if (!user) return <Navigate to="/auth" state={{ from: '/orders' }} replace />

  return (
    <>
      <Banner title="My Orders" crumbs={[{ label: 'Orders' }]} />
      <section className="container section orders">
        {error && <p className="error">{error}</p>}
        {!orders && !error && <p className="muted">Loading…</p>}
        {orders?.length === 0 && <p className="center">No orders yet. <Link className="link" to="/shop">Start shopping</Link></p>}
        {orders?.map((o) => (
          <article className="order" key={o.id}>
            <header>
              <div><b>Order #{o.id}</b><span className="muted small"> · {new Date(o.createdAt).toLocaleString()}</span></div>
              <StatusBadge s={o.status} />
            </header>
            {o.items.map((i) => (
              <div className="order-item" key={i.productId}>
                <img src={i.thumbnail} alt="" />
                <Link to={`/product/${i.productId}`}>{i.title}</Link>
                <span className="muted">× {i.quantity}</span>
                <b>{formatMoney(i.price * i.quantity, o.currency, o.exchangeRate)}</b>
              </div>
            ))}
            <footer><span className="muted small">Ship to {o.shipping.fullName}, {o.shipping.city}</span><span>{o.status === 'pending' && <Link className="link" to={`/orders/${o.id}/pay`}>Complete payment</Link>}{' '}<b>Total {formatMoney(o.total, o.currency, o.exchangeRate)}</b></span></footer>
          </article>
        ))}
      </section>
    </>
  )
}
