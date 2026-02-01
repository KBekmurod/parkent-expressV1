import { AreaChart as RechartsArea, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const AreaChart = ({ data, title, dataKeys }) => {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

  return (
    <div className="card">
      {title && <h3 className="text-xl font-bold mb-4">{title}</h3>}
      
      <ResponsiveContainer width="100%" height={300}>
        <RechartsArea data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          {dataKeys?.map((key, index) => (
            <Area
              key={key.key}
              type="monotone"
              dataKey={key.key}
              stroke={colors[index % colors.length]}
              fill={colors[index % colors.length]}
              fillOpacity={0.6}
              name={key.name}
            />
          ))}
        </RechartsArea>
      </ResponsiveContainer>
    </div>
  )
}

export default AreaChart
