const Table = ({ columns, data = [], onEdit, onDelete, loading }) => {
  if (loading) {
    return <div className="card animate-pulse py-10 text-center">Yuklanmoqda...</div>;
  }

  // Ma'lumot mavjudligini xavfsiz tekshirish
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="card text-center py-8 text-gray-500">
        Ma'lumot topilmadi
      </div>
    );
  }

  const hasActions = onEdit || onDelete;

  return (
    <div className="card overflow-x-auto shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 border-b">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 font-semibold text-gray-700">
                {column.label}
              </th>
            ))}
            {hasActions && <th className="px-4 py-3 font-semibold text-gray-700 text-right">Amallar</th>}
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((row, idx) => (
            <tr key={row._id || idx} className="hover:bg-gray-50 transition-colors">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-gray-600">
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
              {hasActions && (
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    {onEdit && (
                      <button onClick={() => onEdit(row)} className="text-indigo-600 hover:text-indigo-900 font-medium">
                        Tahrirlash
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(row)} className="text-red-600 hover:text-red-900 font-medium">
                        O'chirish
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
  );
};

export default Table;
