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

  useEffect(() => {
    let active = true
    api.get('/orders/my').then(({ data }) => {
      if (active) {
        setOrders(data.orders)
        setLoading(false)
      }
    })
    return () => { active = false }
  }, [])

  return (
    <div style={{ padding: '32px 36px', maxWidth: 900 }}>
      <div className="fade-up" style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 26, fontWeight: 400 }}>My Orders</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>{orders.length} orders placed</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 40 }}>Loading...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 40, background: 'var(--bg2)', borderRadius: 12, border: '1px solid var(--border)' }}>
          No orders yet. Go to the marketplace and buy something!
        </div>
      ) : (
        <div className="fade-up-2" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(o => (
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

              {/* Farm info */}
              <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12 }}>
                <span style={{ color: 'var(--muted)' }}>Farm: </span>
                <span style={{ color: 'var(--text)' }}>{o.farmer?.farmName || o.farmer?.name}</span>
                <span style={{ color: 'var(--muted)', margin: '0 8px' }}>·</span>
                <span style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{o.farmer?.phone}</span>
              </div>

              {/* Pickup code — shown to consumer for self pickup */}
              {o.deliveryMode === 'self_pickup' && o.pickupCode && !['completed', 'cancelled'].includes(o.status) && (
                <div style={{ background: 'var(--blue-dim)', border: '1px solid var(--blue)44', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12 }}>
                  🔑 Your Pickup Code: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--blue)', fontSize: 14, fontWeight: 600 }}>{o.pickupCode}</span>
                  <span style={{ color: 'var(--muted)', marginLeft: 8 }}>— show this at the farm</span>
                </div>
              )}

              {/* Confirmation PIN — shown after delivery */}
              {o.status === 'delivered' && o.confirmationPin && (
                <div style={{ background: 'var(--green-dim)', border: '1px solid var(--green)44', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12 }}>
                  📌 Your Confirmation PIN: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--green)', fontSize: 14, fontWeight: 600 }}>{o.confirmationPin}</span>
                  <span style={{ color: 'var(--muted)', marginLeft: 8 }}>— share this with the farmer to complete order</span>
                </div>
              )}

              <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                Ordered {new Date(o.createdAt).toLocaleDateString()} · Payment: {o.paymentStatus}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}