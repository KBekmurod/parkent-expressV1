import { useEffect, useState, useCallback } from 'react'
import { Users, Store, Truck, ShoppingBag, Clock, AlertCircle } from 'lucide-react'
import StatCard from '../components/Dashboard/StatCard'
import OrdersChart from '../components/charts/OrdersChart'
import RevenueChart from '../components/charts/RevenueChart'
import { dashboardService } from '../services/dashboardService'
import { useAdminSocket } from '../hooks/useAdminSocket'
import toast from 'react-hot-toast'
import api from '../services/api'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [ordersData, setOrdersData] = useState([])
  const [revenueData, setRevenueData] = useState([])
  const [loading, setLoading] = useState(true)
  const [pendingCounts, setPendingCounts] = useState({ vendors: 0, drivers: 0 })

  const loadDashboardData = async () => {
    try {
      const results = await Promise.allSettled([
        dashboardService.getStats(),
        dashboardService.getOrdersChartData(7),
        dashboardService.getRevenueChartData(6),
        api.get('/vendors?status=pending&limit=1'),
        api.get('/drivers?status=pending&limit=1'),
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
      if (results[3].status === 'fulfilled') {
        const v = results[3].value;
        setPendingCounts(p => ({ ...p, vendors: v.data?.total || v.total || 0 }));
      }
      if (results[4].status === 'fulfilled') {
        const d = results[4].value;
        setPendingCounts(p => ({ ...p, drivers: d.data?.total || d.total || 0 }));
      }
    } catch (error) {
      console.error('Dashboard xatosi:', error);
    } finally {
      setLoading(false);
    }
  };

  // Real-time: yangi buyurtma keldi
  const handleNewOrder = useCallback((data) => {
    toast.success(`📦 Yangi buyurtma! #${data?.order?.orderNumber || ''}`, {
      duration: 5000,
      icon: '🔔'
    });
    // Statistikani yangilash
    setStats(s => s ? { ...s, orders: (s.orders || 0) + 1 } : s);
  }, []);

  // Real-time: yangi vendor ariza berdi
  const handleNewVendor = useCallback((data) => {
    toast(`🏪 Yangi restoran ariza berdi: ${data?.name || ''}`, {
      duration: 6000,
      icon: '🔔'
    });
    setPendingCounts(p => ({ ...p, vendors: p.vendors + 1 }));
  }, []);

  // Real-time: yangi driver ariza berdi
  const handleNewDriver = useCallback((data) => {
    toast(`🚴 Yangi kuryer ariza berdi: ${data?.firstName || ''}`, {
      duration: 6000,
      icon: '🔔'
    });
    setPendingCounts(p => ({ ...p, drivers: p.drivers + 1 }));
  }, []);

  useAdminSocket({
    onNewOrder: handleNewOrder,
    onNewVendor: handleNewVendor,
    onNewDriver: handleNewDriver,
  });

  useEffect(() => { loadDashboardData() }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-screen font-medium text-gray-500">
      Dashboard yuklanmoqda...
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Boshqaruv Paneli</h1>
        <button
          onClick={loadDashboardData}
          className="text-sm text-primary-600 hover:underline"
        >
          🔄 Yangilash
        </button>
      </div>

      {/* Asosiy statistika */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Foydalanuvchilar" value={stats?.users || 0} icon={Users} color="blue" />
        <StatCard title="Sotuvchilar" value={stats?.vendors || 0} icon={Store} color="green" />
        <StatCard title="Haydovchilar" value={stats?.drivers || 0} icon={Truck} color="purple" />
        <StatCard title="Buyurtmalar" value={stats?.orders || 0} icon={ShoppingBag} color="orange" />
      </div>

      {/* Kutayotganlar */}
      {(pendingCounts.vendors > 0 || pendingCounts.drivers > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingCounts.vendors > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle size={24} className="text-yellow-600 shrink-0" />
              <div>
                <p className="font-semibold text-yellow-800">
                  {pendingCounts.vendors} ta restoran tasdiqlash kutmoqda
                </p>
                <a href="/vendors" className="text-sm text-yellow-600 hover:underline">
                  Vendors sahifasiga o'tish →
                </a>
              </div>
            </div>
          )}
          {pendingCounts.drivers > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle size={24} className="text-blue-600 shrink-0" />
              <div>
                <p className="font-semibold text-blue-800">
                  {pendingCounts.drivers} ta kuryer tasdiqlash kutmoqda
                </p>
                <a href="/drivers" className="text-sm text-blue-600 hover:underline">
                  Drivers sahifasiga o'tish →
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Faol buyurtmalar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <Clock size={24} className="text-green-600 shrink-0" />
          <div>
            <p className="font-semibold text-green-800">
              {stats?.pendingOrders || 0} ta faol buyurtma
            </p>
            <p className="text-sm text-green-600">Hozir ishlanayotgan buyurtmalar</p>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center gap-3">
          <Truck size={24} className="text-purple-600 shrink-0" />
          <div>
            <p className="font-semibold text-purple-800">
              {stats?.activeDrivers || 0} ta kuryer online
            </p>
            <p className="text-sm text-purple-600">Hozir online haydovchilar</p>
          </div>
        </div>
      </div>

      {/* Grafiklar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrdersChart data={ordersData} />
        <RevenueChart data={revenueData} />
      </div>
    </div>
  );
};

export default Dashboard;
