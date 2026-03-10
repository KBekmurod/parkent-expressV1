import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { formatDate, formatPrice, getStatusLabel, getStatusColor } from '../../utils/helpers';

export default function OrderCard({ order }) {
  return (
    <Link href={`/orders/${order._id}`} className="block bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-900">{order.vendor?.name || 'Restoran'}</p>
          <p className="text-sm text-gray-500 mt-0.5">{formatDate(order.createdAt)}</p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
          {getStatusLabel(order.status)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">
            {order.items?.slice(0, 2).map((item) => {
              const name = typeof item.name === 'object' ? (item.name.uz || item.name.ru) : item.name;
              return `${name} x${item.quantity}`;
            }).join(', ')}
            {order.items?.length > 2 && ` +${order.items.length - 2} ta`}
          </p>
          <p className="font-bold text-primary-500 mt-1">{formatPrice(order.totalAmount)}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </Link>
  );
}
