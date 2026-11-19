import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api'
import Banner from '../components/Banner'
import ProductCard from '../components/ProductCard'
import type { Product } from '../types'

const LIMIT = 12
interface Res { products: Product[]; total: number; page: number; pages: number }

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const search = params.get('search') ?? ''
  const category = params.get('category') ?? 'All'
  const sort = params.get('sort') ?? ''
  const page = Number(params.get('page') ?? 1)

  const [categories, setCategories] = useState<string[]>([])
  const [data, setData] = useState<Res | null>(null)
  const [error, setError] = useState('')

  useEffect(() => { api<{ categories: string[] }>('/categories').then((r) => setCategories(r.categories)).catch(() => {}) }, [])

  useEffect(() => {
    let live = true
    const q = new URLSearchParams({ search, category, sort, page: String(page), limit: String(LIMIT) })
    api<Res>('/products?' + q)
      .then((r) => { if (live) { setData(r); setError('') } })
      .catch((e) => live && setError(e.message))
    return () => { live = false }
  }, [search, category, sort, page])

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params)
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)))
    if (!('page' in patch)) next.delete('page')
    setParams(next)
  }
  const from = data && data.total ? (data.page - 1) * LIMIT + 1 : 0
  const to = data ? Math.min(data.page * LIMIT, data.total) : 0

  return (
    <>
      <Banner title="Shop" crumbs={[{ label: 'Shop' }]} />
      <section className="toolbar">
        <div className="container toolbar-inner">
          <form key={search} className="search" onSubmit={(e) => { e.preventDefault(); update({ search: String(new FormData(e.currentTarget).get('q') ?? '').trim() }) }}>
            <input name="q" defaultValue={search} placeholder="Search products…" />
            <button className="btn btn-gold">Search</button>
          </form>
          <span className="muted small results">{data ? `Showing ${from}–${to} of ${data.total} results` : ''}</span>
          <label className="sort">Sort by
            <select value={sort} onChange={(e) => update({ sort: e.target.value })}>
              <option value="">Default</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name">Name</option>
            </select>
          </label>
        </div>
        <div className="container chips">
          {['All', ...categories].map((c) => (
            <button key={c} className={`chip ${c === category ? 'active' : ''}`} onClick={() => update({ category: c === 'All' ? '' : c })}>{c}</button>
          ))}
        </div>
      </section>

      <section className="container section">
        {error && <p className="error">{error}</p>}
        {!data && !error && <p className="muted center">Loading products…</p>}
        {data && data.products.length === 0 && <p className="muted center">No products match your search.</p>}
        <div className="grid">{data?.products.map((p) => <ProductCard key={p.id} p={p} />)}</div>
        {data && data.pages > 1 && (
          <div className="pager">
            {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => (
              <button key={n} className={n === data.page ? 'active' : ''} onClick={() => { update({ page: String(n) }); window.scrollTo(0, 0) }}>{n}</button>
            ))}
            {data.page < data.pages && <button className="wide" onClick={() => { update({ page: String(data.page + 1) }); window.scrollTo(0, 0) }}>Next</button>}
          </div>
        )}
      </section>
    </>
  )
}
