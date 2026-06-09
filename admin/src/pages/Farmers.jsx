/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from 'react'
import api from '../api'

const Badge = ({ verified }) => (
  <span style={{
    display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 11,
    background: verified ? 'var(--green-dim)' : 'var(--amber-dim)',
    color: verified ? 'var(--green)' : 'var(--amber)',
    border: `1px solid ${verified ? 'var(--green)' : 'var(--amber)'}44`
  }}>{verified ? 'Verified' : 'Pending'}</span>
)

export default function Farmers() {
  const [farmers, setFarmers] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(null)

  const fetchFarmers = useCallback(async () => {
    const params = filter === 'pending' ? '?verified=false' : filter === 'verified' ? '?verified=true' : ''
    const { data } = await api.get(`/admin/farmers${params}`)
    setFarmers(data.farmers)
    setLoading(false)
  }, [filter])

  useEffect(() => {
    fetchFarmers()
  }, [fetchFarmers])

  const verify = async (id, name) => {
    if (!confirm(`Verify ${name} as a FarmLink farmer?`)) return
    setVerifying(id)
    await api.patch(`/admin/farmers/${id}/verify`)
    fetchFarmers()
    setVerifying(null)
  }

  const toggle = async (id, name, active) => {
    if (!confirm(`${active ? 'Deactivate' : 'Activate'} ${name}?`)) return
    await api.patch(`/admin/users/${id}/toggle`)
    fetchFarmers()
  }

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100 }}>
      <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 26, fontWeight: 400 }}>Farmers</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>Verify and manage farmer accounts</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'pending', 'verified'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 500,
              background: filter === f ? 'var(--accent)' : 'var(--bg2)',
              color: filter === f ? '#0d1117' : 'var(--muted)',
              border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--border)'}`,
              textTransform: 'capitalize', transition: 'all 0.15s'
            }}>{f}</button>
          ))}
        </div>
      </div>

      <div className="fade-up-2" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>
        ) : farmers.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No farmers found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border2)' }}>
                {['Farmer', 'Farm', 'Phone', 'Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {farmers.map(f => (
                <tr key={f._id} style={{ borderBottom: '1px solid var(--border2)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{f.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{f.email}</div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--muted)' }}>{f.farmName || '—'}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{f.phone}</td>
                  <td style={{ padding: '14px 20px', fontSize: 12, color: 'var(--muted)' }}>{new Date(f.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '14px 20px' }}><Badge verified={f.isVerified} /></td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {!f.isVerified && (
                        <button onClick={() => verify(f._id, f.name)} disabled={verifying === f._id} style={{
                          padding: '5px 12px', borderRadius: 6, fontSize: 12,
                          background: 'var(--green-dim)', color: 'var(--green)',
                          border: '1px solid var(--green)44', cursor: 'pointer',
                          opacity: verifying === f._id ? 0.6 : 1
                        }}>
                          {verifying === f._id ? 'Verifying...' : '✓ Verify'}
                        </button>
                      )}
                      <button onClick={() => toggle(f._id, f.name, f.isActive)} style={{
                        padding: '5px 12px', borderRadius: 6, fontSize: 12,
                        background: f.isActive ? 'var(--red-dim)' : 'var(--bg3)',
                        color: f.isActive ? 'var(--red)' : 'var(--muted)',
                        border: `1px solid ${f.isActive ? 'var(--red)' : 'var(--border)'}44`, cursor: 'pointer'
                      }}>
                        {f.isActive ? 'Deactivate' : 'Activate'}
                      </button>
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