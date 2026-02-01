import { useState, useEffect } from 'react'
import { driverService } from '../services/driverService'
import Table from '../components/common/Table'
import Pagination from '../components/common/Pagination'
import SearchBar from '../components/common/SearchBar'
import FilterDropdown from '../components/common/FilterDropdown'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { formatDate } from '../utils/helpers'
import toast from 'react-hot-toast'

const Drivers = () => {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleteDriver, setDeleteDriver] = useState(null)

  useEffect(() => {
    loadDrivers()
  }, [currentPage, search, statusFilter])

  const loadDrivers = async () => {
    setLoading(true)
    try {
      const data = await driverService.getDrivers({
        page: currentPage,
        limit: 10,
        search,
        status: statusFilter,
      })
      setDrivers(data.drivers)
      setTotalPages(data.totalPages)
    } catch (error) {
      toast.error('Failed to load drivers')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (driver, newStatus) => {
    try {
      await driverService.updateDriverStatus(driver._id, newStatus)
      toast.success('Status updated successfully')
      loadDrivers()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async () => {
    try {
      await driverService.deleteDriver(deleteDriver._id)
      toast.success('Driver deleted successfully')
      setDeleteDriver(null)
      loadDrivers()
    } catch (error) {
      toast.error('Failed to delete driver')
    }
  }

  const columns = [
    { key: 'firstName', label: 'Name', render: (row) => `${row.firstName} ${row.lastName}` },
    { key: 'phone', label: 'Phone' },
    { key: 'vehicleType', label: 'Vehicle', render: (row) => row.vehicle?.type || 'N/A' },
    { key: 'vehicleNumber', label: 'Plate #', render: (row) => row.vehicle?.plateNumber || 'N/A' },
    {
      key: 'isOnline',
      label: 'Online',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs ${row.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {row.isOnline ? 'Online' : 'Offline'}
        </span>
      ),
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
        <h1 className="text-3xl font-bold">Drivers Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search drivers..."
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
        data={drivers}
        loading={loading}
        onDelete={(driver) => setDeleteDriver(driver)}
      />

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteDriver}
        onClose={() => setDeleteDriver(null)}
        onConfirm={handleDelete}
        title="Delete Driver"
        message={`Are you sure you want to delete ${deleteDriver?.firstName} ${deleteDriver?.lastName}?`}
      />
    </div>
  )
}

export default Drivers
