import { useState, useEffect } from 'react'
import { driverService } from '../services/driverService'
import Table from '../components/common/Table'
import Pagination from '../components/common/Pagination'
import SearchBar from '../components/common/SearchBar'
import FilterDropdown from '../components/common/FilterDropdown'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Modal from '../components/common/Modal'
import { formatDate } from '../utils/helpers'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Eye, Truck, Clock } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'https://parkent-express.duckdns.org'

// Haydovchi tafsilotlari modal
const DriverDetailModal = ({ driver, onClose, onApprove, onReject }) => {
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!driver) return null

  const handleApprove = async () => {
    setLoading(true)
    try {
      await onApprove(driver._id)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Rad etish sababini kiriting')
      return
    }
    setLoading(true)
    try {
      await onReject(driver._id, rejectReason)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            Kuryer ma'lumotlari
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Asosiy ma'lumotlar */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Ism familiya</p>
              <p className="font-semibold">{driver.firstName} {driver.lastName || ''}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Telefon</p>
              <p className="font-semibold">{driver.phone}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Transport turi</p>
              <p className="font-semibold">{driver.vehicle || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Model</p>
              <p className="font-semibold">{driver.vehicleModel || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Davlat raqami</p>
              <p className="font-semibold">{driver.plateNumber || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Ariza sanasi</p>
              <p className="font-semibold">{formatDate(driver.createdAt)}</p>
            </div>
          </div>

          {/* Hujjat rasmlari */}
          <div className="space-y-3">
            {driver.licensePhoto && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Haydovchilik guvohnomasi</p>
                <img
                  src={`${API_BASE}/${driver.licensePhoto}`}
                  alt="License"
                  className="w-full rounded-lg border object-cover max-h-48"
                  onError={e => { e.target.style.display = 'none' }}
                />
              </div>
            )}
            {driver.vehiclePhoto && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Transport rasmi</p>
                <img
                  src={`${API_BASE}/${driver.vehiclePhoto}`}
                  alt="Vehicle"
                  className="w-full rounded-lg border object-cover max-h-48"
                  onError={e => { e.target.style.display = 'none' }}
                />
              </div>
            )}
          </div>

          {/* Rad etish sababi input */}
          {showRejectInput && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Rad etish sababi *</label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Masalan: hujjatlar to'liq emas..."
              />
            </div>
          )}

          {/* Tugmalar */}
          {driver.status === 'pending' && (
            <div className="flex gap-3 pt-2">
              {!showRejectInput ? (
                <>
                  <button
                    onClick={handleApprove}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-xl hover:bg-green-700 disabled:opacity-50 font-medium"
                  >
                    <CheckCircle size={18} />
                    Tasdiqlash
                  </button>
                  <button
                    onClick={() => setShowRejectInput(true)}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 rounded-xl hover:bg-red-700 disabled:opacity-50 font-medium"
                  >
                    <XCircle size={18} />
                    Rad etish
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowRejectInput(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50 font-medium"
                  >
                    Bekor
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={loading || !rejectReason.trim()}
                    className="flex-1 bg-red-600 text-white py-2.5 rounded-xl hover:bg-red-700 disabled:opacity-50 font-medium"
                  >
                    {loading ? 'Yuborilmoqda...' : 'Rad etishni tasdiqlash'}
                  </button>
                </>
              )}
            </div>
          )}

          {driver.status === 'active' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center text-green-700 font-medium">
              ✅ Bu kuryer tasdiqlangan va faol
            </div>
          )}
          {driver.status === 'blocked' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center text-red-700 font-medium">
              ❌ Bu kuryer rad etilgan yoki bloklangan
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Asosiy sahifa ─────────────────────────────────────────────────────────
const Drivers = () => {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [deleteDriver, setDeleteDriver] = useState(null)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => { loadDrivers() }, [currentPage, search, statusFilter])

  const loadDrivers = async () => {
    setLoading(true)
    try {
      const data = await driverService.getDrivers({ page: currentPage, limit: 10, search, status: statusFilter })
      const drivers = data.drivers || data.data?.drivers || []
      setDrivers(drivers)
      setTotalPages(data.totalPages || data.data?.totalPages || 1)
      // Pending haydovchilar soni
      const pending = drivers.filter(d => d.status === 'pending').length
      setPendingCount(pending)
    } catch (err) {
      toast.error('Haydovchilarni yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (driverId) => {
    try {
      await driverService.approveDriver(driverId, true)
      toast.success('✅ Kuryer tasdiqlandi! Kuryerga Telegram xabar yuborildi.')
      loadDrivers()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Tasdiqlashda xatolik')
    }
  }

  const handleReject = async (driverId, reason) => {
    try {
      await driverService.approveDriver(driverId, false, reason)
      toast.success('Kuryer rad etildi.')
      loadDrivers()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Rad etishda xatolik')
    }
  }

  const handleDelete = async () => {
    try {
      await driverService.deleteDriver(deleteDriver._id)
      toast.success("Kuryer o'chirildi")
      setDeleteDriver(null)
      loadDrivers()
    } catch {
      toast.error("O'chirishda xatolik")
    }
  }

  const STATUS_LABELS = {
    pending: { label: 'Kutilmoqda', color: 'bg-yellow-100 text-yellow-800' },
    active: { label: 'Faol', color: 'bg-green-100 text-green-800' },
    blocked: { label: 'Bloklangan', color: 'bg-red-100 text-red-800' },
    closed: { label: 'Yopilgan', color: 'bg-gray-100 text-gray-800' },
  }

  const columns = [
    {
      key: 'name',
      label: 'Ism Familiya',
      render: row => (
        <div>
          <p className="font-medium">{row.firstName} {row.lastName || ''}</p>
          <p className="text-xs text-gray-400">{row.phone}</p>
        </div>
      )
    },
    {
      key: 'vehicle',
      label: 'Transport',
      render: row => (
        <div className="flex items-center gap-1">
          <Truck size={14} className="text-gray-400" />
          <span>{row.vehicle || '—'} {row.vehicleModel || ''}</span>
        </div>
      )
    },
    { key: 'plateNumber', label: 'Raqam', render: row => row.plateNumber || '—' },
    {
      key: 'isOnline',
      label: 'Online',
      render: row => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {row.isOnline ? '🟢 Online' : '⚫ Offline'}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Holat',
      render: row => {
        const cfg = STATUS_LABELS[row.status] || STATUS_LABELS.pending
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
            {cfg.label}
          </span>
        )
      }
    },
    { key: 'createdAt', label: 'Ariza', render: row => formatDate(row.createdAt) },
    {
      key: 'actions',
      label: '',
      render: row => (
        <button
          onClick={() => setSelectedDriver(row)}
          className="flex items-center gap-1 text-primary-600 hover:text-primary-800 font-medium text-sm"
        >
          <Eye size={15} />
          Ko'rish
          {row.status === 'pending' && (
            <span className="ml-1 w-2 h-2 bg-yellow-500 rounded-full inline-block"></span>
          )}
        </button>
      )
    }
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Drivers Management</h1>
          {pendingCount > 0 && (
            <p className="text-yellow-600 text-sm mt-1 flex items-center gap-1">
              <Clock size={14} />
              {pendingCount} ta kuryer tasdiqlash kutmoqda
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Kuryer qidirish..." />
        <FilterDropdown
          label="Filter by status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'pending', label: '⏳ Kutilmoqda' },
            { value: 'active', label: '✅ Faol' },
            { value: 'blocked', label: '🚫 Bloklangan' },
          ]}
        />
      </div>

      <Table
        columns={columns}
        data={drivers}
        loading={loading}
        onDelete={row => setDeleteDriver(row)}
      />

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}

      {/* Tafsilot + tasdiqlash modali */}
      {selectedDriver && (
        <DriverDetailModal
          driver={selectedDriver}
          onClose={() => setSelectedDriver(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteDriver}
        onClose={() => setDeleteDriver(null)}
        onConfirm={handleDelete}
        title="Kuryerni o'chirish"
        message={`${deleteDriver?.firstName} ${deleteDriver?.lastName || ''} ni o'chirishni tasdiqlaysizmi?`}
      />
    </div>
  )
}

export default Drivers
