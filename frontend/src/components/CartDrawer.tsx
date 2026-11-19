import { Link } from 'react-router-dom'
import { useCart, useMoney } from '../store'
import { CloseIcon, TrashIcon } from './Icons'

export default function CartDrawer() {
  const money = useMoney()
  const { items, open, setOpen, setQty, remove, total } = useCart()
  return (
    <>
      <div className={`overlay ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="drawer-head">
          <h3>Shopping Cart</h3>
          <button aria-label="Close cart" onClick={() => setOpen(false)}><CloseIcon /></button>
        </div>
        <div className="drawer-body">
          {items.length === 0 && <p className="muted">Your cart is empty.</p>}
          {items.map((i) => (
            <div className="cart-row" key={i.id}>
              <img src={i.thumbnail} alt={i.title} />
              <div className="cart-info">
                <Link to={`/product/${i.id}`} onClick={() => setOpen(false)}>{i.title}</Link>
                <div className="qty-line">
                  <div className="qty">
                    <button onClick={() => setQty(i.id, i.quantity - 1)} disabled={i.quantity <= 1}>−</button>
                    <span>{i.quantity}</span>
                    <button onClick={() => setQty(i.id, i.quantity + 1)} disabled={i.quantity >= i.stock}>+</button>
                  </div>
                  <span className="muted">× {money(i.price)}</span>
                </div>
              </div>
              <button className="icon-remove" aria-label="Remove" onClick={() => remove(i.id)}><TrashIcon /></button>
            </div>
          ))}
        </div>
        <div className="drawer-foot">
          <div className="subtotal"><span>Subtotal</span><b className="gold">{money(total)}</b></div>
          <Link to="/checkout" className={`btn btn-outline ${items.length ? '' : 'disabled'}`} onClick={() => setOpen(false)}>Checkout</Link>
        </div>
      </aside>
    </>
  )
}
