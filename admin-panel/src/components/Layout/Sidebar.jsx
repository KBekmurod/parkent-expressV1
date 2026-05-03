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
      {/* Logo header */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #E62B00 0%, #FF8C00 100%)' }}
          >
            <img src="/icons/logo-white.svg" alt="PE" className="w-7 h-7 object-contain" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-black text-sm" style={{ color: '#0C1E3E', letterSpacing: '0.07em' }}>
              PARKENT
            </span>
            <span className="font-black text-sm" style={{ color: '#E62B00', letterSpacing: '0.07em' }}>
              EXPRESS
            </span>
            <span className="text-xs text-gray-400 font-normal mt-0.5">Admin Panel</span>
          </div>
        </div>
      </div>

      <nav className="p-3 flex-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => clearBadge(item.path)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl mb-0.5 transition-all text-sm ${
                isActive
                  ? 'font-semibold text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
            style={({ isActive }) => isActive ? {
              background: 'linear-gradient(135deg, #E62B00 0%, #FF8C00 100%)',
              boxShadow: '0 3px 10px rgba(230,43,0,0.28)',
            } : {}}
          >
            <item.icon size={18} />
            <span className="flex-1">{item.label}</span>
            {item.badge > 0 && (
              <span className="bg-white text-red-600 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
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
