import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Marketplace from './pages/Marketplace'
import Orders from './pages/Orders'

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fl_consumer_user')) } catch { return null }
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
          <Route path="/"       element={<Marketplace />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="*"       element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}