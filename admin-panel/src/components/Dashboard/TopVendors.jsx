import { useEffect, useState } from 'react'
import { vendorService } from '../../services/vendorService'
import { Star } from 'lucide-react'

const TopVendors = () => {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVendors()
  }, [])

  const loadVendors = async () => {
    try {
      const data = await vendorService.getVendors({ 
        limit: 5, 
        sort: '-rating',
        status: 'active'
      })
      setVendors(data.vendors)
    } catch (error) {
      console.error('Error loading vendors:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="card">Loading...</div>

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">Top Vendors</h3>
      
      <div className="space-y-3">
        {vendors.map((vendor, index) => (
          <div key={vendor._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                {index + 1}
              </div>
              <div>
                <p className="font-medium">{vendor.name}</p>
                <p className="text-sm text-gray-500">{vendor.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <span className="font-medium">{vendor.rating.toFixed(1)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TopVendors
