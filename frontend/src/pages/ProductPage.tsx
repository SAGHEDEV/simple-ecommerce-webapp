import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api'
import Banner from '../components/Banner'
import { useCart, useMoney } from '../store'
import type { Product } from '../types'

export default function ProductPage() {
  const money = useMoney()
  const { id } = useParams()
  const { add } = useCart()
  const [p, setP] = useState<Product | null>(null)
  const [error, setError] = useState('')
  const [img, setImg] = useState(0)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    api<{ product: Product }>(`/products/${id}`)
      .then((r) => { setP(r.product); setImg(0); setQty(1) })
      .catch((e) => setError(e.message))
  }, [id])

  if (error) return <p className="container section error">{error}</p>
  if (!p) return <p className="container section muted">Loading…</p>
  const low = p.stock > 0 && p.stock <= 10

  return (
    <>
      <Banner title={p.title} crumbs={[{ label: 'Shop', to: '/shop' }, { label: p.title }]} />
      <section className="container section detail">
        <div className="gallery">
          <div className="thumbs">
            {p.images.map((src, i) => (
              <button key={src} className={i === img ? 'active' : ''} onClick={() => setImg(i)}><img src={src} alt="" /></button>
            ))}
          </div>
          <div className="main-img"><img src={p.images[img]} alt={p.title} /></div>
        </div>
        <div className="info">
          <h1>{p.title}</h1>
          <p className="big-price">
            {money(p.price)} {p.originalPrice && <s className="muted small">{money(p.originalPrice)}</s>}
          </p>
          <p className="muted small">★ {p.rating.toFixed(1)} · {p.category}{p.brand && ` · ${p.brand}`}</p>
          <p className="desc">{p.description}</p>
          <p className={`stock ${p.stock < 1 ? 'out' : low ? 'low' : 'in'}`}>
            {p.stock < 1 ? 'Out of stock' : low ? `Only ${p.stock} left in stock` : 'In stock'}
          </p>
          <div className="buy-row">
            <div className="qty big">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => Math.min(p.stock, q + 1))}>+</button>
            </div>
            <button className="btn btn-outline lg" disabled={p.stock < 1} onClick={() => add(p, qty)}>Add To Cart</button>
          </div>
        </div>
      </section>
    </>
  )
}
