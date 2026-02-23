import { useEffect, useState } from 'react'
import { Users, Store, Truck, ShoppingBag } from 'lucide-react'
import StatCard from '../components/Dashboard/StatCard'
import OrdersChart from '../components/charts/OrdersChart'
import RevenueChart from '../components/charts/RevenueChart'
import RecentOrders from '../components/Dashboard/RecentOrders'
import RecentUsers from '../components/Dashboard/RecentUsers'
import TopVendors from '../components/Dashboard/TopVendors'
import QuickActions from '../components/Dashboard/QuickActions'
import { dashboardService } from '../services/dashboardService'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [ordersData, setOrdersData] = useState([])
  const [revenueData, setRevenueData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadDashboardData() }, [])

  const loadDashboardData = async () => {
    try {
      const [statsRes, ordersRes, revenueRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getOrdersChartData(7),
        dashboardService.getRevenueChartData(6),
      ])
      // Stats va Chart ma'lumotlarini chuqur tekshirish bilan yuklash
      setStats(statsRes?.data || statsRes || {})
      setOrdersData(ordersRes?.data?.orderStats || ordersRes?.orderStats || [])
      setRevenueData(revenueRes?.data?.revenueStats || revenueRes?.revenueStats || [])
    } catch (error) {
      console.error('Data error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard title="Total Users" value={stats?.users || 0} icon={Users} color="blue" />
        <StatCard title="Total Vendors" value={stats?.vendors || 0} icon={Store} color="green" />
        <StatCard title="Total Drivers" value={stats?.drivers || 0} icon={Truck} color="purple" />
        <StatCard title="Total Orders" value={stats?.orders || 0} icon={ShoppingBag} color="orange" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <OrdersChart data={ordersData} />
        <RevenueChart data={revenueData} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2"><RecentOrders /></div>
        <QuickActions />
      </div>
    </div>
  )
}
export default Dashboard
