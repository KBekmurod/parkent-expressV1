import { useState, useEffect } from 'react'
import { authService } from '../services/authService'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Bell, Lock, User, Send } from 'lucide-react'
import api from '../services/api'

const Settings = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    telegramId: '',
    notifications: {
      newVendor: true,
      newDriver: true,
      newOrder: false,
      systemAlerts: true,
    }
  })
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [loadingPass, setLoadingPass] = useState(false)
  const [testSending, setTestSending] = useState(false)

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        telegramId: user.telegramId || '',
        notifications: user.notifications || {
          newVendor: true,
          newDriver: true,
          newOrder: false,
          systemAlerts: true,
        }
      })
    }
  }, [user])

  const handleProfileSave = async () => {
    setLoading(true)
    try {
      await api.put('/auth/profile', {
        firstName: profile.firstName,
        lastName: profile.lastName,
        telegramId: profile.telegramId,
        notifications: profile.notifications,
      })
      toast.success('Profil saqlandi!')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSave = async () => {
    if (!passwords.current || !passwords.newPass) {
      toast.error('Joriy va yangi parolni kiriting')
      return
    }
    if (passwords.newPass !== passwords.confirm) {
      toast.error('Yangi parollar mos kelmaydi')
      return
    }
    if (passwords.newPass.length < 6) {
      toast.error('Parol kamida 6 ta belgidan iborat bo\'lishi kerak')
      return
    }
    setLoadingPass(true)
    try {
      await api.put('/auth/password', {
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
      })
      toast.success('Parol muvaffaqiyatli yangilandi!')
      setPasswords({ current: '', newPass: '', confirm: '' })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Parolni yangilashda xatolik')
    } finally {
      setLoadingPass(false)
    }
  }

  const handleTestNotification = async () => {
    if (!profile.telegramId) {
      toast.error('Avval Telegram ID kiriting va saqlang')
      return
    }
    setTestSending(true)
    try {
      await api.post('/admin/test-notification')
      toast.success('Test xabar yuborildi! Telegramni tekshiring.')
    } catch (err) {
      toast.error('Test xabar yuborilmadi. Telegram ID to\'g\'riligini tekshiring.')
    } finally {
      setTestSending(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Sozlamalar</h1>

      {/* Profil */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-5">
          <User size={22} className="text-primary-600" />
          <h2 className="text-lg font-semibold">Profil ma'lumotlari</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ism</label>
              <input
                type="text"
                value={profile.firstName}
                onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Familiya</label>
              <input
                type="text"
                value={profile.lastName}
                onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telegram ID
              <span className="ml-2 text-xs text-gray-400 font-normal">
                (Bildirishnomalar olish uchun)
              </span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={profile.telegramId}
                onChange={e => setProfile(p => ({ ...p, telegramId: e.target.value }))}
                className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Masalan: 123456789"
              />
              <button
                onClick={handleTestNotification}
                disabled={testSending || !profile.telegramId}
                className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-40 flex items-center gap-1 text-sm"
                title="Test xabar yuborish"
              >
                <Send size={16} />
                Test
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Telegram ID'ni bilish uchun @userinfobot ga /start yuboring
            </p>
          </div>

          <button
            onClick={handleProfileSave}
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </div>

      {/* Bildirishnomalar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-5">
          <Bell size={22} className="text-primary-600" />
          <h2 className="text-lg font-semibold">Telegram bildirishnomalar</h2>
        </div>

        <div className="space-y-3">
          {[
            { key: 'newVendor', label: '🏪 Yangi restoran ariza berganda' },
            { key: 'newDriver', label: '🚴 Yangi kuryer ariza berganda' },
            { key: 'newOrder', label: '📦 Har bir yangi buyurtmada' },
            { key: 'systemAlerts', label: '⚙️ Tizim xabarlari' },
          ].map(item => (
            <label key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
              <span className="text-sm text-gray-700">{item.label}</span>
              <input
                type="checkbox"
                checked={profile.notifications[item.key]}
                onChange={e => setProfile(p => ({
                  ...p,
                  notifications: { ...p.notifications, [item.key]: e.target.checked }
                }))}
                className="w-4 h-4 text-primary-600"
              />
            </label>
          ))}
        </div>

        <button
          onClick={handleProfileSave}
          disabled={loading}
          className="w-full mt-4 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium"
        >
          {loading ? 'Saqlanmoqda...' : 'Sozlamalarni saqlash'}
        </button>
      </div>

      {/* Parol */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-5">
          <Lock size={22} className="text-primary-600" />
          <h2 className="text-lg font-semibold">Parolni o'zgartirish</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Joriy parol</label>
            <input
              type="password"
              value={passwords.current}
              onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Yangi parol</label>
            <input
              type="password"
              value={passwords.newPass}
              onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Yangi parolni tasdiqlash</label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            onClick={handlePasswordSave}
            disabled={loadingPass}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
          >
            {loadingPass ? 'Yangilanmoqda...' : 'Parolni yangilash'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings
