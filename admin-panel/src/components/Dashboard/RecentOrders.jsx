import { useEffect, useState } from 'react'
import { orderService } from '../../services/orderService'
import { formatDate, getStatusBadge } from '../../utils/helpers'

const RecentOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const data = await orderService.getOrders({ limit: 5, sort: '-createdAt' })
      setOrders(data.orders)
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="card">Loading...</div>

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">Recent Orders</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b">
            <tr className="text-left">
              <th className="pb-3 font-medium text-gray-600">Order #</th>
              <th className="pb-3 font-medium text-gray-600">Customer</th>
              <th className="pb-3 font-medium text-gray-600">Vendor</th>
              <th className="pb-3 font-medium text-gray-600">Amount</th>
              <th className="pb-3 font-medium text-gray-600">Status</th>
              <th className="pb-3 font-medium text-gray-600">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-b hover:bg-gray-50">
                <td className="py-3">{order.orderNumber}</td>
                <td className="py-3">{order.customer?.firstName || 'N/A'}</td>
                <td className="py-3">{order.vendor?.name || 'N/A'}</td>
                <td className="py-3">{order.total.toLocaleString()} UZS</td>
                <td className="py-3">{getStatusBadge(order.status)}</td>
                <td className="py-3">{formatDate(order.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RecentOrders
