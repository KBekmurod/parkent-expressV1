import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const OrdersChart = ({ data }) => {
  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">Orders Overview</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="orders" 
            stroke="#2563eb" 
            strokeWidth={2}
            name="Total Orders"
          />
          <Line 
            type="monotone" 
            dataKey="completed" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Completed"
          />
          <Line 
            type="monotone" 
            dataKey="cancelled" 
            stroke="#ef4444" 
            strokeWidth={2}
            name="Cancelled"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default OrdersChart
