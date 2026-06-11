import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function Register({ onLogin }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', deliveryAddress: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', { ...form, role: 'consumer' })
      localStorage.setItem('fl_consumer_token', data.token)
      localStorage.setItem('fl_consumer_user', JSON.stringify(data.user))
      onLogin(data.user)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.')
    }
    setLoading(false)
  }

  const field = (label, key, type = 'text', placeholder = '') => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
      <input
        type={type} value={form[key]} onChange={set(key)} required
        placeholder={placeholder}
        style={{
          width: '100%', padding: '10px 14px', background: 'var(--bg3)',
          border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)',
          fontSize: 14, outline: 'none'
        }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)', padding: '40px 20px',
      backgroundImage: 'radial-gradient(ellipse at 20% 50%, #1a3a2420 0%, transparent 60%)'
    }}>
      <div className="fade-up" style={{ width: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🛒</div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 400 }}>Join FarmLink</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>Buy fresh produce directly from farmers</p>
        </div>

        <form onSubmit={submit} style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 14, padding: 32
        }}>
          {field('Full Name', 'name', 'text', 'Your name')}
          {field('Email', 'email', 'email', 'you@email.com')}
          {field('Phone', 'phone', 'tel', '9876543210')}
          {field('Password', 'password', 'password', '••••••••')}
          {field('Delivery Address', 'deliveryAddress', 'text', 'Your address')}

          {error && (
            <div style={{ background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 8, padding: '10px 14px', marginBottom: 18, color: 'var(--red)', fontSize: 13 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '11px', background: 'var(--accent)',
            border: 'none', borderRadius: 8, color: '#0d1117',
            fontSize: 14, fontWeight: 600, opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, marginTop: 20 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}