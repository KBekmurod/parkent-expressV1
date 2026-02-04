import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Vendors from './pages/Vendors'
import Drivers from './pages/Drivers'
import Orders from './pages/Orders'
import Products from './pages/Products'
import Settings from './pages/Settings'
import Analytics from './pages/Analytics'
import Reports from './pages/Reports'
import CardPaymentsPage from './pages/CardPayments/CardPaymentsPage'
import SettlementsPage from './pages/Settlements/SettlementsPage'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="orders" element={<Orders />} />
          <Route path="products" element={<Products />} />
          <Route path="card-payments" element={<CardPaymentsPage />} />
          <Route path="settlements" element={<SettlementsPage />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
