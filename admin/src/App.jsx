import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Farmers from './pages/Farmers'
import Orders from './pages/Orders'
import Logistics from './pages/Logistics'

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fl_user')) } catch { return null }
  })

  const handleLogin = (u) => setUser(u)

  if (!user) return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Login onLogin={handleLogin} />} />
      </Routes>
    </BrowserRouter>
  )

  return (
    <BrowserRouter>
      <Layout user={user}>
        <Routes>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/farmers"   element={<Farmers />} />
          <Route path="/orders"    element={<Orders />} />
          <Route path="/logistics" element={<Logistics />} />
          <Route path="*"          element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}