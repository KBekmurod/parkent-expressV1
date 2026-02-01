import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const RevenueChart = ({ data }) => {
  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">Revenue Analytics</h3>
      
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#2563eb"
            fill="#3b82f6"
            fillOpacity={0.6}
            name="Revenue (UZS)"
          />
          <Area
            type="monotone"
            dataKey="commission"
            stroke="#10b981"
            fill="#34d399"
            fillOpacity={0.6}
            name="Commission (UZS)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default RevenueChart
