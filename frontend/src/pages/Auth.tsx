import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import Banner from '../components/Banner'
import { useAuth } from '../store'

export default function Auth() {
  const { user, signIn, signUp } = useAuth()
  const nav = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/'
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={from} replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      if (mode === 'in') await signIn(form.email, form.password)
      else await signUp(form.name, form.email, form.password)
      nav(from, { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally { setBusy(false) }
  }
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value })

  return (
    <>
      <Banner title={mode === 'in' ? 'Sign In' : 'Sign Up'} crumbs={[{ label: 'Account' }]} />
      <section className="container section">
        <form className="form-card" onSubmit={submit}>
          {mode === 'up' && <label>Name<input required value={form.name} onChange={set('name')} /></label>}
          <label>Email<input type="email" required value={form.email} onChange={set('email')} /></label>
          <label>Password<input type="password" required minLength={mode === 'up' ? 6 : 1} value={form.password} onChange={set('password')} /></label>
          {error && <p className="error">{error}</p>}
          <button className="btn btn-gold btn-block" disabled={busy}>{busy ? 'Please wait…' : mode === 'in' ? 'Sign In' : 'Create Account'}</button>
          <p className="muted small center">
            {mode === 'in' ? "Don't have an account? " : 'Already have an account? '}
            <a className="link" onClick={() => { setMode(mode === 'in' ? 'up' : 'in'); setError('') }}>{mode === 'in' ? 'Sign up' : 'Sign in'}</a>
          </p>
        </form>
      </section>
    </>
  )
}
