import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const RevenueChart = ({ data }) => {
  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">Revenue Overview</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="revenue" fill="#2563eb" name="Revenue (UZS)" />
          <Bar dataKey="commission" fill="#10b981" name="Commission (UZS)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default RevenueChart
