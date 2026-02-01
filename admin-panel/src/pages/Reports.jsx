import { useState, useEffect } from 'react'
import { analyticsService } from '../services/analyticsService'
import MetricsGrid from '../components/Reports/MetricsGrid'
import ExportButton from '../components/Reports/ExportButton'
import PieChart from '../components/charts/PieChart'
import AreaChart from '../components/charts/AreaChart'
import toast from 'react-hot-toast'

const Reports = () => {
  const [reports, setReports] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    setLoading(true)
    try {
      const data = await analyticsService.getAnalytics()
      setReports(data)
    } catch (error) {
      console.error('Reports error:', error)
      toast.error(error.response?.data?.message || error.message || 'Failed to load reports')
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
        <h1 className="text-3xl font-bold">Reports</h1>
        <div className="flex gap-3">
          <ExportButton
            data={reports}
            filename="reports"
            type="csv"
          />
          <ExportButton
            data={reports}
            filename="reports"
            type="pdf"
          />
        </div>
      </div>

      {/* Metrics Overview */}
      <MetricsGrid metrics={reports?.metrics} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PieChart 
          data={reports?.ordersData?.byStatus} 
          title="Orders Distribution" 
        />
        <AreaChart 
          data={reports?.revenueData}
          title="Revenue Trend"
          dataKeys={[
            { key: 'revenue', name: 'Revenue' },
            { key: 'commission', name: 'Commission' }
          ]}
        />
      </div>
    </div>
  )
}

export default Reports
