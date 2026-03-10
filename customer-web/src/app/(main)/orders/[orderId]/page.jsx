'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PageWrapper from '../../../../components/layout/PageWrapper';
import OrderTracker from '../../../../components/order/OrderTracker';

export default function OrderDetailPage() {
  const { orderId } = useParams();

  return (
    <PageWrapper>
      <div className="flex items-center gap-3 mb-5">
        <Link href="/orders" className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Buyurtma holati</h1>
      </div>
      <OrderTracker orderId={orderId} />
    </PageWrapper>
  );
}
