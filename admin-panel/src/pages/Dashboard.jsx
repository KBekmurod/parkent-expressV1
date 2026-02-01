const Dashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="card">
          <h3 className="text-gray-500 text-sm">Total Users</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        
        <div className="card">
          <h3 className="text-gray-500 text-sm">Total Vendors</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        
        <div className="card">
          <h3 className="text-gray-500 text-sm">Total Drivers</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        
        <div className="card">
          <h3 className="text-gray-500 text-sm">Total Orders</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
