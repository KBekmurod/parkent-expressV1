const Table = ({ columns, data, onEdit, onDelete, loading }) => {
  if (loading) {
    return <div className="card">Loading...</div>
  }

  if (!data || data.length === 0) {
    return (
      <div className="card text-center py-8 text-gray-500">
        No data available
      </div>
    )
  }

  const hasActions = onEdit || onDelete

  return (
    <div className="card overflow-x-auto">
      <table className="w-full">
        <thead className="border-b">
          <tr className="text-left">
            {columns.map((column) => (
              <th key={column.key} className="pb-3 font-medium text-gray-600">
                {column.label}
              </th>
            ))}
            {hasActions && (
              <th className="pb-3 font-medium text-gray-600">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {(data || []).map((row) => (
            <tr key={row._id} className="border-b hover:bg-gray-50">
              {columns.map((column) => (
                <td key={column.key} className="py-3">
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
              {hasActions && (
                <td className="py-3">
                  <div className="flex gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table
