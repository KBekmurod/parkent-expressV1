'use client';
import { useOrder } from '../../hooks/useOrders';
import { useSocket } from '../../hooks/useSocket';
import { useAuthContext } from '../../context/AuthContext';
import OrderTimeline from './OrderTimeline';
import Spinner from '../ui/Spinner';
import { formatPrice, formatDate } from '../../utils/helpers';

export default function OrderTracker({ orderId }) {
  const { order, loading, error, refetch } = useOrder(orderId);
  const { user } = useAuthContext();

  useSocket(user?.id, (data) => {
    if (data.orderId === orderId) {
      refetch();
    }
  });

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>;
  if (error) return <p className="text-center text-red-500 py-8">{error}</p>;
  if (!order) return <p className="text-center text-gray-500 py-8">Buyurtma topilmadi</p>;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{order.vendor?.name || 'Restoran'}</h3>
            <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
          </div>
          <span className="text-primary-500 font-bold text-lg">{formatPrice(order.totalAmount)}</span>
        </div>
        <OrderTimeline currentStatus={order.status} statusHistory={order.statusHistory} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Buyurtma tarkibi</h4>
        <div className="space-y-2">
          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-700">
                {typeof item.name === 'object' ? (item.name.uz || item.name.ru) : item.name} x{item.quantity}
              </span>
              <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
