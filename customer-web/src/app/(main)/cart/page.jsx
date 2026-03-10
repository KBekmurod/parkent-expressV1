'use client';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import PageWrapper from '../../../components/layout/PageWrapper';
import CartItem from '../../../components/cart/CartItem';
import CartSummary from '../../../components/cart/CartSummary';
import Button from '../../../components/ui/Button';
import { useCartContext } from '../../../context/CartContext';

export default function CartPage() {
  const { cart, count, total, clearCart, mounted } = useCartContext();

  if (!mounted) return null;

  if (count === 0) {
    return (
      <PageWrapper className="flex flex-col items-center justify-center min-h-[60vh]">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Savatcha bo'sh</h2>
        <p className="text-gray-500 mt-2 mb-6">Restoranlardan mahsulot qo'shing</p>
        <Link href="/vendors">
          <Button variant="primary">Restoranlar</Button>
        </Link>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Savatcha</h1>
        <button onClick={clearCart} className="text-red-500 text-sm font-medium hover:text-red-600">
          Tozalash
        </button>
      </div>

      <div className="space-y-3 mb-4">
        {cart.map((item) => (
          <CartItem key={item.productId} item={item} />
        ))}
      </div>

      <CartSummary total={total} itemCount={count} />

      <div className="mt-4">
        <Link href="/checkout">
          <Button variant="primary" fullWidth size="lg">
            Buyurtma berish
          </Button>
        </Link>
      </div>
    </PageWrapper>
  );
}
