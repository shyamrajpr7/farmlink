import { useEffect, useState } from 'react'
import api from '../api'

const statusColor = s => ({
  pending: 'var(--amber)', accepted: 'var(--blue)', ready: 'var(--blue)',
  in_transit: 'var(--blue)', delivered: 'var(--accent)', completed: 'var(--accent)',
  cancelled: 'var(--red)', disputed: 'var(--red)'
}[s] || 'var(--muted)')

const Badge = ({ status }) => (
  <span style={{
    display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 11,
    background: statusColor(status) + '22', color: statusColor(status),
    border: `1px solid ${statusColor(status)}44`, textTransform: 'capitalize'
  }}>{status?.replace(/_/g, ' ')}</span>
)

export default function Dashboard() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('fl_farmer_user') || '{}')

  useEffect(() => {
    Promise.all([
      api.get('/orders/farm'),
      api.get('/products/my')
    ]).then(([o, p]) => {
      setOrders(o.data.orders)
      setProducts(p.data.products)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const pending  = orders.filter(o => o.status === 'pending').length
  const active   = orders.filter(o => ['accepted','ready','in_transit','delivered'].includes(o.status)).length
  const completed = orders.filter(o => o.status === 'completed').length
  const revenue  = orders.filter(o => o.paymentStatus === 'released').reduce((s, o) => s + o.totalAmount, 0)

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)' }}>
      Loading...
    </div>
  )

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1000 }}>
      <div className="fade-up" style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 26, fontWeight: 400 }}>
          Welcome, {user.name} 👋
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
          {user.farmName || 'Your farm'} · {user.isVerified ? '✓ Verified' : '⏳ Pending verification'}
        </p>
      </div>

      {!user.isVerified && (
        <div className="fade-up" style={{ background: 'var(--amber-dim)', border: '1px solid var(--amber)44', borderRadius: 10, padding: '14px 20px', marginBottom: 24, color: 'var(--amber)', fontSize: 13 }}>
          ⏳ Your account is pending admin verification. You'll be able to list products once approved.
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Pending Orders', value: pending, color: 'var(--amber)' },
          { label: 'Active Orders', value: active, color: 'var(--blue)' },
          { label: 'Completed', value: completed, color: 'var(--green)' },
          { label: 'Revenue Earned', value: `₹${revenue}`, color: 'var(--text)' },
        ].map(({ label, value, color }, i) => (
          <div key={i} className="fade-up" style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '20px 24px', animationDelay: `${i * 0.06}s`
          }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{label}</div>
            <div style={{ fontSize: 28, fontFamily: 'var(--font-mono)', fontWeight: 500, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="fade-up-2" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Recent Orders</div>
          <a href="/orders" style={{ fontSize: 12, color: 'var(--accent)' }}>View all →</a>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border2)' }}>
              {['Product', 'Consumer', 'Qty', 'Amount', 'Mode', 'Status'].map(h => (
                <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 400 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '24px 20px', color: 'var(--muted)', textAlign: 'center', fontSize: 13 }}>No orders yet</td></tr>
            )}
            {orders.slice(0, 5).map(o => (
              <tr key={o._id} style={{ borderBottom: '1px solid var(--border2)', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px 20px', fontSize: 13 }}>{o.product?.name || '—'}</td>
                <td style={{ padding: '12px 20px', fontSize: 13, color: 'var(--muted)' }}>{o.consumer?.name || '—'}</td>
                <td style={{ padding: '12px 20px', fontSize: 13, fontFamily: 'var(--font-mono)' }}>{o.quantity} {o.product?.unit}</td>
                <td style={{ padding: '12px 20px', fontSize: 13, fontFamily: 'var(--font-mono)' }}>₹{o.totalAmount}</td>
                <td style={{ padding: '12px 20px', fontSize: 12, color: 'var(--muted)', textTransform: 'capitalize' }}>{o.deliveryMode?.replace(/_/g, ' ')}</td>
                <td style={{ padding: '12px 20px' }}><Badge status={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}