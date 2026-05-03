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
    <header className="bg-white px-6 py-3.5 flex items-center justify-between"
      style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <h2 className="text-base font-semibold" style={{ color: '#0C1E3E' }}>
        Xush kelibsiz! 👋
      </h2>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #E62B00, #FF8C00)' }}
          >
            <User size={13} className="text-white" />
          </div>
          <span className="text-sm font-medium" style={{ color: '#0C1E3E' }}>{user?.email || 'Admin'}</span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors text-gray-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={16} />
          <span>Chiqish</span>
        </button>
      </div>
    </header>
  )
}

export default Header
