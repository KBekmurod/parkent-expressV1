import { useEffect, useState } from 'react'
import { Users, Store, Truck, ShoppingBag } from 'lucide-react'
import StatCard from '../components/Dashboard/StatCard'
import OrdersChart from '../components/charts/OrdersChart'
import RevenueChart from '../components/charts/RevenueChart'
import { dashboardService } from '../services/dashboardService'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [ordersData, setOrdersData] = useState([])
  const [revenueData, setRevenueData] = useState([])
  const [loading, setLoading] = useState(true)

  const loadDashboardData = async () => {
    try {
      const results = await Promise.allSettled([
        dashboardService.getStats(),
        dashboardService.getOrdersChartData(7),
        dashboardService.getRevenueChartData(6),
      ]);

      if (results[0].status === 'fulfilled') {
        const s = results[0].value;
        setStats(s.data?.data || s.data || s);
      }
      
      if (results[1].status === 'fulfilled') {
        const o = results[1].value;
        setOrdersData(o.data?.orderStats || o.orderStats || []);
      }

      if (results[2].status === 'fulfilled') {
        const r = results[2].value;
        setRevenueData(r.data?.revenueStats || r.revenueStats || []);
      }
    } catch (error) {
      console.error('Render xatosi:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboardData() }, []);

  if (loading) return <div className="flex items-center justify-center h-screen font-medium">Dashboard yuklanmoqda...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Boshqaruv Paneli</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Foydalanuvchilar" value={stats?.users || 0} icon={Users} color="blue" />
        <StatCard title="Sotuvchilar" value={stats?.vendors || 0} icon={Store} color="green" />
        <StatCard title="Haydovchilar" value={stats?.drivers || 0} icon={Truck} color="purple" />
        <StatCard title="Buyurtmalar" value={stats?.orders || 0} icon={ShoppingBag} color="orange" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrdersChart data={ordersData} />
        <RevenueChart data={revenueData} />
      </div>
    </div>
  )
}
export default Dashboard
