import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'

const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white shadow-sm px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Welcome back!</h2>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User size={20} className="text-gray-600" />
            <span className="text-sm text-gray-600">{user?.email || 'Admin'}</span>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
