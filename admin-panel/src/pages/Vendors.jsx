import { useState, useEffect } from 'react'
import { vendorService } from '../services/vendorService'
import Table from '../components/common/Table'
import Pagination from '../components/common/Pagination'
import SearchBar from '../components/common/SearchBar'
import FilterDropdown from '../components/common/FilterDropdown'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { formatDate } from '../utils/helpers'
import toast from 'react-hot-toast'
import { Star, Plus, X, Edit2, Eye, CheckCircle, XCircle, Clock } from 'lucide-react'

const EMPTY_FORM = {
  name: '', category: '', phone: '', address: '',
  description: '',
  location: { lat: '', lng: '' },
  workingHours: { start: '09:00', end: '22:00' },
  telegramId: '',
}

// ─── Vendor qo'shish/tahrirlash modali ──────────────────────────────────────
const VendorModal = ({ vendor, onClose, onSave }) => {
  const isEdit = !!vendor?._id
  const [form, setForm] = useState(
    isEdit ? {
      name: vendor.name || '',
      category: vendor.category || '',
      phone: vendor.phone || '',
      address: vendor.address || '',
      description: vendor.description || '',
      location: vendor.location || { lat: '', lng: '' },
      workingHours: vendor.workingHours || { start: '09:00', end: '22:00' },
      telegramId: vendor.telegramId || '',
    } : EMPTY_FORM
  )
  const [saving, setSaving] = useState(false)
  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.address || !form.category) {
      toast.error('Ism, telefon, manzil va kategoriya majburiy!')
      return
    }
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Xatolik yuz berdi')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">{isEdit ? 'Vendorni tahrirlash' : "Yangi vendor qo'shish"}</h2>
          <button onClick={onClose}><X size={24} className="text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Restoran nomi *</label>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="KFC Parkent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategoriya *</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Tanlang...</option>
              {['fastfood','milliy','pizza','burger','sushi','lavash','kafe','shirinliklar','boshqa'].map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
            <input type="text" value={form.phone} onChange={e => set('phone', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="+998901234567" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manzil *</label>
            <input type="text" value={form.address} onChange={e => set('address', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Toshkent, Parkent..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kenglik (lat)</label>
              <input type="number" step="any" value={form.location.lat}
                onChange={e => set('location', { ...form.location, lat: parseFloat(e.target.value) || '' })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="41.299" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Uzunlik (lng)</label>
              <input type="number" step="any" value={form.location.lng}
                onChange={e => set('location', { ...form.location, lng: parseFloat(e.target.value) || '' })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="69.240" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ish boshlanishi</label>
              <input type="time" value={form.workingHours.start}
                onChange={e => set('workingHours', { ...form.workingHours, start: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ish tugashi</label>
              <input type="time" value={form.workingHours.end}
                onChange={e => set('workingHours', { ...form.workingHours, end: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telegram ID</label>
            <input type="text" value={form.telegramId} onChange={e => set('telegramId', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="123456789" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50">
              Bekor qilish
            </button>
            <button type="submit" disabled={saving} className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {saving ? 'Saqlanmoqda...' : isEdit ? 'Saqlash' : "Qo'shish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Vendor tafsilot modali ──────────────────────────────────────────────────
const VendorDetailModal = ({ vendor, onClose, onApprove, onReject, onEdit }) => {
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!vendor) return null

  const handleApprove = async () => {
    setLoading(true)
    try { await onApprove(vendor._id); onClose() }
    finally { setLoading(false) }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error('Rad etish sababini kiriting'); return }
    setLoading(true)
    try { await onReject(vendor._id, rejectReason); onClose() }
    finally { setLoading(false) }
  }

  const STATUS_MAP = {
    pending: { label: 'Kutilmoqda', color: 'bg-yellow-100 text-yellow-800' },
    active: { label: 'Faol', color: 'bg-green-100 text-green-800' },
    blocked: { label: 'Bloklangan', color: 'bg-red-100 text-red-800' },
  }
  const s = STATUS_MAP[vendor.status] || STATUS_MAP.pending

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">{vendor.name}</h2>
          <button onClick={onClose}><X size={24} className="text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-xs text-gray-500">Kategoriya</p><p className="font-medium">{vendor.category}</p></div>
            <div><p className="text-xs text-gray-500">Telefon</p><p className="font-medium">{vendor.phone}</p></div>
            <div><p className="text-xs text-gray-500">Manzil</p><p className="font-medium">{vendor.address || '—'}</p></div>
            <div><p className="text-xs text-gray-500">Reyting</p><p className="font-medium">⭐ {(vendor.rating || 0).toFixed(1)}</p></div>
            <div><p className="text-xs text-gray-500">Ish vaqti</p><p className="font-medium">{vendor.workingHours?.start} - {vendor.workingHours?.end}</p></div>
            <div><p className="text-xs text-gray-500">Holat</p><span className={`px-2 py-1 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span></div>
            <div><p className="text-xs text-gray-500">Qo'shilgan</p><p className="font-medium">{formatDate(vendor.createdAt)}</p></div>
            {vendor.totalOrders > 0 && (
              <div><p className="text-xs text-gray-500">Buyurtmalar</p><p className="font-medium">{vendor.totalOrders}</p></div>
            )}
          </div>

          {showRejectInput && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Rad etish sababi *</label>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" rows={3}
                placeholder="Masalan: manzil noto'g'ri..." />
            </div>
          )}

          {vendor.status === 'pending' && (
            <div className="flex gap-3">
              {!showRejectInput ? (
                <>
                  <button onClick={handleApprove} disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-xl hover:bg-green-700 disabled:opacity-50 font-medium">
                    <CheckCircle size={18} /> Tasdiqlash
                  </button>
                  <button onClick={() => setShowRejectInput(true)} disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 rounded-xl hover:bg-red-700 disabled:opacity-50 font-medium">
                    <XCircle size={18} /> Rad etish
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setShowRejectInput(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50 font-medium">
                    Bekor
                  </button>
                  <button onClick={handleReject} disabled={loading || !rejectReason.trim()}
                    className="flex-1 bg-red-600 text-white py-2.5 rounded-xl hover:bg-red-700 disabled:opacity-50 font-medium">
                    {loading ? 'Yuborilmoqda...' : 'Tasdiqlash'}
                  </button>
                </>
              )}
            </div>
          )}

          {vendor.status !== 'pending' && (
            <button onClick={() => { onClose(); onEdit(vendor) }}
              className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50 font-medium flex items-center justify-center gap-2">
              <Edit2 size={16} /> Tahrirlash
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Asosiy sahifa ─────────────────────────────────────────────────────────
const Vendors = () => {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleteVendor, setDeleteVendor] = useState(null)
  const [modalVendor, setModalVendor] = useState(null)
  const [detailVendor, setDetailVendor] = useState(null)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => { loadVendors() }, [currentPage, search, statusFilter])

  const loadVendors = async () => {
    setLoading(true)
    try {
      const data = await vendorService.getVendors({ page: currentPage, limit: 10, search, status: statusFilter })
      const list = data.vendors || data.data?.vendors || []
      setVendors(list)
      setTotalPages(data.totalPages || data.data?.totalPages || 1)
      setPendingCount(list.filter(v => v.status === 'pending').length)
    } catch { toast.error('Vendorlarni yuklashda xatolik') }
    finally { setLoading(false) }
  }

  const handleSave = async (form) => {
    if (modalVendor?._id) {
      await vendorService.updateVendor(modalVendor._id, form)
      toast.success('Vendor yangilandi!')
    } else {
      await vendorService.createVendor({ ...form, status: 'active' })
      toast.success("Vendor qo'shildi!")
    }
    loadVendors()
  }

  const handleApprove = async (vendorId) => {
    try {
      await vendorService.approveVendor(vendorId, true)
      toast.success('✅ Restoran tasdiqlandi! Vendorga Telegram xabar yuborildi.')
      loadVendors()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Xatolik')
    }
  }

  const handleReject = async (vendorId, reason) => {
    try {
      await vendorService.approveVendor(vendorId, false, reason)
      toast.success('Restoran rad etildi.')
      loadVendors()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Xatolik')
    }
  }

  const handleDelete = async () => {
    try {
      await vendorService.deleteVendor(deleteVendor._id)
      toast.success("Vendor o'chirildi")
      setDeleteVendor(null)
      loadVendors()
    } catch { toast.error("O'chirishda xatolik") }
  }

  const STATUS_LABELS = {
    pending: { label: 'Kutilmoqda', color: 'bg-yellow-100 text-yellow-800' },
    active: { label: 'Faol', color: 'bg-green-100 text-green-800' },
    blocked: { label: 'Bloklangan', color: 'bg-red-100 text-red-800' },
  }

  const columns = [
    {
      key: 'name', label: 'Nomi',
      render: row => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-gray-400">{row.category}</p>
        </div>
      )
    },
    { key: 'phone', label: 'Telefon' },
    {
      key: 'rating', label: 'Reyting',
      render: row => (
        <div className="flex items-center gap-1">
          <Star size={14} className="text-yellow-500 fill-yellow-500" />
          <span>{(row.rating || 0).toFixed(1)}</span>
        </div>
      )
    },
    {
      key: 'status', label: 'Holat',
      render: row => {
        const cfg = STATUS_LABELS[row.status] || STATUS_LABELS.pending
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
            {row.status === 'pending' && '⏳ '}{cfg.label}
          </span>
        )
      }
    },
    { key: 'createdAt', label: "Qo'shilgan", render: row => formatDate(row.createdAt) },
    {
      key: 'actions', label: '',
      render: row => (
        <div className="flex items-center gap-2">
          <button onClick={() => setDetailVendor(row)}
            className="flex items-center gap-1 text-primary-600 hover:text-primary-800 text-sm font-medium">
            <Eye size={15} />
            {row.status === 'pending' ? (
              <span className="flex items-center gap-1">Ko'rish <span className="w-2 h-2 bg-yellow-500 rounded-full"></span></span>
            ) : 'Ko\'rish'}
          </button>
        </div>
      )
    }
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Vendors Management</h1>
          {pendingCount > 0 && (
            <p className="text-yellow-600 text-sm mt-1 flex items-center gap-1">
              <Clock size={14} /> {pendingCount} ta restoran tasdiqlash kutmoqda
            </p>
          )}
        </div>
        <button onClick={() => setModalVendor({})}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          <Plus size={20} /> Yangi vendor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Vendor qidirish..." />
        <FilterDropdown label="Filter by status" value={statusFilter} onChange={setStatusFilter}
          options={[
            { value: 'pending', label: '⏳ Kutilmoqda' },
            { value: 'active', label: '✅ Faol' },
            { value: 'blocked', label: '🚫 Bloklangan' },
          ]} />
      </div>

      <Table columns={columns} data={vendors} loading={loading} onDelete={row => setDeleteVendor(row)} />

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}

      {modalVendor !== null && (
        <VendorModal vendor={modalVendor} onClose={() => setModalVendor(null)} onSave={handleSave} />
      )}

      {detailVendor && (
        <VendorDetailModal
          vendor={detailVendor}
          onClose={() => setDetailVendor(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onEdit={v => { setDetailVendor(null); setModalVendor(v) }}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteVendor}
        onClose={() => setDeleteVendor(null)}
        onConfirm={handleDelete}
        title="Vendorni o'chirish"
        message={`${deleteVendor?.name} ni o'chirishni tasdiqlaysizmi?`}
      />
    </div>
  )
}

export default Vendors
