import { useState } from 'react'
import api from '../api'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      if (data.user.role !== 'admin') {
        setError('Access denied. Admin accounts only.')
        setLoading(false)
        return
      }
      localStorage.setItem('fl_token', data.token)
      localStorage.setItem('fl_user', JSON.stringify(data.user))
      onLogin(data.user)
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)',
      backgroundImage: 'radial-gradient(ellipse at 20% 50%, #1a3a2420 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #1a2a3a30 0%, transparent 50%)'
    }}>
      <div className="fade-up" style={{ width: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🌱</div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 400 }}>FarmLink</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>Admin Control Centre</p>
        </div>

        <form onSubmit={submit} style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 14, padding: 32
        }}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="admin@farmlink.com"
              style={{
                width: '100%', padding: '10px 14px', background: 'var(--bg3)',
                border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)',
                fontSize: 14, outline: 'none', transition: 'border 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••"
              style={{
                width: '100%', padding: '10px 14px', background: 'var(--bg3)',
                border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)',
                fontSize: 14, outline: 'none', transition: 'border 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {error && (
            <div style={{ background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 8, padding: '10px 14px', marginBottom: 18, color: 'var(--red)', fontSize: 13 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '11px', background: 'var(--accent)',
            border: 'none', borderRadius: 8, color: '#0d1117',
            fontSize: 14, fontWeight: 600, transition: 'opacity 0.2s',
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 12, marginTop: 20 }}>
          FarmLink Admin v1.0 · Phase 1 Logistics
        </p>
      </div>
    </div>
  )
}