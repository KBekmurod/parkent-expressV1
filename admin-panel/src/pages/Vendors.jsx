import { useState, useEffect } from 'react'
import { vendorService } from '../services/vendorService'
import Table from '../components/common/Table'
import Pagination from '../components/common/Pagination'
import SearchBar from '../components/common/SearchBar'
import FilterDropdown from '../components/common/FilterDropdown'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { formatDate } from '../utils/helpers'
import toast from 'react-hot-toast'
import { Star, Plus, X, Edit2, Eye } from 'lucide-react'

const EMPTY_FORM = {
  name: '', category: '', phone: '', address: '',
  description: '',
  location: { lat: '', lng: '' },
  workingHours: { start: '09:00', end: '22:00' },
  telegramId: '',
}

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
      toast.error("Ism, telefon, manzil va kategoriya majburiy!")
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
          <h2 className="text-xl font-bold">{isEdit ? 'Vendorni tahrirlash' : 'Yangi vendor qo\'shish'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Restoran nomi *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Masalan: KFC Parkent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategoriya *</label>
            <select
              value={form.category}
              onChange={e => set('category', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Tanlang...</option>
              <option value="fastfood">Fast Food</option>
              <option value="milliy">Milliy taomlar</option>
              <option value="pizza">Pizza</option>
              <option value="burger">Burger</option>
              <option value="sushi">Sushi</option>
              <option value="lavash">Lavash</option>
              <option value="shirinliklar">Shirinliklar</option>
              <option value="ichimliklar">Ichimliklar</option>
              <option value="boshqa">Boshqa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
            <input
              type="text"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="+998901234567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manzil *</label>
            <input
              type="text"
              value={form.address}
              onChange={e => set('address', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Toshkent, Parkent tumani..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={2}
              placeholder="Restoran haqida qisqacha..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kenglik (lat)</label>
              <input
                type="number"
                step="any"
                value={form.location.lat}
                onChange={e => set('location', { ...form.location, lat: parseFloat(e.target.value) || '' })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="41.299"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Uzunlik (lng)</label>
              <input
                type="number"
                step="any"
                value={form.location.lng}
                onChange={e => set('location', { ...form.location, lng: parseFloat(e.target.value) || '' })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="69.240"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ish boshlanishi</label>
              <input
                type="time"
                value={form.workingHours.start}
                onChange={e => set('workingHours', { ...form.workingHours, start: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ish tugashi</label>
              <input
                type="time"
                value={form.workingHours.end}
                onChange={e => set('workingHours', { ...form.workingHours, end: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telegram ID</label>
            <input
              type="text"
              value={form.telegramId}
              onChange={e => set('telegramId', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="123456789"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? 'Saqlanmoqda...' : isEdit ? 'Saqlash' : 'Qo\'shish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const Vendors = () => {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleteVendor, setDeleteVendor] = useState(null)
  const [modalVendor, setModalVendor] = useState(null) // null=yopiq, {}=yangi, vendor=tahrirlash
  const [viewVendor, setViewVendor] = useState(null)

  useEffect(() => {
    loadVendors()
  }, [currentPage, search, statusFilter])

  const loadVendors = async () => {
    setLoading(true)
    try {
      const data = await vendorService.getVendors({ page: currentPage, limit: 10, search, status: statusFilter })
      setVendors(data.vendors || data.data?.vendors || [])
      setTotalPages(data.totalPages || data.data?.totalPages || 1)
    } catch (error) {
      toast.error('Vendorlarni yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (form) => {
    if (modalVendor?._id) {
      await vendorService.updateVendor(modalVendor._id, form)
      toast.success('Vendor yangilandi!')
    } else {
      await vendorService.createVendor({ ...form, status: 'active' })
      toast.success('Vendor qo\'shildi!')
    }
    loadVendors()
  }

  const handleStatusChange = async (vendor, newStatus) => {
    try {
      await vendorService.updateVendorStatus(vendor._id, newStatus)
      toast.success('Status yangilandi')
      loadVendors()
    } catch (error) {
      toast.error('Statusni yangilashda xatolik')
    }
  }

  const handleDelete = async () => {
    try {
      await vendorService.deleteVendor(deleteVendor._id)
      toast.success('Vendor o\'chirildi')
      setDeleteVendor(null)
      loadVendors()
    } catch (error) {
      toast.error('O\'chirishda xatolik')
    }
  }

  const columns = [
    { key: 'name', label: 'Nomi' },
    { key: 'category', label: 'Kategoriya' },
    { key: 'phone', label: 'Telefon' },
    {
      key: 'rating',
      label: 'Reyting',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Star size={16} className="text-yellow-500 fill-yellow-500" />
          <span>{(row.rating || 0).toFixed(1)}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Holat',
      render: (row) => (
        <select
          value={row.status}
          onChange={(e) => handleStatusChange(row, e.target.value)}
          className="px-2 py-1 border rounded text-sm"
        >
          <option value="pending">Kutilmoqda</option>
          <option value="active">Faol</option>
          <option value="blocked">Bloklangan</option>
        </select>
      ),
    },
    { key: 'createdAt', label: 'Qo\'shilgan', render: (row) => formatDate(row.createdAt) },
    {
      key: 'actions',
      label: 'Amallar',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => setViewVendor(row)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Ko'rish"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => setModalVendor(row)}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
            title="Tahrirlash"
          >
            <Edit2 size={16} />
          </button>
        </div>
      )
    }
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vendors Management</h1>
        <button
          onClick={() => setModalVendor({})}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          <Plus size={20} />
          Yangi vendor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Vendor qidirish..." />
        <FilterDropdown
          label="Filter by status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'pending', label: 'Kutilmoqda' },
            { value: 'active', label: 'Faol' },
            { value: 'blocked', label: 'Bloklangan' },
          ]}
        />
      </div>

      <Table
        columns={columns}
        data={vendors}
        loading={loading}
        onDelete={(vendor) => setDeleteVendor(vendor)}
      />

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}

      {/* Qo'shish/tahrirlash modali */}
      {modalVendor !== null && (
        <VendorModal
          vendor={modalVendor}
          onClose={() => setModalVendor(null)}
          onSave={handleSave}
        />
      )}

      {/* Ko'rish modali */}
      {viewVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{viewVendor.name}</h2>
              <button onClick={() => setViewVendor(null)}><X size={24} /></button>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Kategoriya:</span> {viewVendor.category}</p>
              <p><span className="font-medium">Telefon:</span> {viewVendor.phone}</p>
              <p><span className="font-medium">Manzil:</span> {viewVendor.address}</p>
              <p><span className="font-medium">Holat:</span> {viewVendor.status}</p>
              <p><span className="font-medium">Reyting:</span> ⭐ {(viewVendor.rating || 0).toFixed(1)}</p>
              <p><span className="font-medium">Ish vaqti:</span> {viewVendor.workingHours?.start} - {viewVendor.workingHours?.end}</p>
              <p><span className="font-medium">Qo'shilgan:</span> {formatDate(viewVendor.createdAt)}</p>
            </div>
            <button
              onClick={() => { setViewVendor(null); setModalVendor(viewVendor) }}
              className="mt-4 w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
            >
              Tahrirlash
            </button>
          </div>
        </div>
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
