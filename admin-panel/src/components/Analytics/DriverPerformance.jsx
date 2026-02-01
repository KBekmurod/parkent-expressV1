import { Award, Package, Clock } from 'lucide-react'

const DriverPerformance = ({ data }) => {
  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">Top Performing Drivers</h3>
      
      <div className="space-y-4">
        {data?.map((driver, index) => (
          <div key={driver._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                #{index + 1}
              </div>
              <div>
                <p className="font-semibold">{driver.firstName} {driver.lastName}</p>
                <p className="text-sm text-gray-500">{driver.vehicle?.type}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Award size={16} className="text-yellow-500" />
                  <span className="font-medium">{driver.rating.toFixed(1)}</span>
                </div>
                <p className="text-sm text-gray-500">{driver.reviewCount} reviews</p>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Package size={16} className="text-blue-500" />
                  <span className="font-medium">{driver.deliveryCount}</span>
                </div>
                <p className="text-sm text-gray-500">deliveries</p>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Clock size={16} className="text-purple-500" />
                  <span className="font-medium">{driver.avgDeliveryTime} min</span>
                </div>
                <p className="text-sm text-gray-500">avg time</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DriverPerformance
