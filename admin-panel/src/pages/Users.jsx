import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { userService } from '../services/userService'
import Table from '../components/common/Table'
import Pagination from '../components/common/Pagination'
import SearchBar from '../components/common/SearchBar'
import FilterDropdown from '../components/common/FilterDropdown'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { formatDate, getRoleBadge } from '../utils/helpers'
import toast from 'react-hot-toast'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [deleteUser, setDeleteUser] = useState(null)

  useEffect(() => {
    loadUsers()
  }, [currentPage, search, roleFilter])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await userService.getUsers({
        page: currentPage,
        limit: 10,
        search,
        role: roleFilter,
      })
      setUsers(data.users)
      setTotalPages(data.totalPages)
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await userService.deleteUser(deleteUser._id)
      toast.success('User deleted successfully')
      setDeleteUser(null)
      loadUsers()
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  const columns = [
    { key: 'firstName', label: 'Name', render: (row) => `${row.firstName} ${row.lastName}` },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'role', label: 'Role', render: (row) => getRoleBadge(row.role) },
    { key: 'createdAt', label: 'Joined', render: (row) => formatDate(row.createdAt) },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Users Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search users..."
        />
        <FilterDropdown
          label="Filter by role"
          value={roleFilter}
          onChange={setRoleFilter}
          options={[
            { value: 'customer', label: 'Customer' },
            { value: 'vendor', label: 'Vendor' },
            { value: 'driver', label: 'Driver' },
            { value: 'admin', label: 'Admin' },
          ]}
        />
      </div>

      <Table
        columns={columns}
        data={users}
        loading={loading}
        onDelete={(user) => setDeleteUser(user)}
      />

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${deleteUser?.firstName} ${deleteUser?.lastName}?`}
      />
    </div>
  )
}

export default Users
