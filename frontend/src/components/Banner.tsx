import { Link } from 'react-router-dom'
export default function Banner({ title, crumbs }: { title: string; crumbs: { label: string; to?: string }[] }) {
  return (
    <section className="banner">
      <h1>{title}</h1>
      <p className="crumbs">
        <Link to="/">Home</Link>
        {crumbs.map((c) => (<span key={c.label}> › {c.to ? <Link to={c.to}>{c.label}</Link> : c.label}</span>))}
      </p>
    </section>
  )
}
