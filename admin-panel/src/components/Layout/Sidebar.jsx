import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Truck, 
  ShoppingBag, 
  Package,
  CreditCard,
  DollarSign,
  BarChart3,
  FileText,
  Settings 
} from 'lucide-react'

const Sidebar = () => {
  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/vendors', icon: Store, label: 'Vendors' },
    { path: '/drivers', icon: Truck, label: 'Drivers' },
    { path: '/orders', icon: ShoppingBag, label: 'Orders' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/card-payments', icon: CreditCard, label: 'Card Payments' },
    { path: '/settlements', icon: DollarSign, label: 'Settlements' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/reports', icon: FileText, label: 'Reports' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-primary-600">Parkent Express</h1>
        <p className="text-sm text-gray-500">Admin Panel</p>
      </div>
      
      <nav className="p-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar
