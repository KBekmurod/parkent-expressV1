import Link from 'next/link';
import { ChevronRight, Clock } from 'lucide-react';
import { formatDate, formatPrice, getStatusLabel, getStatusColor } from '../../utils/helpers';

const getItemName = (item) => {
  if (!item) return 'Mahsulot';
  // item.name mavjud bo'lsa
  if (item.name) {
    if (typeof item.name === 'object') return item.name.uz || item.name.ru || 'Mahsulot';
    if (typeof item.name === 'string' && item.name !== 'undefined') return item.name;
  }
  // item.product.name
  if (item.product?.name) {
    if (typeof item.product.name === 'object') return item.product.name.uz || item.product.name.ru || 'Mahsulot';
    return item.product.name;
  }
  return 'Mahsulot';
};

const getOrderTotal = (order) => {
  // total yoki totalAmount
  const amount = order.total || order.totalAmount || 0;
  if (amount > 0) return amount;
  // items dan hisoblash
  return (order.items || []).reduce((sum, item) => {
    const price = item.price || item.product?.price || 0;
    return sum + price * (item.quantity || 1);
  }, 0);
};

export default function OrderCard({ order }) {
  const total = getOrderTotal(order);
  const vendorName = order.vendor?.name || 'Restoran';

  return (
    <Link href={`/orders/${order._id}`}
      className="block bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-900">{vendorName}</p>
          <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
            <Clock className="w-3 h-3" />
            {formatDate(order.createdAt)}
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
          {getStatusLabel(order.status)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 truncate">
            {(order.items || []).slice(0, 2).map((item, i) => (
              `${getItemName(item)} x${item.quantity || 1}`
            )).join(', ')}
            {(order.items || []).length > 2 && ` +${order.items.length - 2} ta`}
          </p>
          <p className="font-bold text-orange-500 mt-1">
            {total > 0 ? formatPrice(total) : '—'}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
      </div>
    </Link>
  );
}
