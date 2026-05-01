import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Users, Store, Truck, ShoppingBag,
  Package, CreditCard, DollarSign, BarChart3, FileText, Settings
} from 'lucide-react'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://parkent-express.duckdns.org'

const Sidebar = () => {
  const [badges, setBadges] = useState({ vendors: 0, drivers: 0, orders: 0 })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
    })

    socket.on('vendor:new_registration', () => {
      setBadges(b => ({ ...b, vendors: b.vendors + 1 }))
    })
    socket.on('driver:new_registration', () => {
      setBadges(b => ({ ...b, drivers: b.drivers + 1 }))
    })
    socket.on('order:new', () => {
      setBadges(b => ({ ...b, orders: b.orders + 1 }))
    })

    return () => socket.disconnect()
  }, [])

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/users', icon: Users, label: 'Foydalanuvchilar' },
    { path: '/vendors', icon: Store, label: 'Restoranlar', badge: badges.vendors },
    { path: '/drivers', icon: Truck, label: 'Kuryerlar', badge: badges.drivers },
    { path: '/orders', icon: ShoppingBag, label: 'Buyurtmalar', badge: badges.orders },
    { path: '/products', icon: Package, label: 'Mahsulotlar' },
    { path: '/card-payments', icon: CreditCard, label: 'Karta to\'lovlar' },
    { path: '/settlements', icon: DollarSign, label: 'Hisob-kitob' },
    { path: '/analytics', icon: BarChart3, label: 'Analitika' },
    { path: '/reports', icon: FileText, label: 'Hisobotlar' },
    { path: '/settings', icon: Settings, label: 'Sozlamalar' },
  ]

  const clearBadge = (path) => {
    if (path === '/vendors') setBadges(b => ({ ...b, vendors: 0 }))
    if (path === '/drivers') setBadges(b => ({ ...b, drivers: 0 }))
    if (path === '/orders') setBadges(b => ({ ...b, orders: 0 }))
  }

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-primary-600">Parkent Express</h1>
        <p className="text-sm text-gray-500">Admin Panel</p>
      </div>

      <nav className="p-4 flex-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => clearBadge(item.path)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <item.icon size={20} />
            <span className="flex-1">{item.label}</span>
            {item.badge > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar
