import { useEffect, useState } from 'react'
import api from '../api'

const CATEGORIES = ['all', 'vegetables', 'fruits', 'grains', 'dairy', 'poultry', 'other']

export default function Marketplace() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [ordering, setOrdering] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ quantity: 1, deliveryMode: 'self_pickup', deliveryAddress: '' })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.get('/products', {
      params: { ...(category !== 'all' && { category }) }
    }).then(({ data }) => {
      if (active) {
        setProducts(data.products)
        setLoading(false)
      }
    })
    return () => { active = false }
  }, [category])

  const placeOrder = async e => {
    e.preventDefault()
    setError('')
    setOrdering(selected._id)
    try {
      await api.post('/orders', {
        productId: selected._id,
        quantity: parseInt(form.quantity),
        deliveryMode: form.deliveryMode,
        deliveryAddress: form.deliveryAddress,
      })
      setSuccess(`Order placed for ${selected.name}! Check My Orders for your PIN.`)
      setSelected(null)
      setForm({ quantity: 1, deliveryMode: 'self_pickup', deliveryAddress: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order.')
    }
    setOrdering(null)
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', background: 'var(--bg3)',
    border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)',
    fontSize: 13, outline: 'none'
  }

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100 }}>
      <div className="fade-up" style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 26, fontWeight: 400 }}>Marketplace</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>Fresh produce direct from local farmers</p>
      </div>

      {success && (
        <div style={{ background: 'var(--green-dim)', border: '1px solid var(--green)44', borderRadius: 10, padding: '12px 18px', marginBottom: 20, color: 'var(--green)', fontSize: 13 }}>
          ✅ {success}
        </div>
      )}

      {/* Category filters */}
      <div className="fade-up" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)} style={{
            padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 500,
            background: category === c ? 'var(--accent)' : 'var(--bg2)',
            color: category === c ? '#0d1117' : 'var(--muted)',
            border: `1px solid ${category === c ? 'var(--accent)' : 'var(--border)'}`,
            textTransform: 'capitalize', cursor: 'pointer', transition: 'all 0.15s'
          }}>{c}</button>
        ))}
      </div>

      {/* Order form modal */}
      {selected && (
        <div style={{
          position: 'fixed', inset: 0, background: '#00000080',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="fade-up" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: 28, width: 420 }}>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>Order {selected.name}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>
              ₹{selected.pricePerUnit}/{selected.unit} · {selected.farmer?.farmName}
            </div>

            <form onSubmit={placeOrder}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quantity ({selected.unit})</label>
                <input type="number" min="1" max={selected.quantityAvailable}
                  value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                  style={inputStyle} required
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Delivery Mode</label>
                <select style={inputStyle} value={form.deliveryMode} onChange={e => setForm(f => ({ ...f, deliveryMode: e.target.value }))}>
                  <option value="self_pickup">Self Pickup</option>
                  <option value="farmer_delivery">Farmer Delivery</option>
                </select>
              </div>

              {form.deliveryMode === 'farmer_delivery' && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Delivery Address</label>
                  <input style={inputStyle} value={form.deliveryAddress}
                    onChange={e => setForm(f => ({ ...f, deliveryAddress: e.target.value }))}
                    placeholder="Your full address" required
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
              )}

              <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
                Total: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 600 }}>
                  ₹{(form.quantity * selected.pricePerUnit) || 0}
                </span>
              </div>

              {error && (
                <div style={{ background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, color: 'var(--red)', fontSize: 13 }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={!!ordering} style={{
                  flex: 1, padding: '10px', background: 'var(--accent)', border: 'none',
                  borderRadius: 8, color: '#0d1117', fontSize: 13, fontWeight: 600,
                  opacity: ordering ? 0.7 : 1
                }}>{ordering ? 'Placing...' : 'Place Order'}</button>
                <button type="button" onClick={() => { setSelected(null); setError('') }} style={{
                  padding: '10px 18px', background: 'transparent', border: '1px solid var(--border)',
                  borderRadius: 8, color: 'var(--muted)', fontSize: 13
                }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products grid */}
      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 40 }}>Loading...</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 40 }}>No products found.</div>
      ) : (
        <div className="fade-up-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {products.map(p => (
            <div key={p._id} style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 20, transition: 'border 0.15s'
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 2 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'capitalize' }}>{p.category}</div>
                </div>
                <span style={{
                  fontSize: 11, padding: '2px 10px', borderRadius: 20,
                  background: 'var(--green-dim)', color: 'var(--green)',
                  border: '1px solid var(--green)44'
                }}>In Stock</span>
              </div>

              {p.description && (
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>{p.description}</div>
              )}

              <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 2 }}>Farm</div>
                <div style={{ fontSize: 13 }}>{p.farmer?.farmName || p.farmer?.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.farmer?.farmAddress}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 18, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent)' }}>₹{p.pricePerUnit}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>per {p.unit} · {p.quantityAvailable} available</div>
                </div>
                <button onClick={() => { setSelected(p); setError(''); setSuccess('') }} style={{
                  padding: '8px 18px', background: 'var(--accent)', border: 'none',
                  borderRadius: 8, color: '#0d1117', fontSize: 13, fontWeight: 600
                }}>Buy</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}