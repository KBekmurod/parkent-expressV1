import { Calendar } from 'lucide-react'

const DateRangePicker = ({ startDate, endDate, onChange }) => {
  const handleStartChange = (e) => {
    const newStartDate = new Date(e.target.value)
    
    // Ensure start date is not after end date
    if (newStartDate > endDate) {
      onChange({
        startDate: newStartDate,
        endDate: newStartDate,
      })
    } else {
      onChange({
        startDate: newStartDate,
        endDate,
      })
    }
  }

  const handleEndChange = (e) => {
    const newEndDate = new Date(e.target.value)
    
    // Ensure end date is not before start date
    if (newEndDate < startDate) {
      onChange({
        startDate: newEndDate,
        endDate: newEndDate,
      })
    } else {
      onChange({
        startDate,
        endDate: newEndDate,
      })
    }
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
