'use client';
import PageWrapper from '../../../components/layout/PageWrapper';
import OrderCard from '../../../components/order/OrderCard';
import Spinner from '../../../components/ui/Spinner';
import { useOrders } from '../../../hooks/useOrders';
import { useAuthContext } from '../../../context/AuthContext';
import { ClipboardList } from 'lucide-react';
import Link from 'next/link';
import Button from '../../../components/ui/Button';

export default function OrdersPage() {
  const { user } = useAuthContext();
  const { orders, loading, error } = useOrders(user?.id);

  return (
    <PageWrapper>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Buyurtmalarim</h1>

      {loading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {error && <p className="text-center text-red-500 py-8">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <ClipboardList className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Buyurtmalar yo'q</h2>
          <p className="text-gray-500 mt-2 mb-6">Hali buyurtma bermadingiz</p>
          <Link href="/vendors"><Button variant="primary">Buyurtma berish</Button></Link>
        </div>
      )}

      <div className="space-y-3">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>
    </PageWrapper>
  );
}
