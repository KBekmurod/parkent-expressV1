'use client';
import { useEffect } from 'react';
import { useOrder } from '../../hooks/useOrders';
import { useSocket } from '../../hooks/useSocket';
import { useAuthContext } from '../../context/AuthContext';
import { usePushNotification } from '../../hooks/usePushNotification';
import OrderTimeline from './OrderTimeline';
import Spinner from '../ui/Spinner';
import { formatPrice, formatDate } from '../../utils/helpers';

const STATUS_LABELS = {
  pending:    '⏳ Kutilmoqda',
  accepted:   '✅ Qabul qilindi',
  preparing:  '👨‍🍳 Tayyorlanmoqda',
  ready:      '🍽️ Tayyor',
  assigned:   '🚴 Kuryer yo\'lda',
  picked_up:  '📦 Kuryer oldi',
  on_the_way: '🛵 Yo\'lda',
  delivered:  '🎉 Yetkazildi!',
  cancelled:  '❌ Bekor qilindi',
  rejected:   '❌ Rad etildi',
};

export default function OrderTracker({ orderId }) {
  const { order, loading, error, refetch } = useOrder(orderId);
  const { user } = useAuthContext();
  const { permission, requestPermission, sendLocalNotification } = usePushNotification();

  // Birinchi marta ochlganda push notification ruxsat so'rash
  useEffect(() => {
    if (permission === 'default') {
      requestPermission();
    }
  }, []);

  // Socket orqali real-time yangilash
  useSocket(user?.id, (data) => {
    if (data.orderId === orderId || data.orderId === order?._id) {
      refetch();
      // Push notification yuborish
      const statusLabel = STATUS_LABELS[data.status] || data.status;
      sendLocalNotification(
        'Parkent Express',
        `Buyurtma holati: ${statusLabel}`,
        { tag: `order-${orderId}`, renotify: true }
      );
    }
  });

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>;
  if (error) return <p className="text-center text-red-500 py-8">{error}</p>;
  if (!order) return <p className="text-center text-gray-500 py-8">Buyurtma topilmadi</p>;

  return (
    <div className="space-y-4">
      {/* Joriy holat banner */}
      <div className="bg-primary-50 border border-primary-200 rounded-2xl p-4 text-center">
        <p className="text-2xl font-bold text-primary-700">
          {STATUS_LABELS[order.status] || order.status}
        </p>
      </div>

      {/* Restoran va umumiy ma'lumot */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{order.vendor?.name || 'Restoran'}</h3>
            <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
          </div>
          <span className="text-primary-500 font-bold text-lg">
            {formatPrice(order.total || order.totalAmount)}
          </span>
        </div>
        <OrderTimeline currentStatus={order.status} statusHistory={order.timeline || order.statusHistory} />
      </div>

      {/* Kuryer ma'lumoti */}
      {order.driver && ['assigned', 'picked_up', 'on_the_way'].includes(order.status) && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h4 className="font-semibold text-gray-900 mb-2">🚴 Kuryer</h4>
          <p className="text-gray-700">
            {order.driver.firstName} {order.driver.lastName || ''}
          </p>
          {order.driver.phone && (
            <a
              href={`tel:${order.driver.phone}`}
              className="text-primary-600 text-sm font-medium"
            >
              📞 {order.driver.phone}
            </a>
          )}
        </div>
      )}

      {/* Buyurtma tarkibi */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Buyurtma tarkibi</h4>
        <div className="space-y-2">
          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-700">
                {typeof item.name === 'object'
                  ? (item.name?.uz || item.name?.ru || '')
                  : (item.product?.name?.uz || item.product?.name || item.name || '')}
                {' '}x{item.quantity}
              </span>
              <span className="font-medium">
                {formatPrice((item.price || item.product?.price || 0) * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t mt-3 pt-3 flex justify-between font-semibold">
          <span>Jami:</span>
          <span className="text-primary-600">
            {formatPrice(order.total || order.totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
