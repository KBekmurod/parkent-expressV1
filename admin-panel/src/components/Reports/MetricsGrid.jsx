import { DollarSign, ShoppingBag, TrendingUp, Users } from 'lucide-react'

const MetricsGrid = ({ metrics }) => {
  const metricCards = [
    {
      title: 'Total Revenue',
      value: `${metrics?.totalRevenue?.toLocaleString()} UZS`,
      change: metrics?.revenueGrowth,
      icon: DollarSign,
      color: 'blue',
    },
    {
      title: 'Total Orders',
      value: metrics?.totalOrders,
      change: metrics?.ordersGrowth,
      icon: ShoppingBag,
      color: 'green',
    },
    {
      title: 'Average Order Value',
      value: `${metrics?.avgOrderValue?.toLocaleString()} UZS`,
      change: metrics?.avgOrderGrowth,
      icon: TrendingUp,
      color: 'purple',
    },
    {
      title: 'Active Users',
      value: metrics?.activeUsers,
      change: metrics?.usersGrowth,
      icon: Users,
      color: 'orange',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {metricCards.map((metric, index) => (
        <div key={index} className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">{metric.title}</p>
            <metric.icon size={20} className={`text-${metric.color}-600`} />
          </div>
          <h3 className="text-2xl font-bold mb-1">{metric.value}</h3>
          {metric.change && (
            <p className={`text-sm ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {metric.change >= 0 ? '+' : ''}{metric.change}% from last period
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

export default MetricsGrid
