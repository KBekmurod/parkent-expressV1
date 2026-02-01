import { useState, useEffect } from 'react'
import { vendorService } from '../services/vendorService'
import Table from '../components/common/Table'
import Pagination from '../components/common/Pagination'
import SearchBar from '../components/common/SearchBar'
import FilterDropdown from '../components/common/FilterDropdown'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { formatDate } from '../utils/helpers'
import toast from 'react-hot-toast'
import { Star } from 'lucide-react'

const Vendors = () => {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleteVendor, setDeleteVendor] = useState(null)

  useEffect(() => {
    loadVendors()
  }, [currentPage, search, statusFilter])

  const loadVendors = async () => {
    setLoading(true)
    try {
      const data = await vendorService.getVendors({
        page: currentPage,
        limit: 10,
        search,
        status: statusFilter,
      })
      setVendors(data.vendors)
      setTotalPages(data.totalPages)
    } catch (error) {
      toast.error('Failed to load vendors')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (vendor, newStatus) => {
    try {
      await vendorService.updateVendorStatus(vendor._id, newStatus)
      toast.success('Status updated successfully')
      loadVendors()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async () => {
    try {
      await vendorService.deleteVendor(deleteVendor._id)
      toast.success('Vendor deleted successfully')
      setDeleteVendor(null)
      loadVendors()
    } catch (error) {
      toast.error('Failed to delete vendor')
    }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category' },
    { key: 'phone', label: 'Phone' },
    { 
      key: 'rating', 
      label: 'Rating', 
      render: (row) => (
        <div className="flex items-center gap-1">
          <Star size={16} className="text-yellow-500 fill-yellow-500" />
          <span>{row.rating.toFixed(1)}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <select
          value={row.status}
          onChange={(e) => handleStatusChange(row, e.target.value)}
          className="px-2 py-1 border rounded"
        >
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      ),
    },
    { key: 'createdAt', label: 'Joined', render: (row) => formatDate(row.createdAt) },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vendors Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search vendors..."
        />
        <FilterDropdown
          label="Filter by status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'active', label: 'Active' },
            { value: 'blocked', label: 'Blocked' },
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
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteVendor}
        onClose={() => setDeleteVendor(null)}
        onConfirm={handleDelete}
        title="Delete Vendor"
        message={`Are you sure you want to delete ${deleteVendor?.name}?`}
      />
    </div>
  )
}

export default Vendors
