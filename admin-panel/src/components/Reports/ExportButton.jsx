import { Download } from 'lucide-react'
import { exportToPDF, exportToCSV } from '../../utils/exportUtils'
import toast from 'react-hot-toast'

const ExportButton = ({ data, filename, type = 'pdf' }) => {
  const handleExport = async () => {
    try {
      if (type === 'pdf') {
        await exportToPDF(data, filename)
      } else if (type === 'csv') {
        await exportToCSV(data, filename)
      }
      toast.success(`Report exported successfully`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error(error.message || 'Failed to export report')
    }
  }

  return (
    <button
      onClick={handleExport}
      className="btn-primary flex items-center gap-2"
    >
      <Download size={20} />
      Export {type.toUpperCase()}
    </button>
  )
}

export default ExportButton
