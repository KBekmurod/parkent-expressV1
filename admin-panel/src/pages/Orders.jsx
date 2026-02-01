import { useState, useEffect } from 'react'
import { orderService } from '../services/orderService'
import Table from '../components/common/Table'
import Pagination from '../components/common/Pagination'
import SearchBar from '../components/common/SearchBar'
import FilterDropdown from '../components/common/FilterDropdown'
import { formatDate, getStatusBadge, formatCurrency } from '../utils/helpers'
import toast from 'react-hot-toast'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    loadOrders()
  }, [currentPage, search, statusFilter])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const data = await orderService.getOrders({
        page: currentPage,
        limit: 10,
        search,
        status: statusFilter,
      })
      setOrders(data.orders)
      setTotalPages(data.totalPages)
    } catch (error) {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'orderNumber', label: 'Order #' },
    { key: 'customer', label: 'Customer', render: (row) => row.customer?.firstName || 'N/A' },
    { key: 'vendor', label: 'Vendor', render: (row) => row.vendor?.name || 'N/A' },
    { key: 'driver', label: 'Driver', render: (row) => row.driver?.firstName || 'Unassigned' },
    { key: 'total', label: 'Amount', render: (row) => formatCurrency(row.total) },
    { key: 'status', label: 'Status', render: (row) => getStatusBadge(row.status) },
    { key: 'createdAt', label: 'Date', render: (row) => formatDate(row.createdAt) },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Orders Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search orders..."
        />
        <FilterDropdown
          label="Filter by status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'accepted', label: 'Accepted' },
            { value: 'preparing', label: 'Preparing' },
            { value: 'ready', label: 'Ready' },
            { value: 'on_the_way', label: 'On The Way' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
        />
      </div>

      <Table
        columns={columns}
        data={orders}
        loading={loading}
      />

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}

export default Orders
