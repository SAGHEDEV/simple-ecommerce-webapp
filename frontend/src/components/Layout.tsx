import { useState, type FormEvent } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth, useCart, useCurrency } from '../store'
import { CartIcon, CheckIcon, HeadsetIcon, Logo, SearchIcon, TrophyIcon, TruckIcon, UserIcon } from './Icons'
import CartDrawer from './CartDrawer'

function Header() {
  const { user, signOut } = useAuth()
  const { count, setOpen } = useCart()
  const { code, options, setCode } = useCurrency()
  const nav = useNavigate()
  const [searching, setSearching] = useState(false)
  const [q, setQ] = useState('')
  const [menu, setMenu] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    nav(`/shop?search=${encodeURIComponent(q.trim())}`)
    setSearching(false)
  }
  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="brand"><Logo /> Furniro</Link>
        <nav className="nav">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/shop">Shop</NavLink>
          <NavLink to="/orders">Orders</NavLink>
        </nav>
        <div className="icons">
          {searching && (
            <form onSubmit={submit} className="header-search">
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" onBlur={() => !q && setSearching(false)} />
            </form>
          )}
          <button aria-label="Search" onClick={() => setSearching((s) => !s)}><SearchIcon /></button>
          {options.length > 0 && (
            <select className="currency-select" aria-label="Currency" value={code} onChange={(e) => setCode(e.target.value)}>
              {options.map((o) => <option key={o.code} value={o.code}>{o.code}</option>)}
            </select>
          )}
          <div className="user-menu">
            {user ? (
              <button aria-label="Account" onClick={() => setMenu((m) => !m)}><UserIcon /></button>
            ) : (
              <Link to="/auth" aria-label="Sign in"><UserIcon /></Link>
            )}
            {user && menu && (
              <div className="dropdown" onClick={() => setMenu(false)}>
                <p>Hi, {user.name.split(' ')[0]}</p>
                <Link to="/orders">My orders</Link>
                <button onClick={() => { signOut(); nav('/') }}>Sign out</button>
              </div>
            )}
          </div>
          <button aria-label="Cart" className="cart-btn" onClick={() => setOpen(true)}>
            <CartIcon />{count > 0 && <span className="badge">{count}</span>}
          </button>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <>
      <section className="features">
        <div className="container features-grid">
          <div><TrophyIcon /><div><b>High Quality</b><span>Crafted from top materials</span></div></div>
          <div><CheckIcon /><div><b>Warranty Protection</b><span>Over 2 years</span></div></div>
          <div><TruckIcon /><div><b>Free Shipping</b><span>On every order</span></div></div>
          <div><HeadsetIcon /><div><b>24 / 7 Support</b><span>Dedicated support</span></div></div>
        </div>
      </section>
      <footer className="footer">
        <div className="container footer-grid">
          <div><h3 className="brand-text">Furniro.</h3><p className="muted">400 University Drive Suite 200 Coral Gables, FL 33134 USA</p></div>
          <div><h4>Links</h4><Link to="/">Home</Link><Link to="/shop">Shop</Link><Link to="/orders">Orders</Link></div>
          <div><h4>Help</h4><a>Payment Options</a><a>Returns</a><a>Privacy Policies</a></div>
          <div><h4>Newsletter</h4><form className="newsletter" onSubmit={(e) => e.preventDefault()}><input placeholder="Enter your email address" /><button>SUBSCRIBE</button></form></div>
        </div>
        <div className="container copyright">2023 Furniro. All rights reserved</div>
      </footer>
    </>
  )
}

export default function Layout() {
  return (
    <>
      <Header />
      <main><Outlet /></main>
      <Footer />
      <CartDrawer />
    </>
  )
}
