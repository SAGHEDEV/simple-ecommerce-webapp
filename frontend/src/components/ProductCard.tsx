import { Link } from 'react-router-dom'
import { useCart, useMoney } from '../store'
import type { Product } from '../types'

export default function ProductCard({ p }: { p: Product }) {
  const money = useMoney()
  const { items, add, setQty, remove } = useCart()
  const inCart = items.find((i) => i.id === p.id)
  const out = p.stock < 1
  return (
    <div className={`card ${inCart ? 'in-cart' : ''}`}>
      <div className="card-img">
        <Link to={`/product/${p.id}`}><img src={p.thumbnail} alt={p.title} loading="lazy" /></Link>
        {p.discountPercentage > 0 && <span className="pill pill-red">-{p.discountPercentage}%</span>}
        {p.discountPercentage === 0 && p.isNew && <span className="pill pill-green">New</span>}
        {inCart && <span className="in-cart-tag">✓ In cart</span>}
        <div className="card-hover">
          <button className="btn btn-white" disabled={out || !!inCart} onClick={() => add(p)}>
            {out ? 'Out of stock' : inCart ? 'Added to cart' : 'Add to cart'}
          </button>
          <Link to={`/product/${p.id}`} className="hover-link">View details</Link>
        </div>
      </div>
      <div className="card-body">
        <Link to={`/product/${p.id}`} className="card-title" title={p.title}>{p.title}</Link>
        <span className="muted small">{p.category}</span>
        <div className="price-row">
          <b>{money(p.price)}</b>
          {p.originalPrice && <s className="muted small">{money(p.originalPrice)}</s>}
        </div>
        {inCart ? (
          <div className="card-incart">
            <span className="incart-label">✓ In cart</span>
            <div className="qty">
              <button aria-label="Decrease" onClick={() => (inCart.quantity <= 1 ? remove(p.id) : setQty(p.id, inCart.quantity - 1))}>−</button>
              <span>{inCart.quantity}</span>
              <button aria-label="Increase" disabled={inCart.quantity >= inCart.stock} onClick={() => setQty(p.id, inCart.quantity + 1)}>+</button>
            </div>
          </div>
        ) : (
          <button className="btn btn-outline btn-block card-add" disabled={out} onClick={() => add(p)}>{out ? 'Out of stock' : 'Add to Cart'}</button>
        )}
      </div>
    </div>
  )
}
