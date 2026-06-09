import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Orders from './pages/Orders'

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fl_farmer_user')) } catch { return null }
  })

  const handleLogin = (u) => setUser(u)

  if (!user) return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onLogin={handleLogin} />} />
        <Route path="*"         element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )

  return (
    <BrowserRouter>
      <Layout user={user}>
        <Routes>
          <Route path="/"         element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/orders"   element={<Orders />} />
          <Route path="*"         element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}