import { Calendar } from 'lucide-react'

const DateRangePicker = ({ startDate, endDate, onChange }) => {
  const handleStartChange = (e) => {
    onChange({
      startDate: new Date(e.target.value),
      endDate,
    })
  }

  const handleEndChange = (e) => {
    onChange({
      startDate,
      endDate: new Date(e.target.value),
    })
  }

  const formatDate = (date) => {
    return date.toISOString().split('T')[0]
  }

  return (
    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border">
      <Calendar size={20} className="text-gray-400" />
      <input
        type="date"
        value={formatDate(startDate)}
        onChange={handleStartChange}
        className="border-none outline-none"
      />
      <span className="text-gray-400">to</span>
      <input
        type="date"
        value={formatDate(endDate)}
        onChange={handleEndChange}
        className="border-none outline-none"
      />
    </div>
  )
}

export default DateRangePicker
