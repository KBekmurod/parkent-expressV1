import { useEffect, useState } from 'react'
import { userService } from '../../services/userService'
import { formatDate } from '../../utils/helpers'

const RecentUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const data = await userService.getUsers({ limit: 5, sort: '-createdAt' })
      setUsers(data.users)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="card">Loading...</div>

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">Recent Users</h3>
      
      <div className="space-y-3">
        {users.map((user) => (
          <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
              <div>
                <p className="font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-gray-500">{user.phone}</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">{formatDate(user.createdAt)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecentUsers
