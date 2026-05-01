import { useState, useEffect } from 'react'
import { productService } from '../services/productService'
import { vendorService } from '../services/vendorService'
import Table from '../components/common/Table'
import Pagination from '../components/common/Pagination'
import SearchBar from '../components/common/SearchBar'
import FilterDropdown from '../components/common/FilterDropdown'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { formatCurrency } from '../utils/helpers'
import toast from 'react-hot-toast'
import { Plus, X, Eye, Edit2, ToggleLeft, ToggleRight } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'https://parkent-express.duckdns.org'

const CATEGORIES = [
  'pizza', 'burger', 'sushi', 'salat', 'lagmon',
  'milliy', 'kabob', 'lavash', 'shirinliklar', 'ichimliklar', 'fastfood', 'boshqa'
]

const EMPTY_FORM = {
  name_uz: '', name_ru: '', description_uz: '', description_ru: '',
  price: '', category: 'boshqa', preparationTime: 15,
  vendor: '', discount: 0, isAvailable: true
}

// ─── Mahsulot qo'shish/tahrirlash modali ──────────────────────────────────
const ProductModal = ({ product, vendors, onClose, onSave }) => {
  const isEdit = !!product?._id
  const [form, setForm] = useState(isEdit ? {
    name_uz: product.name?.uz || product.name || '',
    name_ru: product.name?.ru || '',
    description_uz: product.description?.uz || '',
    description_ru: product.description?.ru || '',
    price: product.price || '',
    category: product.category || 'boshqa',
    preparationTime: product.preparationTime || 15,
    vendor: product.vendor?._id || product.vendor || '',
    discount: product.discount || 0,
    isAvailable: product.isAvailable !== false,
  } : EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name_uz || !form.price || !form.vendor) {
      toast.error('Nomi (uz), narxi va restoran majburiy!')
      return
    }
    setSaving(true)
    try {
      const data = {
        name: { uz: form.name_uz, ru: form.name_ru || form.name_uz },
        description: { uz: form.description_uz, ru: form.description_ru || form.description_uz },
        price: parseFloat(form.price),
        category: form.category,
        preparationTime: parseInt(form.preparationTime) || 15,
        vendor: form.vendor,
        discount: parseFloat(form.discount) || 0,
        isAvailable: form.isAvailable,
      }
      await onSave(data)
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Xatolik')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">{isEdit ? 'Mahsulotni tahrirlash' : "Yangi mahsulot qo'shish"}</h2>
          <button onClick={onClose}><X size={24} className="text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Restoran *</label>
            <select value={form.vendor} onChange={e => set('vendor', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Tanlang...</option>
              {vendors.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomi (uz) *</label>
              <input type="text" value={form.name_uz} onChange={e => set('name_uz', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Pizza Margherita" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomi (ru)</label>
              <input type="text" value={form.name_ru} onChange={e => set('name_ru', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Пицца Маргарита" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif (uz)</label>
            <textarea value={form.description_uz} onChange={e => set('description_uz', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Narx (so'm) *</label>
              <input type="number" value={form.price} onChange={e => set('price', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="25000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chegirma (%)</label>
              <input type="number" value={form.discount} onChange={e => set('discount', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0" min="0" max="99" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategoriya</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tayyorlanish (daq)</label>
              <input type="number" value={form.preparationTime} onChange={e => set('preparationTime', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="15" min="1" />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isAvailable} onChange={e => set('isAvailable', e.target.checked)}
              className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-medium text-gray-700">Faol (sotuvda bor)</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50">
              Bekor
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {saving ? 'Saqlanmoqda...' : isEdit ? 'Saqlash' : "Qo'shish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Asosiy sahifa ─────────────────────────────────────────────────────────
const Products = () => {
  const [products, setProducts] = useState([])
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [deleteProduct, setDeleteProduct] = useState(null)
  const [modalProduct, setModalProduct] = useState(null)

  useEffect(() => {
    loadProducts()
    vendorService.getVendors({ status: 'active', limit: 100 })
      .then(d => setVendors(d.vendors || d.data?.vendors || []))
      .catch(() => {})
  }, [currentPage, search, categoryFilter])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const data = await productService.getProducts({ page: currentPage, limit: 15, search, category: categoryFilter })
      setProducts(data.products || data.data?.products || [])
      setTotalPages(data.totalPages || data.data?.totalPages || 1)
    } catch { toast.error('Mahsulotlarni yuklashda xatolik') }
    finally { setLoading(false) }
  }

  const handleSave = async (formData) => {
    if (modalProduct?._id) {
      await productService.updateProduct(modalProduct._id, formData)
      toast.success('Mahsulot yangilandi!')
    } else {
      await productService.createProduct(formData)
      toast.success("Mahsulot qo'shildi!")
    }
    loadProducts()
  }

  const handleToggle = async (product) => {
    try {
      await productService.toggleAvailability(product._id)
      toast.success(product.isAvailable ? 'Nofaol qilindi' : 'Faol qilindi')
      loadProducts()
    } catch { toast.error('Xatolik') }
  }

  const handleDelete = async () => {
    try {
      await productService.deleteProduct(deleteProduct._id)
      toast.success("Mahsulot o'chirildi")
      setDeleteProduct(null)
      loadProducts()
    } catch { toast.error("O'chirishda xatolik") }
  }

  const columns = [
    {
      key: 'photo', label: 'Rasm',
      render: row => row.photo ? (
        <img src={`${API_BASE}/${row.photo}`} alt="" className="w-10 h-10 rounded-lg object-cover" />
      ) : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg">🍽️</div>
    },
    {
      key: 'name', label: 'Nomi',
      render: row => (
        <div>
          <p className="font-medium">{row.name?.uz || row.name}</p>
          <p className="text-xs text-gray-400">{row.category}</p>
        </div>
      )
    },
    {
      key: 'vendor', label: 'Restoran',
      render: row => row.vendor?.name || '—'
    },
    {
      key: 'price', label: 'Narx',
      render: row => (
        <div>
          <p className="font-medium">{formatCurrency(row.price)}</p>
          {row.discount > 0 && <p className="text-xs text-green-600">-{row.discount}%</p>}
        </div>
      )
    },
    {
      key: 'isAvailable', label: 'Holat',
      render: row => (
        <button onClick={() => handleToggle(row)}
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            row.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
          {row.isAvailable ? <><ToggleRight size={14} /> Faol</> : <><ToggleLeft size={14} /> Nofaol</>}
        </button>
      )
    },
    {
      key: 'actions', label: '',
      render: row => (
        <button onClick={() => setModalProduct(row)}
          className="flex items-center gap-1 text-primary-600 hover:text-primary-800 text-sm font-medium">
          <Edit2 size={15} /> Tahrirlash
        </button>
      )
    }
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products Management</h1>
        <button onClick={() => setModalProduct({})}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          <Plus size={20} /> Yangi mahsulot
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Mahsulot qidirish..." />
        <FilterDropdown label="Kategoriya" value={categoryFilter} onChange={setCategoryFilter}
          options={CATEGORIES.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))} />
      </div>

      <Table columns={columns} data={products} loading={loading}
        onDelete={row => setDeleteProduct(row)} />

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}

      {modalProduct !== null && (
        <ProductModal product={modalProduct} vendors={vendors}
          onClose={() => setModalProduct(null)} onSave={handleSave} />
      )}

      <ConfirmDialog
        isOpen={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={handleDelete}
        title="Mahsulotni o'chirish"
        message={`${deleteProduct?.name?.uz || deleteProduct?.name} ni o'chirishni tasdiqlaysizmi?`}
      />
    </div>
  )
}

export default Products
