import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(email, password)
      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #E62B00 0%, #FF8C00 100%)' }}>

      {/* Splash fon logo */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <img src="/icons/logo-white.svg" alt="" className="w-96 h-96 object-contain" />
      </div>

      <div className="relative w-full max-w-sm mx-4">
        {/* Logo blok */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center shadow-xl">
            <img src="/icons/logo-white.svg" alt="Parkent Express" className="w-14 h-14 object-contain" />
          </div>
          <div className="text-center">
            <h1 className="text-white font-black text-2xl tracking-widest leading-tight">PARKENT</h1>
            <h1 className="text-white/90 font-black text-2xl tracking-widest leading-tight">EXPRESS</h1>
            <p className="text-white/60 text-sm mt-1 italic">Admin Panel</p>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-xl font-bold mb-6 text-center" style={{ color: '#0C1E3E' }}>
            Tizimga kirish
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#0C1E3E' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="admin@parkentexpress.uz"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#0C1E3E' }}>
                Parol
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 py-3 rounded-xl font-bold text-base"
            >
              {loading ? 'Yuklanmoqda...' : 'Kirish'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
