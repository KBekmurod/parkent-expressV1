import { useState, useEffect } from 'react'
import { analyticsService } from '../services/analyticsService'
import DateRangePicker from '../components/Analytics/DateRangePicker'
import RevenueChart from '../components/Analytics/RevenueChart'
import OrdersAnalytics from '../components/Analytics/OrdersAnalytics'
import VendorPerformance from '../components/Analytics/VendorPerformance'
import DriverPerformance from '../components/Analytics/DriverPerformance'
import MetricsGrid from '../components/Reports/MetricsGrid'
import ExportButton from '../components/Reports/ExportButton'
import toast from 'react-hot-toast'

const Analytics = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date(),
  })
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [dateRange])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const data = await analyticsService.getAnalytics({
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      })
      setAnalytics(data)
    } catch (error) {
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Analytics & Insights</h1>
        <div className="flex gap-3">
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={setDateRange}
          />
          <ExportButton
            data={analytics}
            filename="analytics-report"
            type="pdf"
          />
        </div>
      </div>

      {/* Metrics Overview */}
      <MetricsGrid metrics={analytics?.metrics} />

      {/* Revenue Chart */}
      <div className="mb-6">
        <RevenueChart data={analytics?.revenueData} />
      </div>

      {/* Orders Analytics */}
      <div className="mb-6">
        <OrdersAnalytics data={analytics?.ordersData} />
      </div>

      {/* Performance Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VendorPerformance data={analytics?.vendorPerformance} />
        <DriverPerformance data={analytics?.driverPerformance} />
      </div>
    </div>
  )
}

export default Analytics
