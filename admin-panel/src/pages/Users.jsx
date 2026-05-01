import { useState, useEffect } from 'react'
import { userService } from '../services/userService'
import Table from '../components/common/Table'
import Pagination from '../components/common/Pagination'
import SearchBar from '../components/common/SearchBar'
import FilterDropdown from '../components/common/FilterDropdown'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { formatDate } from '../utils/helpers'
import toast from 'react-hot-toast'
import { ShieldOff, ShieldCheck, Phone, MessageCircle } from 'lucide-react'

const STATUS_BADGE = {
  active: 'bg-green-100 text-green-700',
  blocked: 'bg-red-100 text-red-700',
}

const AUTH_BADGE = {
  telegram: 'bg-blue-100 text-blue-700',
  web: 'bg-purple-100 text-purple-700',
}

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleteUser, setDeleteUser] = useState(null)

  useEffect(() => { loadUsers() }, [currentPage, search, statusFilter])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await userService.getUsers({
        page: currentPage, limit: 15, search, status: statusFilter
      })
      // Response: data.data.users yoki data.users
      setUsers(data.data?.users || data.users || [])
      setTotalPages(data.pages || data.data?.pages || 1)
    } catch {
      toast.error('Foydalanuvchilarni yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleBlock = async (user) => {
    try {
      if (user.status === 'blocked') {
        await userService.unblockUser(user._id)
        toast.success('Foydalanuvchi blokdan chiqarildi')
      } else {
        await userService.blockUser(user._id)
        toast.success('Foydalanuvchi bloklandi')
      }
      loadUsers()
    } catch {
      toast.error('Xatolik yuz berdi')
    }
  }

  const handleDelete = async () => {
    try {
      await userService.deleteUser(deleteUser._id)
      toast.success("Foydalanuvchi o'chirildi")
      setDeleteUser(null)
      loadUsers()
    } catch {
      toast.error("O'chirishda xatolik")
    }
  }

  const columns = [
    {
      key: 'name', label: 'Ism',
      render: row => (
        <div>
          <p className="font-medium text-gray-900">{row.firstName} {row.lastName || ''}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${AUTH_BADGE[row.authType] || 'bg-gray-100 text-gray-600'}`}>
              {row.authType === 'telegram' ? '✈️ Telegram' : '🌐 Web'}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'phone', label: 'Telefon',
      render: row => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Phone size={13} />
          {row.phone || '—'}
        </div>
      )
    },
    {
      key: 'telegramId', label: 'Telegram ID',
      render: row => row.telegramId ? (
        <span className="font-mono text-xs text-gray-500">{row.telegramId}</span>
      ) : '—'
    },
    {
      key: 'totalOrders', label: 'Buyurtmalar',
      render: row => (
        <span className="font-medium text-gray-700">{row.totalOrders || 0}</span>
      )
    },
    {
      key: 'status', label: 'Holat',
      render: row => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[row.status] || 'bg-gray-100 text-gray-600'}`}>
          {row.status === 'blocked' ? '🚫 Bloklangan' : '✅ Faol'}
        </span>
      )
    },
    { key: 'createdAt', label: "Qo'shilgan", render: row => formatDate(row.createdAt) },
    {
      key: 'actions', label: '',
      render: row => (
        <button
          onClick={() => handleToggleBlock(row)}
          className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-colors ${
            row.status === 'blocked'
              ? 'bg-green-50 text-green-600 hover:bg-green-100'
              : 'bg-red-50 text-red-500 hover:bg-red-100'
          }`}
        >
          {row.status === 'blocked'
            ? <><ShieldCheck size={13} /> Blokni ochish</>
            : <><ShieldOff size={13} /> Bloklash</>
          }
        </button>
      )
    }
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Users Management</h1>
          <p className="text-gray-500 text-sm mt-1">Barcha foydalanuvchilar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Ism, telefon qidirish..." />
        <FilterDropdown
          label="Holat"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'active', label: '✅ Faol' },
            { value: 'blocked', label: '🚫 Bloklangan' },
          ]}
        />
      </div>

      <Table
        columns={columns}
        data={users}
        loading={loading}
        onDelete={row => setDeleteUser(row)}
      />

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}

      <ConfirmDialog
        isOpen={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={handleDelete}
        title="Foydalanuvchini o'chirish"
        message={`${deleteUser?.firstName} ${deleteUser?.lastName || ''} ni o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.`}
      />
    </div>
  )
}

export default Users
