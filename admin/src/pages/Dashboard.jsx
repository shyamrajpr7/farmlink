import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../api'

const Stat = ({ label, value, sub, color = 'var(--text)', delay = '0s' }) => (
  <div className="fade-up" style={{
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 12, padding: '20px 24px', animationDelay: delay
  }}>
    <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{label}</div>
    <div style={{ fontSize: 32, fontFamily: 'var(--font-mono)', fontWeight: 500, color, lineHeight: 1 }}>{value ?? '—'}</div>
    {sub && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>{sub}</div>}
  </div>
)

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
  }}>{status?.replace('_', ' ')}</span>
)

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard').then(r => { setData(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)' }}>
      Loading dashboard...
    </div>
  )

  const s = data?.stats || {}

  const sparkData = [
    { name: 'Mon', orders: Math.floor(s.totalOrders * 0.1) },
    { name: 'Tue', orders: Math.floor(s.totalOrders * 0.14) },
    { name: 'Wed', orders: Math.floor(s.totalOrders * 0.18) },
    { name: 'Thu', orders: Math.floor(s.totalOrders * 0.13) },
    { name: 'Fri', orders: Math.floor(s.totalOrders * 0.2) },
    { name: 'Sat', orders: Math.floor(s.totalOrders * 0.15) },
    { name: 'Sun', orders: Math.floor(s.totalOrders * 0.1) },
  ]

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100 }}>
      <div className="fade-up" style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 26, fontWeight: 400 }}>Dashboard</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>Platform overview · FarmLink Phase 1</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <Stat label="Total Farmers" value={s.totalFarmers} sub={`${s.pendingFarmers} awaiting verification`} color="var(--green)" delay="0s" />
        <Stat label="Consumers" value={s.totalConsumers} sub="registered users" delay="0.06s" />
        <Stat label="Active Orders" value={s.activeOrders} sub={`${s.completedOrders} completed`} color="var(--blue)" delay="0.12s" />
        <Stat label="Live Listings" value={s.totalProducts} sub="available products" color="var(--amber)" delay="0.18s" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, marginBottom: 28 }}>
        <div className="fade-up-2" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Orders this week</div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id="og" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3fb950" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3fb950" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fill: '#8b949e', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="orders" stroke="#3fb950" strokeWidth={2} fill="url(#og)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="fade-up-2" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Logistics</div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 20,
            background: s.logisticsEnterpriseEnabled ? 'var(--blue-dim)' : 'var(--green-dim)',
            border: `1px solid ${s.logisticsEnterpriseEnabled ? 'var(--blue)' : 'var(--green)'}44`,
            marginBottom: 16
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.logisticsEnterpriseEnabled ? 'var(--blue)' : 'var(--green)', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, color: s.logisticsEnterpriseEnabled ? 'var(--blue)' : 'var(--green)', fontWeight: 500 }}>
              Phase {s.logisticsEnterpriseEnabled ? '2 — Enterprise' : '1 — Manual'}
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
            {s.logisticsEnterpriseEnabled
              ? 'Ekart / Amazon courier APIs are active.'
              : 'Set LOGISTICS_ENTERPRISE_ENABLED=true in .env to activate Phase 2.'}
          </p>
        </div>
      </div>

      <div className="fade-up-3" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Recent Orders</div>
          <a href="/orders" style={{ fontSize: 12, color: 'var(--accent)' }}>View all →</a>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border2)' }}>
              {['Product', 'Consumer', 'Farmer', 'Amount', 'Mode', 'Status'].map(h => (
                <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 400 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.recentOrders?.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '24px 20px', color: 'var(--muted)', textAlign: 'center', fontSize: 13 }}>No orders yet</td></tr>
            )}
            {data?.recentOrders?.map(o => (
              <tr key={o._id} style={{ borderBottom: '1px solid var(--border2)', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px 20px', fontSize: 13 }}>{o.product?.name || '—'}</td>
                <td style={{ padding: '12px 20px', fontSize: 13, color: 'var(--muted)' }}>{o.consumer?.name || '—'}</td>
                <td style={{ padding: '12px 20px', fontSize: 13, color: 'var(--muted)' }}>{o.farmer?.farmName || o.farmer?.name || '—'}</td>
                <td style={{ padding: '12px 20px', fontSize: 13, fontFamily: 'var(--font-mono)' }}>₹{o.totalAmount}</td>
                <td style={{ padding: '12px 20px', fontSize: 12, color: 'var(--muted)' }}>{o.deliveryMode?.replace('_', ' ')}</td>
                <td style={{ padding: '12px 20px' }}><Badge status={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}