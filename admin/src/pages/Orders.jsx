/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from 'react'
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
    border: `1px solid ${statusColor(status)}44`, textTransform: 'capitalize', whiteSpace: 'nowrap'
  }}>{status?.replace(/_/g, ' ')}</span>
)

const payColor = s => ({ held: 'var(--amber)', released: 'var(--green)', refunded: 'var(--red)', pending: 'var(--muted)' }[s] || 'var(--muted)')

const STATUSES = ['all', 'pending', 'accepted', 'ready', 'delivered', 'completed', 'cancelled', 'disputed']

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    const params = new URLSearchParams({ page, limit: 15, ...(status !== 'all' && { status }) })
    const { data } = await api.get(`/admin/orders?${params}`)
    setOrders(data.orders)
    setTotal(data.total)
    setLoading(false)
  }, [status, page])

  useEffect(() => { setPage(1) }, [status])
  useEffect(() => { fetchOrders() }, [fetchOrders])

  const dispute = async (id) => {
    if (!confirm('Flag this order as disputed?')) return
    await api.patch(`/admin/orders/${id}/dispute`)
    fetchOrders()
  }

  const totalPages = Math.ceil(total / 15)

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1200 }}>
      <div className="fade-up" style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 26, fontWeight: 400 }}>Orders</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>{total} total orders</p>
      </div>

      <div className="fade-up" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setStatus(s)} style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
            background: status === s ? statusColor(s) + '22' : 'var(--bg2)',
            color: status === s ? statusColor(s) : 'var(--muted)',
            border: `1px solid ${status === s ? statusColor(s) + '66' : 'var(--border)'}`,
            textTransform: 'capitalize', transition: 'all 0.15s', cursor: 'pointer'
          }}>{s}</button>
        ))}
      </div>

      <div className="fade-up-2" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No orders found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border2)' }}>
                {['Product', 'Consumer', 'Farmer', 'Qty', 'Amount', 'Payment', 'Mode', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id} style={{ borderBottom: '1px solid var(--border2)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>{o.product?.name || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--muted)' }}>
                    {o.consumer?.name}<br />
                    <span style={{ fontSize: 11 }}>{o.consumer?.phone}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--muted)' }}>{o.farmer?.farmName || o.farmer?.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: 'var(--font-mono)' }}>{o.quantity} {o.product?.unit}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: 'var(--font-mono)' }}>₹{o.totalAmount}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, color: payColor(o.paymentStatus), textTransform: 'capitalize' }}>{o.paymentStatus}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 11, color: 'var(--muted)', textTransform: 'capitalize' }}>{o.deliveryMode?.replace(/_/g, ' ')}</td>
                  <td style={{ padding: '12px 16px' }}><Badge status={o.status} /></td>
                  <td style={{ padding: '12px 16px' }}>
                    {!['completed', 'cancelled', 'disputed'].includes(o.status) && (
                      <button onClick={() => dispute(o._id)} style={{
                        padding: '4px 10px', borderRadius: 6, fontSize: 11,
                        background: 'var(--red-dim)', color: 'var(--red)',
                        border: '1px solid var(--red)44', cursor: 'pointer'
                      }}>Flag</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border2)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '5px 12px', borderRadius: 6, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 12, cursor: 'pointer', opacity: page === 1 ? 0.4 : 1 }}>← Prev</button>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '5px 12px', borderRadius: 6, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 12, cursor: 'pointer', opacity: page === totalPages ? 0.4 : 1 }}>Next →</button>
          </div>
        )}
      </div>
    </div>
  )
}