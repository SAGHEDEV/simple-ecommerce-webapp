import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import Banner from '../components/Banner'
import type { Order } from '../types'

export default function OrderConfirm() {
  const { id } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api<{ order: Order }>(`/orders/${id}`).then((r) => setOrder(r.order)).catch((e) => setError(e.message))
  }, [id])

  const paid = order && order.status !== 'pending'
  return (
    <>
      <Banner title="Order Status" crumbs={[{ label: 'Confirmation' }]} />
      <section className="container section center">
        {error && <p className="error">{error}</p>}
        {!order && !error && <p className="muted">Loading…</p>}
        {order && (
          <>
            <h2>{paid ? 'Thank you! Payment received 🎉' : 'Payment not confirmed yet'}</h2>
            <p className="muted">{paid ? `Order #${order.id} is confirmed.` : `Order #${order.id} is still pending.`}</p>
            <p style={{ marginTop: 24 }}>
              {!paid && <Link to={`/orders/${order.id}/pay`} className="btn btn-gold" style={{ marginRight: 12 }}>Complete payment</Link>}
              <Link to="/orders" className={`btn ${paid ? 'btn-gold' : 'btn-outline'}`}>View my orders</Link>
            </p>
          </>
        )}
      </section>
    </>
  )
}
