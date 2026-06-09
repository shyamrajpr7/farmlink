import { NavLink, useNavigate } from 'react-router-dom'

const nav = [
  { to: '/',         icon: '▦',  label: 'Dashboard' },
  { to: '/products', icon: '🌾', label: 'My Products' },
  { to: '/orders',   icon: '📦', label: 'Orders' },
]

export default function Layout({ children, user }) {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('fl_farmer_token')
    localStorage.removeItem('fl_farmer_user')
    navigate('/login')
    window.location.reload()
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <aside style={{
        width: 220, background: 'var(--bg2)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', flexShrink: 0
      }}>
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>🌾</span>
            <div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, lineHeight: 1.2 }}>FarmLink</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Farmer Portal</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 10px' }}>
          {nav.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8, marginBottom: 2,
              color: isActive ? 'var(--accent)' : 'var(--muted)',
              background: isActive ? 'var(--green-dim)' : 'transparent',
              fontSize: 14, fontWeight: isActive ? 500 : 400,
              transition: 'all 0.15s'
            })}>
              <span style={{ fontSize: 16 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border2)' }}>
          <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 2, fontWeight: 500 }}>{user?.name}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{user?.farmName || 'Farm not set'}</div>
          <div style={{ fontSize: 11, marginBottom: 12, display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '2px 10px', borderRadius: 20,
            background: user?.isVerified ? 'var(--green-dim)' : 'var(--amber-dim)',
            color: user?.isVerified ? 'var(--green)' : 'var(--amber)',
            border: `1px solid ${user?.isVerified ? 'var(--green)' : 'var(--amber)'}44`
          }}>
            {user?.isVerified ? '✓ Verified' : '⏳ Pending verification'}
          </div>
          <button onClick={logout} style={{
            width: '100%', padding: '7px', background: 'transparent',
            border: '1px solid var(--border)', borderRadius: 7,
            color: 'var(--muted)', fontSize: 12, transition: 'all 0.15s'
          }}
            onMouseEnter={e => { e.target.style.borderColor = 'var(--red)'; e.target.style.color = 'var(--red)' }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--muted)' }}
          >
            Sign out
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
        {children}
      </main>
    </div>
  )
}