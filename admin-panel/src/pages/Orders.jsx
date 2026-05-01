import { useState, useEffect } from 'react'
import { orderService } from '../services/orderService'
import api from '../services/api'
import Table from '../components/common/Table'
import Pagination from '../components/common/Pagination'
import SearchBar from '../components/common/SearchBar'
import FilterDropdown from '../components/common/FilterDropdown'
import { formatDate, getStatusBadge, formatCurrency } from '../utils/helpers'
import toast from 'react-hot-toast'
import { Eye, X, Truck, RefreshCw } from 'lucide-react'

const STATUS_TRANSITIONS = {
  pending:    ['accepted', 'rejected', 'cancelled'],
  accepted:   ['preparing', 'cancelled'],
  preparing:  ['ready', 'cancelled'],
  ready:      ['assigned', 'cancelled'],
  assigned:   ['picked_up', 'cancelled'],
  picked_up:  ['on_the_way'],
  on_the_way: ['delivered'],
  delivered:  [],
  cancelled:  [],
  rejected:   [],
}

const STATUS_LABELS_UZ = {
  pending:    '⏳ Kutilmoqda',
  accepted:   '✅ Qabul qilindi',
  preparing:  '👨‍🍳 Tayyorlanmoqda',
  ready:      '🍽️ Tayyor',
  assigned:   '🚴 Kuryer biriktirildi',
  picked_up:  '📦 Kuryer oldi',
  on_the_way: '🛵 Yo\'lda',
  delivered:  '🎉 Yetkazildi',
  cancelled:  '❌ Bekor qilindi',
  rejected:   '❌ Rad etildi',
}

