import { Star, TrendingUp, Package } from 'lucide-react'

const VendorPerformance = ({ data }) => {
  // Guard against null/undefined or empty data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Top Performing Vendors</h3>
        <div className="flex items-center justify-center h-[200px] text-gray-400">
          No data available
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">Top Performing Vendors</h3>
      
      <div className="space-y-4">
        {data?.map((vendor, index) => (
          <div key={vendor._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                #{index + 1}
              </div>
              <div>
                <p className="font-semibold">{vendor.name}</p>
                <p className="text-sm text-gray-500">{vendor.category}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{vendor.rating.toFixed(1)}</span>
                </div>
                <p className="text-sm text-gray-500">{vendor.reviewCount} reviews</p>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Package size={16} className="text-blue-500" />
                  <span className="font-medium">{vendor.orderCount}</span>
                </div>
                <p className="text-sm text-gray-500">orders</p>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp size={16} />
                  <span className="font-medium">{vendor.revenue.toLocaleString()} UZS</span>
                </div>
                <p className="text-sm text-gray-500">revenue</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default VendorPerformance
