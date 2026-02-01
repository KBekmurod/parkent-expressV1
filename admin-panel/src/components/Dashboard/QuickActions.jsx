import { useNavigate } from 'react-router-dom'
import { Plus, Users, Store, Truck, ShoppingBag } from 'lucide-react'

const QuickActions = () => {
  const navigate = useNavigate()

  const actions = [
    {
      icon: Users,
      label: 'Add User',
      color: 'bg-blue-500',
      onClick: () => navigate('/users')
    },
    {
      icon: Store,
      label: 'Add Vendor',
      color: 'bg-green-500',
      onClick: () => navigate('/vendors')
    },
    {
      icon: Truck,
      label: 'Add Driver',
      color: 'bg-purple-500',
      onClick: () => navigate('/drivers')
    },
    {
      icon: ShoppingBag,
      label: 'View Orders',
      color: 'bg-orange-500',
      onClick: () => navigate('/orders')
    },
  ]

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`${action.color} text-white p-4 rounded-lg hover:opacity-90 transition-opacity flex flex-col items-center gap-2`}
          >
            <action.icon size={24} />
            <span className="text-sm font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuickActions
