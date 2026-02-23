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

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [statsRes, ordersRes, revenueRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getOrdersChartData(7),
        dashboardService.getRevenueChartData(6),
      ])

      setStats(statsRes.data?.data || statsRes.data)
      setOrdersData(ordersRes.data?.data?.orderStats || [])
      setRevenueData(revenueRes.data?.data?.revenueStats || [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Users"
          value={stats?.users || 0}
          icon={Users}
          trend="up"
          trendValue="+12%"
          color="blue"
        />
        <StatCard
          title="Total Vendors"
          value={stats?.vendors || 0}
          icon={Store}
          trend="up"
          trendValue="+8%"
          color="green"
        />
        <StatCard
          title="Total Drivers"
          value={stats?.drivers || 0}
          icon={Truck}
          trend="up"
          trendValue="+5%"
          color="purple"
        />
        <StatCard
          title="Total Orders"
          value={stats?.orders || 0}
          icon={ShoppingBag}
          trend="up"
          trendValue="+15%"
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <OrdersChart data={ordersData} />
        <RevenueChart data={revenueData} />
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>
        <QuickActions />
      </div>

      {/* Recent Users & Top Vendors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentUsers />
        <TopVendors />
      </div>
    </div>
  )
}

export default Dashboard
