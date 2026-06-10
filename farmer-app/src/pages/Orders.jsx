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

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [pin, setPin] = useState({})
  const [completing, setCompleting] = useState(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  const fetchOrders = async () => {
    const { data } = await api.get('/orders/farm')
    setOrders(data.orders)
    setLoading(false)
  }

  useEffect(() => {
    let active = true
    api.get('/orders/farm').then(({ data }) => {
      if (active) {
        setOrders(data.orders)
        setLoading(false)
      }
    })
    return () => { active = false }
  }, [])

  const action = async (id, endpoint) => {
    await api.patch(`/orders/${id}/${endpoint}`)
    fetchOrders()
  }

  const complete = async (id) => {
    setError('')
    setCompleting(id)
    try {
      await api.patch(`/orders/${id}/complete`, { confirmationPin: pin[id] })
      setPin(p => ({ ...p, [id]: '' }))
      fetchOrders()
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid PIN.')
    }
    setCompleting(null)
  }

  const FILTERS = ['all', 'pending', 'accepted', 'delivered', 'completed', 'cancelled']
  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100 }}>
      <div className="fade-up" style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 26, fontWeight: 400 }}>Orders</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>{orders.length} total orders</p>
      </div>

      <div className="fade-up" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
            background: filter === f ? statusColor(f) + '22' : 'var(--bg2)',
            color: filter === f ? statusColor(f) : 'var(--muted)',
            border: `1px solid ${filter === f ? statusColor(f) + '66' : 'var(--border)'}`,
            textTransform: 'capitalize', cursor: 'pointer', transition: 'all 0.15s'
          }}>{f}</button>
        ))}
      </div>

      {error && (
        <div style={{ background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 8, padding: '10px 16px', marginBottom: 16, color: 'var(--red)', fontSize: 13 }}>
          {error}
        </div>
      )}

      <div className="fade-up-2" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', background: 'var(--bg2)', borderRadius: 12, border: '1px solid var(--border)' }}>No orders found.</div>
        ) : filtered.map(o => (
          <div key={o._id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>{o.product?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {o.quantity} {o.product?.unit} · ₹{o.totalAmount} · {o.deliveryMode?.replace(/_/g, ' ')}
                </div>
              </div>
              <Badge status={o.status} />
            </div>

            <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12 }}>
              <span style={{ color: 'var(--muted)' }}>Consumer: </span>
              <span style={{ color: 'var(--text)' }}>{o.consumer?.name}</span>
              <span style={{ color: 'var(--muted)', margin: '0 8px' }}>·</span>
              <span style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{o.consumer?.phone}</span>
              {o.deliveryAddress && <>
                <span style={{ color: 'var(--muted)', margin: '0 8px' }}>·</span>
                <span style={{ color: 'var(--muted)' }}>{o.deliveryAddress}</span>
              </>}
            </div>

            {o.deliveryMode === 'self_pickup' && o.pickupCode && ['accepted','ready'].includes(o.status) && (
              <div style={{ background: 'var(--green-dim)', border: '1px solid var(--green)44', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12 }}>
                🔑 Pickup Code: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--green)', fontSize: 14, fontWeight: 600 }}>{o.pickupCode}</span>
                <span style={{ color: 'var(--muted)', marginLeft: 8 }}>— share with consumer at pickup</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {o.status === 'pending' && (
                <>
                  <button onClick={() => action(o._id, 'accept')} style={{ padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 500, background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid var(--green)44', cursor: 'pointer' }}>✓ Accept</button>
                  <button onClick={() => action(o._id, 'cancel')} style={{ padding: '7px 16px', borderRadius: 8, fontSize: 12, background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid var(--red)44', cursor: 'pointer' }}>✗ Decline</button>
                </>
              )}
              {o.status === 'accepted' && (
                <button onClick={() => action(o._id, 'ready')} style={{ padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 500, background: 'var(--blue-dim)', color: 'var(--blue)', border: '1px solid var(--blue)44', cursor: 'pointer' }}>Mark Ready</button>
              )}
              {o.status === 'ready' && (
                <button onClick={() => action(o._id, 'deliver')} style={{ padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 500, background: 'var(--blue-dim)', color: 'var(--blue)', border: '1px solid var(--blue)44', cursor: 'pointer' }}>Mark Delivered</button>
              )}
              {o.status === 'delivered' && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    placeholder="Enter consumer PIN"
                    value={pin[o._id] || ''}
                    onChange={e => setPin(p => ({ ...p, [o._id]: e.target.value }))}
                    style={{ padding: '7px 12px', borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 13, outline: 'none', width: 180, fontFamily: 'var(--font-mono)' }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                  <button onClick={() => complete(o._id)} disabled={completing === o._id} style={{ padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 500, background: 'var(--accent)', color: '#0d1117', border: 'none', cursor: 'pointer', opacity: completing === o._id ? 0.7 : 1 }}>
                    {completing === o._id ? 'Verifying...' : '✓ Complete Order'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}