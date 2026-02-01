export const exportToPDF = async (data, filename) => {
  // Simple PDF export using browser print
  const printWindow = window.open('', '_blank')
  
  if (!printWindow) {
    throw new Error('Popup blocked! Please allow popups for this site to export reports.')
  }
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #2563eb; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f3f4f6; }
      </style>
    </head>
    <body>
      <h1>Analytics Report</h1>
      <p>Generated on: ${new Date().toLocaleDateString()}</p>
      <pre>${JSON.stringify(data, null, 2)}</pre>
    </body>
    </html>
  `
  
  printWindow.document.write(htmlContent)
  printWindow.document.close()
  printWindow.print()
}

const escapeCSVValue = (value) => {
  if (value === null || value === undefined) {
    return ''
  }
  
  const stringValue = String(value)
  
  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  
  return stringValue
}

export const exportToCSV = (data, filename) => {
  // Convert data to CSV format
  const csv = convertToCSV(data)
  
  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const convertToCSV = (data) => {
  if (!data || typeof data !== 'object') {
    return ''
  }

  // Handle array of objects
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return ''
    }
    
    const headers = Object.keys(data[0])
    const headerRow = headers.map(escapeCSVValue).join(',')
    
    const rows = data.map(row => 
      headers.map(header => {
        const value = row[header]
        return typeof value === 'object' ? escapeCSVValue(JSON.stringify(value)) : escapeCSVValue(value)
      }).join(',')
    )
    
    return [headerRow, ...rows].join('\n')
  }

  // Handle single object
  const headers = Object.keys(data)
  const values = Object.values(data).map(v => 
    typeof v === 'object' ? escapeCSVValue(JSON.stringify(v)) : escapeCSVValue(v)
  )

  return [headers.map(escapeCSVValue).join(','), values.join(',')].join('\n')
}
