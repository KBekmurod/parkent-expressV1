const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 border rounded-lg disabled:opacity-50"
      >
        Previous
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 border rounded-lg ${
            currentPage === page
              ? 'bg-primary-600 text-white'
              : 'hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 border rounded-lg disabled:opacity-50"
      >
        Next
      </button>
    </div>
  )
}

export default Pagination
