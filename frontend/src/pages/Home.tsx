import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import ProductCard from '../components/ProductCard'
import type { Product } from '../types'

const RANGE = ['Furniture', 'Home Decor', 'Kitchen']

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [tiles, setTiles] = useState<Record<string, Product | undefined>>({})

  useEffect(() => {
    api<{ products: Product[] }>('/products?limit=8&category=Furniture').then((r) => setFeatured(r.products)).catch(() => {})
    RANGE.forEach((c) =>
      api<{ products: Product[] }>(`/products?limit=1&sort=price-desc&category=${encodeURIComponent(c)}`)
        .then((r) => setTiles((t) => ({ ...t, [c]: r.products[0] }))).catch(() => {}))
  }, [])

  return (
    <>
      <section className="hero">
        <div className="hero-art">{featured[1] && <img src={featured[1].images[0]} alt="" />}</div>
        <div className="container">
          <div className="hero-card">
            <span className="eyebrow">New Arrival</span>
            <h1>Discover Our New Collection</h1>
            <p>Furniture, decor and everyday essentials, crafted to make every room feel like home.</p>
            <Link to="/shop" className="btn btn-gold">BUY NOW</Link>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="center"><h2>Browse The Range</h2><p className="muted">Find something for every room.</p></div>
        <div className="range">
          {RANGE.map((c) => (
            <Link to={`/shop?category=${encodeURIComponent(c)}`} key={c} className="range-tile">
              <div className="range-img">{tiles[c] && <img src={tiles[c]!.thumbnail} alt={c} />}</div>
              <h4>{c}</h4>
            </Link>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="center"><h2>Our Products</h2></div>
        <div className="grid">{featured.map((p) => <ProductCard key={p.id} p={p} />)}</div>
        <div className="center"><Link to="/shop" className="btn btn-outline">Show More</Link></div>
      </section>
    </>
  )
}
