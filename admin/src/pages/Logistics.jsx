import { useEffect, useState } from 'react'
import api from '../api'

export default function Logistics() {
  const [status, setStatus] = useState(null)

  useEffect(() => {
    api.get('/admin/logistics/status').then(r => setStatus(r.data))
  }, [])

  return (
    <div style={{ padding: '32px 36px', maxWidth: 700 }}>
      <div className="fade-up" style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 26, fontWeight: 400 }}>Logistics</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>Delivery system configuration</p>
      </div>

      <div className="fade-up-2" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Current Phase</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Active logistics mode</div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px',
            borderRadius: 24, background: status?.logisticsEnterpriseEnabled ? 'var(--blue-dim)' : 'var(--green-dim)',
            border: `1px solid ${status?.logisticsEnterpriseEnabled ? 'var(--blue)' : 'var(--green)'}44`
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: status?.logisticsEnterpriseEnabled ? 'var(--blue)' : 'var(--green)', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: status?.logisticsEnterpriseEnabled ? 'var(--blue)' : 'var(--green)' }}>
              Phase {status?.logisticsEnterpriseEnabled ? '2 — Enterprise' : '1 — Manual'}
            </span>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border2)', paddingTop: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Available modes</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { mode: 'self_pickup', label: 'Self Pickup', desc: 'Consumer visits farm with verification code', always: true },
              { mode: 'farmer_delivery', label: 'Farmer Delivery', desc: 'Farmer arranges local delivery, confirmed by PIN', always: true },
              { mode: 'enterprise_courier', label: 'Enterprise Courier', desc: 'Ekart / Amazon Logistics — auto label + tracking', always: false },
            ].map(({ mode, label, desc, always }) => {
              const active = always || status?.logisticsEnterpriseEnabled
              return (
                <div key={mode} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', borderRadius: 10,
                  background: active ? 'var(--bg3)' : 'var(--bg)',
                  border: `1px solid ${active ? 'var(--border)' : 'var(--border2)'}`,
                  opacity: active ? 1 : 0.5
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{desc}</div>
                  </div>
                  <span style={{
                    fontSize: 11, padding: '3px 10px', borderRadius: 20,
                    background: active ? 'var(--green-dim)' : 'var(--bg2)',
                    color: active ? 'var(--green)' : 'var(--muted)',
                    border: `1px solid ${active ? 'var(--green)' : 'var(--border)'}44`
                  }}>{active ? 'Active' : 'Inactive'}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {!status?.logisticsEnterpriseEnabled && (
        <div className="fade-up-3" style={{ background: 'var(--blue-dim)', border: '1px solid var(--blue)33', borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--blue)', marginBottom: 12 }}>🔀 How to activate Phase 2</div>
          <ol style={{ paddingLeft: 18, color: 'var(--muted)', fontSize: 13, lineHeight: 2 }}>
            <li>Open <code style={{ background: 'var(--bg)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>server/.env</code></li>
            <li>Set <code style={{ background: 'var(--bg)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>LOGISTICS_ENTERPRISE_ENABLED=true</code></li>
            <li>Add your <code style={{ background: 'var(--bg)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>EKART_API_KEY</code> or <code style={{ background: 'var(--bg)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>AMAZON_LOGISTICS_API_KEY</code></li>
            <li>Plug in the real SDK in <code style={{ background: 'var(--bg)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>orderController.js → requestEnterpriseCourier()</code></li>
            <li>Restart the server — enterprise courier becomes available at checkout</li>
          </ol>
        </div>
      )}
    </div>
  )
}