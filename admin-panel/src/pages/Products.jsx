import { useState, useEffect } from 'react'
import { productService } from '../services/productService'
import Table from '../components/common/Table'
import Pagination from '../components/common/Pagination'
import SearchBar from '../components/common/SearchBar'
import FilterDropdown from '../components/common/FilterDropdown'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { formatCurrency } from '../utils/helpers'
import toast from 'react-hot-toast'

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [deleteProduct, setDeleteProduct] = useState(null)

  useEffect(() => {
    loadProducts()
  }, [currentPage, search, categoryFilter])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const data = await productService.getProducts({
        page: currentPage,
        limit: 10,
        search,
        category: categoryFilter,
      })
      setProducts(data.products)
      setTotalPages(data.totalPages)
    } catch (error) {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await productService.deleteProduct(deleteProduct._id)
      toast.success('Product deleted successfully')
      setDeleteProduct(null)
      loadProducts()
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  const columns = [
    { key: 'name', label: 'Name', render: (row) => row.name?.uz || row.name },
    { key: 'vendor', label: 'Vendor', render: (row) => row.vendor?.name || 'N/A' },
    { key: 'category', label: 'Category' },
    { key: 'price', label: 'Price', render: (row) => formatCurrency(row.price) },
    { 
      key: 'isAvailable', 
      label: 'Available', 
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs ${row.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {row.isAvailable ? 'Yes' : 'No'}
        </span>
      )
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search products..."
        />
        <FilterDropdown
          label="Filter by category"
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={[
            { value: 'pizza', label: 'Pizza' },
            { value: 'burger', label: 'Burger' },
            { value: 'dessert', label: 'Dessert' },
            { value: 'drinks', label: 'Drinks' },
          ]}
        />
      </div>

      <Table
        columns={columns}
        data={products}
        loading={loading}
        onDelete={(product) => setDeleteProduct(product)}
      />

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete ${deleteProduct?.name?.uz || deleteProduct?.name}?`}
      />
    </div>
  )
}

export default Products
