import { useEffect, useState } from 'react'
import api from '../api'

const CATEGORIES = ['vegetables', 'fruits', 'grains', 'dairy', 'poultry', 'other']
const UNITS = ['kg', 'g', 'litre', 'piece', 'dozen']

const empty = { name: '', category: 'vegetables', description: '', pricePerUnit: '', unit: 'kg', quantityAvailable: '', images: [] }

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const user = JSON.parse(localStorage.getItem('fl_farmer_user') || '{}')

  const fetchProducts = async () => {
    const { data } = await api.get('/products/my')
    setProducts(data.products)
    setLoading(false)
  }

  useEffect(() => {
    let active = true
    api.get('/products/my').then(({ data }) => {
      if (active) {
        setProducts(data.products)
        setLoading(false)
      }
    })
    return () => { active = false }
  }, [])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const uploadImage = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('image', file)
    try {
      const { data } = await api.post('/upload/product', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setForm(f => ({ ...f, images: [...f.images, data.url] }))
    } catch (err) {
      setError('Image upload failed.')
    }
  }

  const removeImage = (url) => {
    setForm(f => ({ ...f, images: f.images.filter(i => i !== url) }))
  }

  const openAdd = () => { setForm(empty); setEditing(null); setShowForm(true); setError('') }
  const openEdit = p => {
    setForm({ name: p.name, category: p.category, description: p.description || '', pricePerUnit: p.pricePerUnit, unit: p.unit, quantityAvailable: p.quantityAvailable, images: p.images || [] })
    setEditing(p._id)
    setShowForm(true)
    setError('')
  }

  const save = async e => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editing) {
        await api.put(`/products/${editing}`, form)
      } else {
        await api.post('/products', form)
      }
      setShowForm(false)
      fetchProducts()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product.')
    }
    setSaving(false)
  }

  const remove = async (id, name) => {
    if (!confirm(`Remove ${name}?`)) return
    await api.delete(`/products/${id}`)
    fetchProducts()
  }

  const toggle = async (id, current) => {
    await api.put(`/products/${id}`, { isAvailable: !current })
    fetchProducts()
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', background: 'var(--bg3)',
    border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)',
    fontSize: 13, outline: 'none'
  }

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1000 }}>
      <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 26, fontWeight: 400 }}>My Products</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>Manage your crop listings</p>
        </div>
        {user.isVerified && (
          <button onClick={openAdd} style={{
            padding: '9px 20px', background: 'var(--accent)', border: 'none',
            borderRadius: 8, color: '#0d1117', fontSize: 13, fontWeight: 600
          }}>+ Add Product</button>
        )}
      </div>

      {!user.isVerified && (
        <div style={{ background: 'var(--amber-dim)', border: '1px solid var(--amber)44', borderRadius: 10, padding: '14px 20px', marginBottom: 24, color: 'var(--amber)', fontSize: 13 }}>
          ⏳ Awaiting admin verification before you can list products.
        </div>
      )}

      {showForm && (
        <div className="fade-up" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 20 }}>{editing ? 'Edit Product' : 'Add New Product'}</div>
          <form onSubmit={save}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>

              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Product Name</label>
                <input style={inputStyle} value={form.name} onChange={set('name')} required placeholder="e.g. Tomatoes"
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Category</label>
                <select style={inputStyle} value={form.category} onChange={set('category')}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Price per Unit (₹)</label>
                <input style={inputStyle} type="number" value={form.pricePerUnit} onChange={set('pricePerUnit')} required placeholder="0"
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Unit</label>
                <select style={inputStyle} value={form.unit} onChange={set('unit')}>
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quantity Available</label>
                <input style={inputStyle} type="number" value={form.quantityAvailable} onChange={set('quantityAvailable')} required placeholder="0"
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Description</label>
                <input style={inputStyle} value={form.description} onChange={set('description')} placeholder="Optional"
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Product Images</label>
                <input type="file" accept="image/*" onChange={uploadImage} style={{ display: 'none' }} id="img-upload" />
                <label htmlFor="img-upload" style={{
                  display: 'inline-block', padding: '7px 16px', borderRadius: 8, fontSize: 12,
                  background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--muted)',
                  cursor: 'pointer', marginBottom: 10
                }}>+ Upload Image</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {form.images.map((url, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={url} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                      <button type="button" onClick={() => removeImage(url)} style={{
                        position: 'absolute', top: -6, right: -6, width: 20, height: 20,
                        borderRadius: '50%', background: 'var(--red)', border: 'none',
                        color: 'white', fontSize: 11, cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center'
                      }}>×</button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {error && (
              <div style={{ background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, color: 'var(--red)', fontSize: 13 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={saving} style={{
                padding: '9px 24px', background: 'var(--accent)', border: 'none',
                borderRadius: 8, color: '#0d1117', fontSize: 13, fontWeight: 600,
                opacity: saving ? 0.7 : 1
              }}>{saving ? 'Saving...' : editing ? 'Update' : 'Add Product'}</button>
              <button type="button" onClick={() => setShowForm(false)} style={{
                padding: '9px 20px', background: 'transparent', border: '1px solid var(--border)',
                borderRadius: 8, color: 'var(--muted)', fontSize: 13
              }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="fade-up-2" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>
        ) : products.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
            No products yet.{user.isVerified ? ' Click "Add Product" to get started.' : ''}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border2)' }}>
                {['Image', 'Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id} style={{ borderBottom: '1px solid var(--border2)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 20px' }}>
                    {p.images?.[0]
                      ? <img src={p.images[0]} alt={p.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                      : <div style={{ width: 48, height: 48, borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🌾</div>
                    }
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
                    {p.description && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.description}</div>}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 12, color: 'var(--muted)', textTransform: 'capitalize' }}>{p.category}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, fontFamily: 'var(--font-mono)' }}>₹{p.pricePerUnit}/{p.unit}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, fontFamily: 'var(--font-mono)', color: p.quantityAvailable < 10 ? 'var(--red)' : 'var(--text)' }}>{p.quantityAvailable} {p.unit}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      fontSize: 11, padding: '2px 10px', borderRadius: 20,
                      background: p.isAvailable ? 'var(--green-dim)' : 'var(--bg3)',
                      color: p.isAvailable ? 'var(--green)' : 'var(--muted)',
                      border: `1px solid ${p.isAvailable ? 'var(--green)' : 'var(--border)'}44`
                    }}>{p.isAvailable ? 'Listed' : 'Hidden'}</span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEdit(p)} style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12, background: 'var(--blue-dim)', color: 'var(--blue)', border: '1px solid var(--blue)44', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => toggle(p._id, p.isAvailable)} style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12, background: 'var(--bg3)', color: 'var(--muted)', border: '1px solid var(--border)44', cursor: 'pointer' }}>
                        {p.isAvailable ? 'Hide' : 'Show'}
                      </button>
                      <button onClick={() => remove(p._id, p.name)} style={{ padding: '5px 12px', borderRadius: 6, fontSize: 12, background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid var(--red)44', cursor: 'pointer' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}