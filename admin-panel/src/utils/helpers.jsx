export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US').format(amount) + ' UZS'
}

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export const getStatusBadge = (status) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    accepted: { color: 'bg-blue-100 text-blue-800', label: 'Accepted' },
    preparing: { color: 'bg-purple-100 text-purple-800', label: 'Preparing' },
    ready: { color: 'bg-indigo-100 text-indigo-800', label: 'Ready' },
    assigned: { color: 'bg-cyan-100 text-cyan-800', label: 'Assigned' },
    picked_up: { color: 'bg-teal-100 text-teal-800', label: 'Picked Up' },
    on_the_way: { color: 'bg-orange-100 text-orange-800', label: 'On The Way' },
    delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
    cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
    rejected: { color: 'bg-gray-100 text-gray-800', label: 'Rejected' },
  }

  const config = statusConfig[status] || statusConfig.pending

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  )
}

export const getRoleBadge = (role) => {
  const roleConfig = {
    admin: { color: 'bg-purple-100 text-purple-800', label: 'Admin' },
    customer: { color: 'bg-blue-100 text-blue-800', label: 'Customer' },
    vendor: { color: 'bg-green-100 text-green-800', label: 'Vendor' },
    driver: { color: 'bg-orange-100 text-orange-800', label: 'Driver' },
  }

  const config = roleConfig[role] || roleConfig.customer

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  )
}