// ─── Buyurtma tafsilot modali ─────────────────────────────────────────────
const OrderDetailModal = ({ order, onClose, onStatusChange, onAssignDriver }) => {
  const [availableDrivers, setAvailableDrivers] = useState([])
  const [selectedDriver, setSelectedDriver] = useState('')
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [loadingAssign, setLoadingAssign] = useState(false)

  useEffect(() => {
    if (order?.status === 'ready' && !order?.driver) {
      api.get('/drivers/available').then(res => {
        setAvailableDrivers(res.data?.drivers || res.drivers || [])
      }).catch(() => {})
    }
  }, [order])

  if (!order) return null

  const nextStatuses = STATUS_TRANSITIONS[order.status] || []

  const handleStatusChange = async (newStatus) => {
    setLoadingStatus(true)
    try {
      await onStatusChange(order._id, newStatus)
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Xatolik')
    } finally {
      setLoadingStatus(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedDriver) { toast.error('Kuryerni tanlang'); return }
    setLoadingAssign(true)
    try {
      await onAssignDriver(order._id, selectedDriver)
      toast.success('✅ Kuryer biriktirildi!')
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Xatolik')
    } finally {
      setLoadingAssign(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-bold">#{order.orderNumber}</h2>
            <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
          </div>
          <button onClick={onClose}><X size={24} className="text-gray-400" /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Joriy holat */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Joriy holat</p>
            <p className="text-lg font-bold">{STATUS_LABELS_UZ[order.status] || order.status}</p>
          </div>

          {/* Mijoz va restoran */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Mijoz</p>
              <p className="font-medium">{order.customer?.firstName} {order.customer?.lastName || ''}</p>
              <p className="text-xs text-gray-400">{order.customer?.phone}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Restoran</p>
              <p className="font-medium">{order.vendor?.name || '—'}</p>
            </div>
            {order.driver && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Kuryer</p>
                <p className="font-medium">{order.driver?.firstName} {order.driver?.lastName || ''}</p>
                <p className="text-xs text-gray-400">{order.driver?.phone}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500 mb-1">Manzil</p>
              <p className="font-medium text-sm">{order.deliveryAddress?.address || '—'}</p>
            </div>
          </div>

          {/* Buyurtma tarkibi */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Buyurtma tarkibi</p>
            <div className="space-y-1">
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{item.product?.name?.uz || item.product?.name || '—'} x{item.quantity}</span>
                  <span className="font-medium">{formatCurrency((item.price || 0) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t mt-2 pt-2 flex justify-between font-bold">
              <span>Jami:</span>
              <span className="text-primary-600">{formatCurrency(order.total)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>Yetkazish:</span>
              <span>{formatCurrency(order.deliveryFee || 0)}</span>
            </div>
          </div>

          {/* Kuryer biriktirish (ready holat + kuryer yo'q) */}
          {order.status === 'ready' && !order.driver && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-1">
                <Truck size={16} /> Kuryer biriktirish
              </p>
              {availableDrivers.length > 0 ? (
                <div className="flex gap-2">
                  <select value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Kuryer tanlang...</option>
                    {availableDrivers.map(d => (
                      <option key={d._id} value={d._id}>
                        {d.firstName} {d.lastName || ''} — {d.vehicle || ''} {d.vehicleModel || ''}
                      </option>
                    ))}
                  </select>
                  <button onClick={handleAssign} disabled={loadingAssign || !selectedDriver}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
                    {loadingAssign ? '...' : 'Biriktir'}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-blue-600">Hozir bo'sh kuryer yo'q. Auto-assign kutilmoqda.</p>
              )}
            </div>
          )}

          {/* Keyingi holat tugmalari */}
          {nextStatuses.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Holatni o'zgartirish</p>
              <div className="flex flex-wrap gap-2">
                {nextStatuses.map(s => (
                  <button key={s} onClick={() => handleStatusChange(s)} disabled={loadingStatus}
                    className={`px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors ${
                      s === 'cancelled' || s === 'rejected'
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}>
                    {STATUS_LABELS_UZ[s] || s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Asosiy sahifa ─────────────────────────────────────────────────────────
const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => { loadOrders() }, [currentPage, search, statusFilter])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const data = await orderService.getOrders({ page: currentPage, limit: 15, search, status: statusFilter })
      setOrders(data.orders || data.data?.orders || [])
      setTotalPages(data.totalPages || data.data?.totalPages || 1)
    } catch { toast.error('Buyurtmalarni yuklashda xatolik') }
    finally { setLoading(false) }
  }

  const handleStatusChange = async (orderId, status) => {
    await orderService.updateOrderStatus(orderId, status)
    toast.success(`Holat o'zgartirildi: ${STATUS_LABELS_UZ[status]}`)
    loadOrders()
  }

  const handleAssignDriver = async (orderId, driverId) => {
    await orderService.assignDriver(orderId, driverId)
    loadOrders()
  }

  const columns = [
    { key: 'orderNumber', label: 'Buyurtma #', render: row => (
      <span className="font-mono font-medium text-primary-600">#{row.orderNumber}</span>
    )},
    { key: 'customer', label: 'Mijoz', render: row => row.customer?.firstName || '—' },
    { key: 'vendor', label: 'Restoran', render: row => row.vendor?.name || '—' },
    { key: 'driver', label: 'Kuryer', render: row => row.driver ? `${row.driver.firstName} ${row.driver.lastName || ''}` : (
      <span className="text-gray-400 text-xs">Biriktirilmagan</span>
    )},
    { key: 'total', label: 'Summa', render: row => <span className="font-medium">{formatCurrency(row.total)}</span> },
    { key: 'status', label: 'Holat', render: row => getStatusBadge(row.status) },
    { key: 'createdAt', label: 'Sana', render: row => formatDate(row.createdAt) },
    {
      key: 'action', label: '',
      render: row => (
        <button onClick={() => setSelectedOrder(row)}
          className="flex items-center gap-1 text-primary-600 hover:text-primary-800 text-sm font-medium">
          <Eye size={15} /> Ko'rish
        </button>
      )
    }
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Orders Management</h1>
        <button onClick={loadOrders} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm">
          <RefreshCw size={16} /> Yangilash
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Buyurtma # qidirish..." />
        <FilterDropdown label="Filter by status" value={statusFilter} onChange={setStatusFilter}
          options={Object.entries(STATUS_LABELS_UZ).map(([v, l]) => ({ value: v, label: l }))} />
      </div>

      <Table columns={columns} data={orders} loading={loading} />

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
          onAssignDriver={handleAssignDriver}
        />
      )}
    </div>
  )
}

export default Orders
