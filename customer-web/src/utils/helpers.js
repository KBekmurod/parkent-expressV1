export const formatPrice = (price) => {
  if (!price && price !== 0) return '0';
  return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getProductName = (product) => {
  if (!product?.name) return '';
  if (typeof product.name === 'string') return product.name;
  return product.name.uz || product.name.ru || '';
};

export const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    preparing: 'bg-indigo-100 text-indigo-800',
    ready: 'bg-purple-100 text-purple-800',
    assigned: 'bg-pink-100 text-pink-800',
    picked_up: 'bg-orange-100 text-orange-800',
    on_the_way: 'bg-cyan-100 text-cyan-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getStatusLabel = (status) => {
  const labels = {
    pending: 'Kutilmoqda',
    accepted: 'Qabul qilindi',
    preparing: 'Tayyorlanmoqda',
    ready: 'Tayyor',
    assigned: 'Haydovchi tayinlandi',
    picked_up: 'Olib ketildi',
    on_the_way: "Yo'lda",
    delivered: 'Yetkazildi',
    cancelled: 'Bekor qilindi',
    rejected: 'Rad etildi',
  };
  return labels[status] || status;
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};
